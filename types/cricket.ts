export type MatchFormat = "T20" | "ODI" | "Test" | "Custom";

export type DismissalType =
  | "bowled"
  | "caught"
  | "lbw"
  | "run out"
  | "stumped"
  | "hit wicket"
  | "retired out";

export type ExtraType = "wd" | "nb" | "bye";

export type Batter = {
  id: string;
  name: string;
};

export type BatterStats = {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
  dismissal?: string;
};

export type BowlerStats = {
  playerId: string;
  name: string;
  balls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  currentOverRuns: number;
};

export type Team = {
  id: string;
  name: string;
  players: Batter[];
};

export type BallEvent = {
  id: string;
  inningsNumber: 1 | 2;
  over: number;
  ballInOver: number | null;
  label: string;
  runs: number;
  isLegalDelivery: boolean;
  extraType?: ExtraType;
  wicket?: boolean;
  commentary: string;
};

export type OverSummary = {
  overNumber: number;
  balls: BallEvent[];
  runs: number;
  wickets: number;
};

export type Innings = {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  totalRuns: number;
  wickets: number;
  legalBalls: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
  };
  strikerId: string | null;
  nonStrikerId: string | null;
  currentBowlerId: string | null;
  nextBatterIndex: number;
  completed: boolean;
  batting: BatterStats[];
  bowling: BowlerStats[];
  timeline: BallEvent[];
  overSummaries: OverSummary[];
};

export type MatchStatus = "live" | "innings break" | "completed";

export type MatchSnapshot = {
  innings: Innings[];
  currentInnings: 1 | 2;
  status: MatchStatus;
  result?: string;
};

export type Match = {
  id: string;
  teamA: Team;
  teamB: Team;
  format: MatchFormat;
  oversLimit: number;
  tossWinnerTeamId: string;
  tossDecision: "bat" | "bowl";
  venue?: string;
  date: string;
  status: MatchStatus;
  currentInnings: 1 | 2;
  innings: Innings[];
  result?: string;
  history: MatchSnapshot[];
  createdAt: number;
  updatedAt: number;
};
