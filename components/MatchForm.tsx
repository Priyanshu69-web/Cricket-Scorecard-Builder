"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoFixHighRoundedIcon from "@mui/icons-material/AutoFixHighRounded";
import SportsCricketRoundedIcon from "@mui/icons-material/SportsCricketRounded";
import PlayerForm from "@/components/PlayerForm";
import PlayerPicker from "@/components/PlayerPicker";
import { createMatch, quickPlayers } from "@/lib/cricket";
import { createMatchRecord } from "@/lib/cricket-api";
import { MatchFormat, PlayerProfile } from "@/types/cricket";

const formatOptions: Array<{ label: string; value: MatchFormat; overs: number }> = [
  { label: "T20", value: "T20", overs: 20 },
  { label: "ODI", value: "ODI", overs: 50 },
  { label: "Test", value: "Test", overs: 90 },
  { label: "Custom", value: "Custom", overs: 10 },
];

function listToPlayers(input: string, fallbackName: string) {
  const players = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (players.length >= 11) {
    return players.slice(0, 11);
  }

  return quickPlayers(fallbackName);
}

function pickPlayers(
  selectedIds: string[],
  profiles: PlayerProfile[],
  textInput: string,
  fallbackName: string
) {
  if (selectedIds.length >= 11) {
    return selectedIds
      .slice(0, 11)
      .map((id) => profiles.find((item) => item._id === id))
      .filter((value): value is PlayerProfile => Boolean(value))
      .map((player) => ({ name: player.name, profileId: player._id }));
  }
  return listToPlayers(textInput, fallbackName);
}

export default function MatchForm() {
  const router = useRouter();
  const [teamAName, setTeamAName] = useState("Mumbai Mavericks");
  const [teamBName, setTeamBName] = useState("Delhi Daredevils");
  const [format, setFormat] = useState<MatchFormat>("T20");
  const [oversLimit, setOversLimit] = useState(20);
  const [venue, setVenue] = useState("Wankhede Stadium");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [tossWinner, setTossWinner] = useState<"teamA" | "teamB">("teamA");
  const [tossDecision, setTossDecision] = useState<"bat" | "bowl">("bat");
  const [teamAPlayers, setTeamAPlayers] = useState(quickPlayers("Mumbai Mavericks").join("\n"));
  const [teamBPlayers, setTeamBPlayers] = useState(quickPlayers("Delhi Daredevils").join("\n"));
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [selectedTeamAIds, setSelectedTeamAIds] = useState<string[]>([]);
  const [selectedTeamBIds, setSelectedTeamBIds] = useState<string[]>([]);

  async function loadProfiles() {
    const res = await fetch("/api/players");
    const data = await res.json();
    setProfiles(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadProfiles().catch(() => setProfiles([]));
  }, []);

  const selectableProfiles = useMemo(() => profiles.slice(0, 120), [profiles]);
  const selectionReady = selectedTeamAIds.length === 11 && selectedTeamBIds.length === 11;

  function quickStart() {
    const nextTeamA = "Mumbai Mavericks";
    const nextTeamB = "Delhi Daredevils";
    setTeamAName(nextTeamA);
    setTeamBName(nextTeamB);
    setFormat("T20");
    setOversLimit(20);
    setVenue("Wankhede Stadium");
    setDate(new Date().toISOString().slice(0, 10));
    setTossWinner("teamA");
    setTossDecision("bat");
    setTeamAPlayers(quickPlayers(nextTeamA).join("\n"));
    setTeamBPlayers(quickPlayers(nextTeamB).join("\n"));
    setSelectedTeamAIds([]);
    setSelectedTeamBIds([]);
  }

  function updateFormat(nextFormat: MatchFormat) {
    setFormat(nextFormat);
    const config = formatOptions.find((option) => option.value === nextFormat);
    if (config) {
      setOversLimit(config.overs);
    }
  }

  async function handleCreate() {
    const match = createMatch({
      teamAName,
      teamBName,
      format,
      oversLimit,
      tossWinner,
      tossDecision,
      venue,
      date,
      teamAPlayers: pickPlayers(selectedTeamAIds, profiles, teamAPlayers, teamAName),
      teamBPlayers: pickPlayers(selectedTeamBIds, profiles, teamBPlayers, teamBName),
    });

    await createMatchRecord(match);
    router.push(`/scorecard/${match.id}`);
  }

  async function handleCreateInlinePlayer(
    team: "A" | "B",
    payload: {
      name: string;
      role: PlayerProfile["role"];
      battingStyle: PlayerProfile["battingStyle"];
      bowlingStyle: string;
      imageUrl: string;
    }
  ) {
    const res = await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const created = await res.json();
    await loadProfiles();
    if (created?._id) {
      if (team === "A") {
        setSelectedTeamAIds((value) =>
          value.length < 11 && !value.includes(created._id) ? [...value, created._id] : value
        );
      } else {
        setSelectedTeamBIds((value) =>
          value.length < 11 && !value.includes(created._id) ? [...value, created._id] : value
        );
      }
    }
  }

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, border: "1px solid #d8e1ee" }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" } }}
        >
          <Box>
            <Typography variant="h2" sx={{ fontSize: { xs: "1.2rem", md: "1.4rem" } }}>
              Create match
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cricbuzz-inspired compact flow for team setup, player selection, and toss details.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<AutoFixHighRoundedIcon />} onClick={quickStart}>
            Quick fill
          </Button>
        </Stack>

        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth size="small" label="Team A" value={teamAName} onChange={(e) => setTeamAName(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth size="small" label="Team B" value={teamBName} onChange={(e) => setTeamBName(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              select
              size="small"
              label="Format"
              value={format}
              onChange={(e) => updateFormat(e.target.value as MatchFormat)}
            >
              {formatOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Overs"
              value={oversLimit}
              onChange={(e) => setOversLimit(Number(e.target.value || 20))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField fullWidth size="small" label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              size="small"
              label="Toss winner"
              value={tossWinner}
              onChange={(e) => setTossWinner(e.target.value as "teamA" | "teamB")}
            >
              <MenuItem value="teamA">{teamAName}</MenuItem>
              <MenuItem value="teamB">{teamBName}</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              size="small"
              label="Decision"
              value={tossDecision}
              onChange={(e) => setTossDecision(e.target.value as "bat" | "bowl")}
            >
              <MenuItem value="bat">Bat first</MenuItem>
              <MenuItem value="bowl">Bowl first</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: "wrap", gap: 1 }}>
          <Chip size="small" label={`${format} setup`} color="primary" />
          <Chip size="small" variant="outlined" label={`${oversLimit} overs`} />
          <Chip size="small" variant="outlined" label={`${teamAName} vs ${teamBName}`} />
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PlayerPicker
            title={`${teamAName} squad`}
            players={selectableProfiles}
            selectedIds={selectedTeamAIds}
            disabledIds={selectedTeamBIds}
            onChange={setSelectedTeamAIds}
            onCreatePlayer={(payload) => handleCreateInlinePlayer("A", payload)}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <PlayerPicker
            title={`${teamBName} squad`}
            players={selectableProfiles}
            selectedIds={selectedTeamBIds}
            disabledIds={selectedTeamAIds}
            onChange={setSelectedTeamBIds}
            onCreatePlayer={(payload) => handleCreateInlinePlayer("B", payload)}
          />
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 1.5, md: 2 }, borderRadius: 3, border: "1px solid #d8e1ee" }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ justifyContent: "space-between" }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Manual fallback squads
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If you do not pick a full XI, the textarea squad remains the backup source.
            </Typography>
          </Box>
          {selectionReady ? (
            <Alert severity="success" sx={{ py: 0 }}>
              Both XIs are locked in and ready.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ py: 0 }}>
              Select 11 players on each side for the best experience.
            </Alert>
          )}
        </Stack>
        <Divider sx={{ my: 1.5 }} />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <PlayerForm label={`${teamAName} squad`} value={teamAPlayers} onChange={setTeamAPlayers} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <PlayerForm label={`${teamBName} squad`} value={teamBPlayers} onChange={setTeamBPlayers} />
          </Grid>
        </Grid>
      </Paper>

      <Button
        onClick={handleCreate}
        size="large"
        variant="contained"
        startIcon={<SportsCricketRoundedIcon />}
        sx={{ py: 1.2, borderRadius: 3 }}
      >
        Start live scoring
      </Button>
    </Stack>
  );
}
