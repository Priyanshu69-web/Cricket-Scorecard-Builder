"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import SportsCricketRoundedIcon from "@mui/icons-material/SportsCricketRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import {
  applyScoringAction,
  currentPartnership,
  economyRate,
  formatDate,
  getBatter,
  getCurrentInnings,
  getMatchResult,
  getRequiredRunRate,
  getTarget,
  getTeamById,
  runRate,
  scoreSummary,
  selectBowler,
  strikeRate,
  toOvers,
  undoLastBall,
} from "@/lib/cricket";
import { BallEvent, Innings, Match } from "@/types/cricket";

type MatchCenterProps = {
  match: Match;
  onMatchChange?: (match: Match) => void;
  onDelete?: () => void;
  onShare?: () => void;
  onCopySummary?: () => void;
  showControls?: boolean;
  shareUrl?: string | null;
  backHref?: string;
  backLabel?: string;
};

function toneForBall(event: BallEvent) {
  if (event.wicket) return { bg: "#ffe4e6", color: "#be123c" };
  if (event.extraType) return { bg: "#fef3c7", color: "#92400e" };
  if (event.runs === 4 || event.runs === 6) return { bg: "#dcfce7", color: "#166534" };
  if (event.runs === 0) return { bg: "#e0f2fe", color: "#0c4a6e" };
  return { bg: "#eef2ff", color: "#3730a3" };
}

function renderBattingTable(innings: Innings) {
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Batter</TableCell>
            <TableCell>Dismissal</TableCell>
            <TableCell align="right">R</TableCell>
            <TableCell align="right">B</TableCell>
            <TableCell align="right">4s</TableCell>
            <TableCell align="right">6s</TableCell>
            <TableCell align="right">SR</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {innings.batting.map((player) => (
            <TableRow key={player.playerId} hover>
              <TableCell>{player.name}</TableCell>
              <TableCell>{player.isOut ? player.dismissal : player.balls > 0 ? "not out" : "yet to bat"}</TableCell>
              <TableCell align="right">{player.runs}</TableCell>
              <TableCell align="right">{player.balls}</TableCell>
              <TableCell align="right">{player.fours}</TableCell>
              <TableCell align="right">{player.sixes}</TableCell>
              <TableCell align="right">{strikeRate(player.runs, player.balls)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function renderBowlingTable(innings: Innings) {
  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Bowler</TableCell>
            <TableCell align="right">O</TableCell>
            <TableCell align="right">M</TableCell>
            <TableCell align="right">R</TableCell>
            <TableCell align="right">W</TableCell>
            <TableCell align="right">Econ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {innings.bowling
            .filter((bowler) => bowler.balls > 0 || bowler.runsConceded > 0 || bowler.wickets > 0)
            .map((bowler) => (
              <TableRow key={bowler.playerId} hover>
                <TableCell>{bowler.name}</TableCell>
                <TableCell align="right">{toOvers(bowler.balls)}</TableCell>
                <TableCell align="right">{bowler.maidens}</TableCell>
                <TableCell align="right">{bowler.runsConceded}</TableCell>
                <TableCell align="right">{bowler.wickets}</TableCell>
                <TableCell align="right">{economyRate(bowler.runsConceded, bowler.balls)}</TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default function MatchCenter({
  match,
  onMatchChange,
  onDelete,
  onShare,
  onCopySummary,
  showControls = false,
  shareUrl,
  backHref = "/scorecard",
  backLabel = "Back to matches",
}: MatchCenterProps) {
  const [tab, setTab] = useState("scorecard");
  const innings = useMemo(() => getCurrentInnings(match), [match]);
  const battingTeam = getTeamById(match, innings.battingTeamId);
  const bowlingTeam = getTeamById(match, innings.bowlingTeamId);
  const striker = getBatter(innings, innings.strikerId);
  const nonStriker = getBatter(innings, innings.nonStrikerId);
  const bowler = innings.bowling.find((item) => item.playerId === innings.currentBowlerId) || null;
  const target = getTarget(match);
  const requiredRate = getRequiredRunRate(match);
  const partnership = currentPartnership(innings);

  function updateMatch(nextMatch: Match) {
    onMatchChange?.(nextMatch);
  }

  function scoreRuns(runs: 0 | 1 | 2 | 3 | 4 | 6) {
    updateMatch(applyScoringAction(match, { type: "runs", runs }));
  }

  function addExtra(extraType: "wd" | "nb" | "bye" | "lb") {
    updateMatch(applyScoringAction(match, { type: "extra", extraType, runs: 1 }));
  }

  function wicket() {
    updateMatch(applyScoringAction(match, { type: "wicket", dismissal: "bowled" }));
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f6fb", pt: 10, pb: showControls ? 11 : 4 }}>
      <Box sx={{ maxWidth: 1240, mx: "auto", px: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{ mb: 2, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" } }}
        >
          <Box>
            <Button component={Link} href={backHref} startIcon={<ArrowBackRoundedIcon />} sx={{ mb: 0.5, px: 0 }}>
              {backLabel}
            </Button>
            <Typography variant="h1" sx={{ fontSize: { xs: "1.35rem", md: "1.75rem" } }}>
              {match.teamA.name} vs {match.teamB.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {match.format} • {formatDate(match.date)} • {match.venue || "Venue TBD"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {onCopySummary ? (
              <Button variant="outlined" size="small" startIcon={<ContentCopyRoundedIcon />} onClick={onCopySummary}>
                Summary
              </Button>
            ) : null}
            {onShare ? (
              <Button variant="contained" size="small" startIcon={<IosShareRoundedIcon />} onClick={onShare}>
                Share
              </Button>
            ) : null}
            {showControls ? (
              <Button
                variant="outlined"
                size="small"
                startIcon={<UndoRoundedIcon />}
                onClick={() => updateMatch(undoLastBall(match))}
              >
                Undo
              </Button>
            ) : null}
            {showControls && onDelete ? (
              <Button variant="outlined" size="small" color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={onDelete}>
                Delete
              </Button>
            ) : null}
          </Stack>
        </Stack>

        {shareUrl ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Public scorecard link ready: <Link href={shareUrl}>{shareUrl}</Link>
          </Alert>
        ) : null}

        <Paper sx={{ p: 1.5, borderRadius: 4, border: "1px solid #d8e1ee", position: "sticky", top: 74, zIndex: 10, mb: 2 }}>
          <Grid container spacing={1.25}>
            <Grid size={{ xs: 6, md: 4 }}>
              <Typography variant="caption" color="text.secondary">Batting</Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.15rem", md: "1.4rem" }, mt: 0.4 }}>
                {battingTeam.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">{scoreSummary(match)}</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Typography variant="caption" color="text.secondary">Score</Typography>
              <Typography variant="h2" sx={{ fontSize: { xs: "1.3rem", md: "1.55rem" }, mt: 0.4 }}>
                {innings.totalRuns}/{innings.wickets}
              </Typography>
              <Typography variant="body2" color="text.secondary">{toOvers(innings.legalBalls)} overs</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }}>
              <Typography variant="caption" color="text.secondary">Rates</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>RR {runRate(innings.totalRuns, innings.legalBalls)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Req {requiredRate === null ? "-" : requiredRate === Infinity ? "∞" : requiredRate}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 6 }}>
              <Typography variant="caption" color="text.secondary">Partnership</Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>{partnership.runs} runs</Typography>
              <Typography variant="body2" color="text.secondary">{partnership.balls} balls</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography variant="caption" color="text.secondary">Result</Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 700 }}>
                {match.status === "completed" ? getMatchResult(match) : target ? `Target ${target}` : "First innings live"}
              </Typography>
              <Chip size="small" sx={{ mt: 0.75 }} label={match.status} color={match.status === "completed" ? "success" : "primary"} />
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={1.5}>
              <Paper sx={{ p: 1.5, borderRadius: 3, border: "1px solid #d8e1ee" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Current batters</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {[striker, nonStriker].map((player, index) => (
                    <Box key={player?.playerId || index} sx={{ border: "1px solid #e6edf6", borderRadius: 3, p: 1.25, bgcolor: "#fbfdff" }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {player?.name || "Waiting"} {index === 0 ? "*" : ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {player?.isOut ? "out" : "not out"}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.25} sx={{ mt: 0.75, flexWrap: "wrap", gap: 1.25 }}>
                        <Chip size="small" label={`${player?.runs || 0} runs`} />
                        <Chip size="small" variant="outlined" label={`${player?.balls || 0} balls`} />
                        <Chip size="small" variant="outlined" label={`${player?.fours || 0}/${player?.sixes || 0} 4s/6s`} />
                        <Chip size="small" variant="outlined" label={`SR ${strikeRate(player?.runs || 0, player?.balls || 0)}`} />
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>

              <Paper sx={{ p: 1.5, borderRadius: 3, border: "1px solid #d8e1ee" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Current bowler</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>{bowler?.name || "Select bowler"}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 0.75, flexWrap: "wrap", gap: 1 }}>
                  <Chip size="small" label={`${toOvers(bowler?.balls || 0)} overs`} />
                  <Chip size="small" variant="outlined" label={`${bowler?.runsConceded || 0} runs`} />
                  <Chip size="small" variant="outlined" label={`${bowler?.wickets || 0} wickets`} />
                  <Chip size="small" variant="outlined" label={`Econ ${economyRate(bowler?.runsConceded || 0, bowler?.balls || 0)}`} />
                </Stack>
                {showControls ? (
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Change bowler"
                    value={innings.currentBowlerId || ""}
                    onChange={(event) => updateMatch(selectBowler(match, event.target.value))}
                    sx={{ mt: 1.25 }}
                  >
                    {bowlingTeam.players.map((player) => (
                      <MenuItem key={player.id} value={player.id}>
                        {player.name}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : null}
              </Paper>

              <Paper sx={{ p: 1.5, borderRadius: 3, border: "1px solid #d8e1ee" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Timeline</Typography>
                <Typography variant="body2" color="text.secondary">
                  Compact over strips designed to read like a phone app feed.
                </Typography>
                <Stack spacing={1.25} sx={{ mt: 1.25 }}>
                  {[...innings.overSummaries].reverse().map((over) => (
                    <Box key={over.overNumber}>
                      <Stack direction="row" sx={{ mb: 0.75, justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>Over {over.overNumber}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {over.runs} runs • {over.wickets} wicket(s)
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                        {over.balls.map((ball) => {
                          const tone = toneForBall(ball);
                          return (
                            <Chip
                              key={ball.id}
                              size="small"
                              label={ball.label}
                              sx={{
                                bgcolor: tone.bg,
                                color: tone.color,
                                fontWeight: 700,
                              }}
                            />
                          );
                        })}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper sx={{ borderRadius: 3, border: "1px solid #d8e1ee", overflow: "hidden" }}>
              <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                variant="scrollable"
                scrollButtons="auto"
              >
                <Tab value="scorecard" label="Scorecard" />
                <Tab value="commentary" label="Commentary" />
                <Tab value="summary" label="Summary" />
              </Tabs>
              <Divider />
              <Box sx={{ p: 1.5 }}>
                {tab === "scorecard" ? (
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {battingTeam.name} batting
                    </Typography>
                    {renderBattingTable(innings)}
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {bowlingTeam.name} bowling
                    </Typography>
                    {renderBowlingTable(innings)}
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6, md: 3 }}><Chip label={`Wd ${innings.extras.wides}`} /></Grid>
                      <Grid size={{ xs: 6, md: 3 }}><Chip label={`Nb ${innings.extras.noBalls}`} /></Grid>
                      <Grid size={{ xs: 6, md: 3 }}><Chip label={`B ${innings.extras.byes}`} /></Grid>
                      <Grid size={{ xs: 6, md: 3 }}><Chip label={`Lb ${innings.extras.legByes}`} /></Grid>
                    </Grid>
                    {match.innings[0].timeline.length > 0 && match.currentInnings === 2 ? (
                      <>
                        <Divider />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          First innings recap
                        </Typography>
                        {renderBattingTable(match.innings[0])}
                        {renderBowlingTable(match.innings[0])}
                      </>
                    ) : null}
                  </Stack>
                ) : null}

                {tab === "commentary" ? (
                  <Stack spacing={1}>
                    {[...innings.timeline].slice(-30).reverse().map((ball) => {
                      const tone = toneForBall(ball);
                      return (
                        <Paper key={ball.id} variant="outlined" sx={{ p: 1.1, borderRadius: 3 }}>
                          <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
                            <Typography variant="body2">{ball.commentary}</Typography>
                            <Chip
                              size="small"
                              label={`${ball.over}.${ball.ballInOver ?? "-"} ${ball.label}`}
                              sx={{ bgcolor: tone.bg, color: tone.color, fontWeight: 700 }}
                            />
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                ) : null}

                {tab === "summary" ? (
                  <Stack spacing={1.25}>
                    <Alert severity={match.status === "completed" ? "success" : "info"}>
                      {match.status === "completed" ? getMatchResult(match) : "Match still live"}
                    </Alert>
                    <Typography variant="body2">
                      Toss: {getTeamById(match, match.tossWinnerTeamId).name} won the toss and chose to {match.tossDecision}.
                    </Typography>
                    <Typography variant="body2">
                      Venue: {match.venue || "Venue TBD"} • Format: {match.format}
                    </Typography>
                    <Divider />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Fall of wickets</Typography>
                    {innings.fallOfWickets.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No wickets yet.</Typography>
                    ) : (
                      innings.fallOfWickets.map((item) => (
                        <Typography key={`${item.wicket}-${item.over}`} variant="body2">
                          {item.score}-{item.wicket} ({item.batterName}, {item.over} ov)
                        </Typography>
                      ))
                    )}
                  </Stack>
                ) : null}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {showControls ? (
        <Paper
          sx={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            borderTop: "1px solid #d8e1ee",
            p: 1.25,
            borderRadius: 0,
            zIndex: 30,
          }}
        >
          <Box sx={{ maxWidth: 1240, mx: "auto" }}>
            <Stack direction="row" spacing={1} sx={{ justifyContent: "center", flexWrap: "wrap", gap: 1 }}>
              {[0, 1, 2, 3, 4, 6].map((runs) => (
                <Button
                  key={runs}
                  variant={runs >= 4 ? "contained" : "outlined"}
                  size="small"
                  onClick={() => scoreRuns(runs as 0 | 1 | 2 | 3 | 4 | 6)}
                >
                  {runs}
                </Button>
              ))}
              <Button size="small" color="error" variant="contained" onClick={wicket}>
                W
              </Button>
              <Button size="small" variant="outlined" onClick={() => addExtra("wd")}>WD</Button>
              <Button size="small" variant="outlined" onClick={() => addExtra("nb")}>NB</Button>
              <Button size="small" variant="outlined" onClick={() => addExtra("bye")}>BYE</Button>
              <Button size="small" variant="outlined" onClick={() => addExtra("lb")}>LB</Button>
              <Button size="small" variant="contained" startIcon={<SportsCricketRoundedIcon />} onClick={onShare}>
                Share
              </Button>
            </Stack>
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
}
