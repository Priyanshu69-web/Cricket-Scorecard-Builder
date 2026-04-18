"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";
import { PlayerProfile } from "@/types/cricket";

type PlayerPickerProps = {
  title: string;
  players: PlayerProfile[];
  selectedIds: string[];
  disabledIds?: string[];
  onChange: (ids: string[]) => void;
  onCreatePlayer: (payload: {
    name: string;
    role: PlayerProfile["role"];
    battingStyle: PlayerProfile["battingStyle"];
    bowlingStyle: string;
    imageUrl: string;
  }) => Promise<void>;
};

function profileScore(player: PlayerProfile) {
  return (
    player.matchesPlayed * 10 +
    player.batting.runs * 0.35 +
    player.bowling.wickets * 18 +
    player.batting.strikeRate * 0.12
  );
}

function initial(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

const roleOrder: PlayerProfile["role"][] = [
  "Wicketkeeper",
  "All-rounder",
  "Batsman",
  "Bowler",
];

export default function PlayerPicker({
  title,
  players,
  selectedIds,
  disabledIds = [],
  onChange,
  onCreatePlayer,
}: PlayerPickerProps) {
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState<PlayerProfile | null>(null);
  const [role, setRole] = useState<PlayerProfile["role"]>("Batsman");
  const [battingStyle, setBattingStyle] = useState<PlayerProfile["battingStyle"]>("Right");
  const [bowlingStyle, setBowlingStyle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...players]
      .filter((player) => {
        if (!query) {
          return true;
        }
        return [player.name, player.role, player.bowlingStyle || ""].some((value) =>
          value.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        const aSelected = selectedIds.includes(a._id) ? 1 : 0;
        const bSelected = selectedIds.includes(b._id) ? 1 : 0;
        if (aSelected !== bSelected) {
          return bSelected - aSelected;
        }
        return profileScore(b) - profileScore(a);
      });
  }, [players, search, selectedIds]);

  function togglePlayer(id: string) {
    if (disabledIds.includes(id)) {
      return;
    }
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
      return;
    }
    if (selectedIds.length >= 11) {
      return;
    }
    onChange([...selectedIds, id]);
  }

  function autoPick() {
    const available = players.filter((player) => !disabledIds.includes(player._id));
    const chosen: string[] = [];

    for (const roleName of roleOrder) {
      const match = available
        .filter((player) => player.role === roleName && !chosen.includes(player._id))
        .sort((a, b) => profileScore(b) - profileScore(a))[0];
      if (match) {
        chosen.push(match._id);
      }
    }

    for (const player of available.sort((a, b) => profileScore(b) - profileScore(a))) {
      if (chosen.length >= 11) {
        break;
      }
      if (!chosen.includes(player._id)) {
        chosen.push(player._id);
      }
    }

    onChange(chosen.slice(0, 11));
  }

  async function handleCreate() {
    const name = search.trim();
    if (!name) {
      return;
    }
    await onCreatePlayer({
      name,
      role,
      battingStyle,
      bowlingStyle,
      imageUrl,
    });
    setCreateOpen(false);
    setBowlingStyle("");
    setImageUrl("");
    setRole("Batsman");
    setBattingStyle("Right");
  }

  return (
    <Box
      sx={{
        border: "1px solid #d8e1ee",
        borderRadius: 3,
        bgcolor: "#fff",
        p: 1.5,
      }}
    >
      <Stack direction="row" sx={{ mb: 1.25, justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Compact mobile-first selector with profile preview.
          </Typography>
        </Box>
        <Chip size="small" label={`${selectedIds.length}/11`} color="primary" variant="outlined" />
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1.25 }}>
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search player, role, style"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <PersonSearchRoundedIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={autoPick}
          >
            Best XI
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddCircleOutlineRoundedIcon />}
            onClick={() => setCreateOpen(true)}
          >
            New
          </Button>
        </Stack>
      </Stack>

      {selectedIds.length > 0 ? (
        <Stack direction="row" sx={{ mb: 1.25, flexWrap: "wrap", gap: 0.75 }}>
          {selectedIds.map((id) => {
            const player = players.find((item) => item._id === id);
            if (!player) return null;
            return (
              <Chip
                key={id}
                size="small"
                color="primary"
                label={player.name}
                onDelete={() => togglePlayer(id)}
              />
            );
          })}
        </Stack>
      ) : null}

      <List
        disablePadding
        sx={{
          maxHeight: 430,
          overflowY: "auto",
          border: "1px solid #e6edf6",
          borderRadius: 2,
          bgcolor: "#fbfdff",
        }}
      >
        {filtered.map((player, index) => {
          const checked = selectedIds.includes(player._id);
          const disabled = disabledIds.includes(player._id);
          return (
            <Box key={player._id}>
              <ListItemButton
                dense
                disabled={disabled}
                onClick={() => togglePlayer(player._id)}
                sx={{ alignItems: "flex-start", py: 1, px: 1.25 }}
              >
                <Avatar src={player.imageUrl} sx={{ width: 36, height: 36, mr: 1.25, fontSize: 13 }}>
                  {initial(player.name)}
                </Avatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {player.name}
                      </Typography>
                      {checked ? (
                        <CheckCircleRoundedIcon color="success" fontSize="small" />
                      ) : null}
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5} sx={{ mt: 0.25 }}>
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                        <Chip size="small" label={player.role} />
                        <Chip size="small" variant="outlined" label={`${player.matchesPlayed} matches`} />
                        <Chip size="small" variant="outlined" label={`${player.batting.runs} runs`} />
                        <Chip size="small" variant="outlined" label={`${player.bowling.wickets} wkts`} />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Bat {player.battingStyle} • Bowl {player.bowlingStyle || "-"} • Avg {player.batting.average} • Econ {player.bowling.economy}
                      </Typography>
                    </Stack>
                  }
                />
                <Tooltip title="Open profile">
                  <IconButton
                    component={Link}
                    href={`/players/${player._id}`}
                    size="small"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <OpenInNewRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Button
                  size="small"
                  variant="text"
                  onClick={(event) => {
                    event.stopPropagation();
                    setPreviewPlayer(player);
                  }}
                >
                  View
                </Button>
              </ListItemButton>
              {index < filtered.length - 1 ? <Divider /> : null}
            </Box>
          );
        })}
      </List>

      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        Selected players are locked for this team. Players already chosen for the other team stay disabled here.
      </Typography>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Add player profile</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <Stack spacing={1.25}>
            <TextField
              label="Player name"
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <TextField
              select
              label="Role"
              size="small"
              value={role}
              onChange={(event) => setRole(event.target.value as PlayerProfile["role"])}
            >
              {["Batsman", "Bowler", "All-rounder", "Wicketkeeper"].map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Batting style"
              size="small"
              value={battingStyle}
              onChange={(event) => setBattingStyle(event.target.value as PlayerProfile["battingStyle"])}
            >
              {["Right", "Left"].map((value) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Bowling style"
              size="small"
              value={bowlingStyle}
              onChange={(event) => setBowlingStyle(event.target.value)}
            />
            <TextField
              label="Avatar URL"
              size="small"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained">
            Save player
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(previewPlayer)} onClose={() => setPreviewPlayer(null)} fullWidth maxWidth="sm">
        <DialogTitle>Player quick profile</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          {previewPlayer ? (
            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                <Avatar src={previewPlayer.imageUrl} sx={{ width: 54, height: 54 }}>
                  {initial(previewPlayer.name)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {previewPlayer.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {previewPlayer.role} • {previewPlayer.matchesPlayed} matches
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                <Chip label={`${previewPlayer.batting.runs} runs`} />
                <Chip label={`Avg ${previewPlayer.batting.average}`} variant="outlined" />
                <Chip label={`SR ${previewPlayer.batting.strikeRate}`} variant="outlined" />
                <Chip label={`${previewPlayer.bowling.wickets} wickets`} />
                <Chip label={`Econ ${previewPlayer.bowling.economy}`} variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Batting style: {previewPlayer.battingStyle} handed. Bowling style: {previewPlayer.bowlingStyle || "Not added"}.
              </Typography>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          {previewPlayer ? (
            <Button component={Link} href={`/players/${previewPlayer._id}`}>
              Full profile
            </Button>
          ) : null}
          <Button onClick={() => setPreviewPlayer(null)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
