import { v4 as uuidv4 } from "uuid";
import {
  BallEvent,
  Batter,
  BatterStats,
  BowlerStats,
  ExtraType,
  Innings,
  Match,
  MatchFormat,
  MatchSnapshot,
  OverSummary,
  Team,
} from "@/types/cricket";

export type CreateMatchInput = {
  teamAName: string;
  teamBName: string;
  format: MatchFormat;
  oversLimit: number;
  tossWinner: "teamA" | "teamB";
  tossDecision: "bat" | "bowl";
  venue?: string;
  date?: string;
  teamAPlayers: string[];
  teamBPlayers: string[];
};

export type ScoringAction =
  | { type: "runs"; runs: 0 | 1 | 2 | 3 | 4 | 6 }
  | { type: "extra"; extraType: ExtraType; runs: number }
  | { type: "wicket"; dismissal?: string };

const STORAGE_PREFIX = "cricket_match_";

export function toOvers(legalBalls: number) {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

export function oversToFloat(legalBalls: number) {
  return legalBalls === 0 ? 0 : legalBalls / 6;
}

export function runRate(runs: number, legalBalls: number) {
  const overs = oversToFloat(legalBalls);
  return overs === 0 ? 0 : Number((runs / overs).toFixed(2));
}

export function strikeRate(runs: number, balls: number) {
  return balls === 0 ? 0 : Number(((runs / balls) * 100).toFixed(2));
}

export function economyRate(runsConceded: number, balls: number) {
  const overs = oversToFloat(balls);
  return overs === 0 ? 0 : Number((runsConceded / overs).toFixed(2));
}

export function quickPlayers(teamName: string) {
  return Array.from({ length: 11 }, (_, index) => `${teamName} Player ${index + 1}`);
}

function buildTeam(name: string, players: string[]): Team {
  return {
    id: uuidv4(),
    name,
    players: players.map((player) => ({
      id: uuidv4(),
      name: player.trim(),
    })),
  };
}

function initBatting(team: Team): BatterStats[] {
  return team.players.map((player) => ({
    playerId: player.id,
    name: player.name,
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    isOut: false,
  }));
}

function initBowling(team: Team): BowlerStats[] {
  return team.players.map((player) => ({
    playerId: player.id,
    name: player.name,
    balls: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    currentOverRuns: 0,
  }));
}

function cloneSnapshot(match: Match): MatchSnapshot {
  return {
    innings: JSON.parse(JSON.stringify(match.innings)),
    currentInnings: match.currentInnings,
    status: match.status,
    result: match.result,
  };
}

function buildInnings(
  inningsNumber: 1 | 2,
  battingTeam: Team,
  bowlingTeam: Team
): Innings {
  return {
    inningsNumber,
    battingTeamId: battingTeam.id,
    bowlingTeamId: bowlingTeam.id,
    totalRuns: 0,
    wickets: 0,
    legalBalls: 0,
    extras: { wides: 0, noBalls: 0, byes: 0 },
    strikerId: battingTeam.players[0]?.id || null,
    nonStrikerId: battingTeam.players[1]?.id || null,
    currentBowlerId: bowlingTeam.players[0]?.id || null,
    nextBatterIndex: 2,
    completed: false,
    batting: initBatting(battingTeam),
    bowling: initBowling(bowlingTeam),
    timeline: [],
    overSummaries: [],
  };
}

export function createMatch(input: CreateMatchInput): Match {
  const teamA = buildTeam(input.teamAName, input.teamAPlayers);
  const teamB = buildTeam(input.teamBName, input.teamBPlayers);
  const tossWinnerTeamId = input.tossWinner === "teamA" ? teamA.id : teamB.id;
  const tossWinner = input.tossWinner === "teamA" ? teamA : teamB;
  const tossLoser = input.tossWinner === "teamA" ? teamB : teamA;
  const firstBattingTeam = input.tossDecision === "bat" ? tossWinner : tossLoser;
  const firstBowlingTeam = firstBattingTeam.id === teamA.id ? teamB : teamA;
  const secondBattingTeam = firstBattingTeam.id === teamA.id ? teamB : teamA;
  const secondBowlingTeam = secondBattingTeam.id === teamA.id ? teamB : teamA;

  return {
    id: uuidv4(),
    teamA,
    teamB,
    format: input.format,
    oversLimit: input.oversLimit,
    tossWinnerTeamId,
    tossDecision: input.tossDecision,
    venue: input.venue?.trim(),
    date: input.date || new Date().toISOString().slice(0, 10),
    status: "live",
    currentInnings: 1,
    innings: [
      buildInnings(1, firstBattingTeam, firstBowlingTeam),
      buildInnings(2, secondBattingTeam, secondBowlingTeam),
    ],
    history: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function getCurrentInnings(match: Match) {
  return match.innings[match.currentInnings - 1];
}

export function getTeamById(match: Match, teamId: string) {
  return match.teamA.id === teamId ? match.teamA : match.teamB;
}

export function getBatter(innings: Innings, playerId: string | null) {
  return innings.batting.find((player) => player.playerId === playerId);
}

export function getBowler(innings: Innings, playerId: string | null) {
  return innings.bowling.find((player) => player.playerId === playerId);
}

function ensureOverSummary(innings: Innings, overNumber: number) {
  let over = innings.overSummaries.find((item) => item.overNumber === overNumber);
  if (!over) {
    over = { overNumber, balls: [], runs: 0, wickets: 0 };
    innings.overSummaries.push(over);
  }
  return over;
}

function nextAvailableBatter(innings: Innings, battingTeam: Team) {
  const next = battingTeam.players[innings.nextBatterIndex];
  innings.nextBatterIndex += 1;
  return next?.id || null;
}

function swapStrike(innings: Innings) {
  const current = innings.strikerId;
  innings.strikerId = innings.nonStrikerId;
  innings.nonStrikerId = current;
}

function autoAdvanceBowler(innings: Innings, bowlingTeam: Team) {
  if (!innings.currentBowlerId) {
    innings.currentBowlerId = bowlingTeam.players[0]?.id || null;
    return;
  }

  const currentIndex = bowlingTeam.players.findIndex(
    (player) => player.id === innings.currentBowlerId
  );
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % bowlingTeam.players.length : 0;
  innings.currentBowlerId = bowlingTeam.players[nextIndex]?.id || null;
}

function pushBallToTimeline(innings: Innings, event: BallEvent) {
  innings.timeline.push(event);
  const overSummary = ensureOverSummary(innings, event.over);
  overSummary.balls.push(event);
  overSummary.runs += event.runs;
  if (event.wicket) {
    overSummary.wickets += 1;
  }
}

function legalBallsInCurrentOver(innings: Innings) {
  return innings.legalBalls % 6;
}

function currentOverNumber(innings: Innings) {
  return Math.floor(innings.legalBalls / 6) + 1;
}

export function selectBowler(match: Match, bowlerId: string) {
  const innings = getCurrentInnings(match);
  innings.currentBowlerId = bowlerId;
  match.updatedAt = Date.now();
  return structuredCloneFallback(match);
}

export function applyScoringAction(match: Match, action: ScoringAction) {
  const nextMatch = structuredCloneFallback(match);
  nextMatch.history.push(cloneSnapshot(nextMatch));

  const innings = getCurrentInnings(nextMatch);
  const battingTeam = getTeamById(nextMatch, innings.battingTeamId);
  const bowlingTeam = getTeamById(nextMatch, innings.bowlingTeamId);
  const striker = getBatter(innings, innings.strikerId);
  const bowler = getBowler(innings, innings.currentBowlerId);

  if (!striker || !bowler || innings.completed) {
    return nextMatch;
  }

  const over = currentOverNumber(innings);
  const legalBallNumber = legalBallsInCurrentOver(innings) + 1;
  let ballLabel = "";
  let commentary = "";
  let totalRuns = 0;
  let legalDelivery = true;
  let wicket = false;

  if (action.type === "runs") {
    striker.runs += action.runs;
    striker.balls += 1;
    totalRuns = action.runs;
    ballLabel = String(action.runs);
    commentary = `${striker.name} scores ${action.runs}.`;

    if (action.runs === 4) {
      striker.fours += 1;
    }
    if (action.runs === 6) {
      striker.sixes += 1;
    }
  }

  if (action.type === "extra") {
    totalRuns = action.runs;
    ballLabel = action.extraType.toUpperCase();
    commentary = `${action.extraType.toUpperCase()} +${action.runs}`;

    if (action.extraType === "wd") {
      innings.extras.wides += action.runs;
      legalDelivery = false;
    } else if (action.extraType === "nb") {
      innings.extras.noBalls += action.runs;
      legalDelivery = false;
    } else {
      innings.extras.byes += action.runs;
      striker.balls += 1;
    }
  }

  if (action.type === "wicket") {
    striker.balls += 1;
    striker.isOut = true;
    striker.dismissal = action.dismissal || "bowled";
    wicket = true;
    totalRuns = 0;
    ballLabel = "W";
    commentary = `${striker.name} is out ${striker.dismissal}.`;
    bowler.wickets += 1;
    innings.wickets += 1;
  }

  innings.totalRuns += totalRuns;
  bowler.runsConceded += totalRuns;
  bowler.currentOverRuns += totalRuns;

  if (legalDelivery) {
    innings.legalBalls += 1;
    bowler.balls += 1;
  }

  const event: BallEvent = {
    id: uuidv4(),
    inningsNumber: innings.inningsNumber,
    over,
    ballInOver: legalDelivery ? legalBallNumber : null,
    label: ballLabel,
    runs: totalRuns,
    isLegalDelivery: legalDelivery,
    extraType: action.type === "extra" ? action.extraType : undefined,
    wicket,
    commentary,
  };

  pushBallToTimeline(innings, event);

  if (action.type === "runs" && action.runs % 2 === 1) {
    swapStrike(innings);
  }
  if (action.type === "extra" && action.extraType === "bye" && action.runs % 2 === 1) {
    swapStrike(innings);
  }

  if (action.type === "wicket") {
    innings.strikerId = nextAvailableBatter(innings, battingTeam);
  }

  const overFinished = legalDelivery && innings.legalBalls % 6 === 0;
  if (overFinished) {
    if (bowler.currentOverRuns === 0) {
      bowler.maidens += 1;
    }
    bowler.currentOverRuns = 0;
    swapStrike(innings);
    autoAdvanceBowler(innings, bowlingTeam);
  }

  const target = getTarget(nextMatch);
  if (
    innings.legalBalls >= nextMatch.oversLimit * 6 ||
    innings.wickets >= battingTeam.players.length - 1 ||
    (innings.inningsNumber === 2 && target !== null && innings.totalRuns >= target)
  ) {
    innings.completed = true;
    if (innings.inningsNumber === 1) {
      nextMatch.status = "innings break";
      nextMatch.currentInnings = 2;
    } else {
      nextMatch.status = "completed";
      nextMatch.result = getMatchResult(nextMatch);
    }
  } else {
    nextMatch.status = "live";
  }

  nextMatch.updatedAt = Date.now();
  return nextMatch;
}

export function undoLastBall(match: Match) {
  if (match.history.length === 0) {
    return match;
  }

  const nextMatch = structuredCloneFallback(match);
  const previous = nextMatch.history.pop();
  if (!previous) {
    return nextMatch;
  }

  nextMatch.innings = previous.innings;
  nextMatch.currentInnings = previous.currentInnings;
  nextMatch.status = previous.status;
  nextMatch.result = previous.result;
  nextMatch.updatedAt = Date.now();
  return nextMatch;
}

export function getTarget(match: Match) {
  const firstInnings = match.innings[0];
  if (!firstInnings.completed) {
    return null;
  }
  return firstInnings.totalRuns + 1;
}

export function getRequiredRunRate(match: Match) {
  if (match.currentInnings !== 2) {
    return null;
  }
  const innings = match.innings[1];
  const target = getTarget(match);
  if (!target) {
    return null;
  }

  const runsNeeded = Math.max(target - innings.totalRuns, 0);
  const ballsLeft = match.oversLimit * 6 - innings.legalBalls;
  if (ballsLeft <= 0) {
    return runsNeeded > 0 ? Infinity : 0;
  }

  return Number(((runsNeeded / ballsLeft) * 6).toFixed(2));
}

export function getMatchResult(match: Match) {
  if (match.status !== "completed") {
    return "Match in progress";
  }

  const first = match.innings[0];
  const second = match.innings[1];
  const firstBattingTeam = getTeamById(match, first.battingTeamId);
  const secondBattingTeam = getTeamById(match, second.battingTeamId);

  if (second.totalRuns > first.totalRuns) {
    const wicketsLeft =
      getTeamById(match, second.battingTeamId).players.length - 1 - second.wickets;
    return `${secondBattingTeam.name} won by ${wicketsLeft} wickets`;
  }

  if (second.totalRuns < first.totalRuns) {
    return `${firstBattingTeam.name} won by ${first.totalRuns - second.totalRuns} runs`;
  }

  return "Match tied";
}

export function saveMatch(match: Match) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.setItem(`${STORAGE_PREFIX}${match.id}`, JSON.stringify(match));
}

export function loadMatch(matchId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(`${STORAGE_PREFIX}${matchId}`);
  return raw ? (JSON.parse(raw) as Match) : null;
}

export function loadAllMatches() {
  if (typeof window === "undefined") {
    return [];
  }

  const matches: Match[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(STORAGE_PREFIX)) {
      continue;
    }

    const raw = localStorage.getItem(key);
    if (!raw) {
      continue;
    }

    try {
      matches.push(JSON.parse(raw) as Match);
    } catch {
      localStorage.removeItem(key);
    }
  }

  return matches.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteMatch(matchId: string) {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(`${STORAGE_PREFIX}${matchId}`);
}

export function scoreSummary(match: Match) {
  const innings = getCurrentInnings(match);
  const battingTeam = getTeamById(match, innings.battingTeamId);
  return `${battingTeam.name} ${innings.totalRuns}/${innings.wickets} in ${toOvers(innings.legalBalls)} overs`;
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

export function currentPartnership(innings: Innings) {
  const striker = getBatter(innings, innings.strikerId);
  const nonStriker = getBatter(innings, innings.nonStrikerId);
  const runs = (striker?.runs || 0) + (nonStriker?.runs || 0);
  const balls = (striker?.balls || 0) + (nonStriker?.balls || 0);
  return { runs, balls };
}

function structuredCloneFallback<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
