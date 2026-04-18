"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { PlayerMatchRecord, PlayerProfile } from "@/types/cricket";
import { toOvers } from "@/lib/cricket";

type PlayerProfileResponse = PlayerProfile & {
  recentMatches: PlayerMatchRecord[];
};

function initial(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

function statCard(label: string, value: string | number, hint?: string) {
  return (
    <Paper sx={{ p: 1.5, borderRadius: 3, border: "1px solid #d8e1ee", height: "100%" }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h3" sx={{ mt: 0.4, fontSize: "1.05rem" }}>
        {value}
      </Typography>
      {hint ? (
        <Typography variant="caption" color="text.secondary">
          {hint}
        </Typography>
      ) : null}
    </Paper>
  );
}

export default function PlayerProfilePage() {
  const params = useParams();
  const [player, setPlayer] = useState<PlayerProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = String(params.id || "");
    fetch(`/api/players/${id}`)
      .then((res) => res.json())
      .then((data) => setPlayer(data?._id ? data : null))
      .catch(() => setPlayer(null))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!player) {
    return (
      <Container maxWidth="md" sx={{ pt: 12 }}>
        <Paper sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>Player profile not found.</Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f6fb", pt: 10, pb: 4 }}>
      <Container maxWidth="lg">
        <Button component={Link} href="/players" startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 1 }}>
          Back to players
        </Button>

        <Paper sx={{ p: { xs: 2, md: 2.5 }, borderRadius: 4, border: "1px solid #d8e1ee" }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" } }}
          >
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Avatar src={player.imageUrl} sx={{ width: 72, height: 72, fontSize: 26 }}>
                {initial(player.name)}
              </Avatar>
              <Box>
                <Typography variant="h1" sx={{ fontSize: { xs: "1.45rem", md: "1.8rem" } }}>
                  {player.name}
                </Typography>
                <Stack direction="row" spacing={0.75} sx={{ mt: 0.75, flexWrap: "wrap", gap: 0.75 }}>
                  <Chip size="small" label={player.role} color="primary" />
                  <Chip size="small" variant="outlined" label={`${player.matchesPlayed} matches`} />
                  <Chip size="small" variant="outlined" label={`Bat ${player.battingStyle}`} />
                  <Chip size="small" variant="outlined" label={`Bowl ${player.bowlingStyle || "-"}`} />
                </Stack>
              </Box>
            </Stack>
            <Button
              component={Link}
              href={`/scorecard/create`}
              variant="contained"
              endIcon={<OpenInNewRoundedIcon />}
            >
              Use in a match
            </Button>
          </Stack>

          <Grid container spacing={1.25} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              {statCard("Career runs", player.batting.runs, `SR ${player.batting.strikeRate}`)}
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              {statCard("Batting average", player.batting.average, `${player.batting.fours} fours • ${player.batting.sixes} sixes`)}
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              {statCard("Career wickets", player.bowling.wickets, `Economy ${player.bowling.economy}`)}
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              {statCard("Overs bowled", toOvers(player.bowling.balls), `${player.bowling.runsConceded} runs conceded`)}
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #d8e1ee", height: "100%" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Career snapshot
              </Typography>
              <Divider sx={{ my: 1.25 }} />
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Matches: <strong>{player.matchesPlayed}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Runs: <strong>{player.batting.runs}</strong> from {player.batting.balls} balls
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Batting avg / SR: <strong>{player.batting.average}</strong> / <strong>{player.batting.strikeRate}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Wickets: <strong>{player.bowling.wickets}</strong> in {toOvers(player.bowling.balls)} overs
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Economy: <strong>{player.bowling.economy}</strong>
                </Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #d8e1ee" }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Previous match record
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
                Latest cricket record from saved matches, shown in a compact mobile-friendly table.
              </Typography>

              {player.recentMatches.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No completed match record yet for this player.
                </Typography>
              ) : (
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Match</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Batting</TableCell>
                        <TableCell>Bowling</TableCell>
                        <TableCell>Result</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {player.recentMatches.map((record) => (
                        <TableRow key={`${record.matchId}-${record.date}`} hover>
                          <TableCell>
                            <Stack spacing={0.25}>
                              <Link href={`/scorecard/${record.matchId}`}>{record.matchLabel}</Link>
                              <Typography variant="caption" color="text.secondary">
                                {record.teamName} vs {record.opponentName}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{record.date}</TableCell>
                          <TableCell>
                            {record.batting.runs} ({record.batting.balls})
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {record.batting.dismissal}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {record.bowling.wickets}/{record.bowling.runsConceded}
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {toOvers(record.bowling.balls)} overs
                            </Typography>
                          </TableCell>
                          <TableCell>{record.result}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
