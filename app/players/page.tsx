"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { PlayerProfile } from "@/types/cricket";

function initial(name: string) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [name, setName] = useState("");
  const [role, setRole] = useState<PlayerProfile["role"]>("Batsman");
  const [battingStyle, setBattingStyle] = useState<PlayerProfile["battingStyle"]>("Right");
  const [bowlingStyle, setBowlingStyle] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  async function fetchPlayers() {
    const res = await fetch("/api/players");
    const data = await res.json();
    setPlayers(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    fetchPlayers();
  }, []);

  async function createPlayer() {
    if (!name.trim()) return;
    await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role, battingStyle, bowlingStyle, imageUrl }),
    });
    setName("");
    setBowlingStyle("");
    setImageUrl("");
    fetchPlayers();
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f6fb", pt: 10, pb: 4 }}>
      <Container maxWidth="lg">
        <Stack spacing={0.75} sx={{ mb: 2 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: "1.4rem", md: "1.8rem" } }}>
            Player profiles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Save players once, reuse them in teams, and open full cricket records from the list.
          </Typography>
        </Stack>

        <Paper sx={{ p: 2, borderRadius: 3, border: "1px solid #d8e1ee", mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 700 }}>
            Add player
          </Typography>
          <Grid container spacing={1.25}>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField fullWidth select size="small" label="Role" value={role} onChange={(e) => setRole(e.target.value as PlayerProfile["role"])}>
                {["Batsman", "Bowler", "All-rounder", "Wicketkeeper"].map((value) => (
                  <MenuItem key={value} value={value}>{value}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <TextField fullWidth select size="small" label="Batting style" value={battingStyle} onChange={(e) => setBattingStyle(e.target.value as PlayerProfile["battingStyle"])}>
                {["Right", "Left"].map((value) => (
                  <MenuItem key={value} value={value}>{value}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth size="small" label="Bowling style" value={bowlingStyle} onChange={(e) => setBowlingStyle(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField fullWidth size="small" label="Avatar URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </Grid>
            <Grid size={12}>
              <Button variant="contained" onClick={createPlayer}>
                Save player
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 1.5, borderRadius: 3, border: "1px solid #d8e1ee" }}>
          <Typography variant="subtitle1" sx={{ px: 0.5, pb: 1, fontWeight: 700 }}>
            Saved players
          </Typography>
          <Box sx={{ overflowX: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Player</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Matches</TableCell>
                  <TableCell>Runs</TableCell>
                  <TableCell>Wickets</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((player) => (
                  <TableRow key={player._id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                        <Avatar src={player.imageUrl} sx={{ width: 34, height: 34 }}>
                          {initial(player.name)}
                        </Avatar>
                        <Link href={`/players/${player._id}`}>{player.name}</Link>
                      </Stack>
                    </TableCell>
                    <TableCell>{player.role}</TableCell>
                    <TableCell>{player.matchesPlayed}</TableCell>
                    <TableCell>{player.batting.runs}</TableCell>
                    <TableCell>{player.bowling.wickets}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
