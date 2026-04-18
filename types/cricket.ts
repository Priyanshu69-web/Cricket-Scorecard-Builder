export type MatchFormat = "T20" | "ODI" | "Test" | "Custom";
export type PlayerRole = "Batsman" | "Bowler" | "All-rounder" | "Wicketkeeper";
export type BattingStyle = "Right" | "Left";

export type PlayerProfile = {
  _id: string;
  name: string;
  imageUrl?: string;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle?: string;
  matchesPlayed: number;
  batting: {
    runs: number;
    balls: number;
    outs: number;
    average: number;
    strikeRate: number;
    fours: number;
    sixes: number;
  };
  bowling: {
    balls: number;
    runsConceded: number;
    wickets: number;
    economy: number;
  };
};

export type PlayerMatchRecord = {
  matchId: string;
  matchLabel: string;
  date: string;
  venue?: string;
  format: MatchFormat;
  teamName: string;
  opponentName: string;
  result: string;
  batting: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    dismissal: string;
  };
  bowling: {
    balls: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
  };
};

export type DismissalType =
  | "bowled"
  | "caught"
  | "lbw"
  | "run out"
  | "stumped"
  | "hit wicket"
  | "retired out";

export type ExtraType = "wd" | "nb" | "bye" | "lb";

export type Batter = {
  id: string;
  name: string;
  profileId?: string;
};

export type BatterStats = {
  playerId: string;
  profileId?: string;
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
  profileId?: string;
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

export type FallOfWicket = {
  score: number;
  wicket: number;
  over: string;
  batterName: string;
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
    legByes: number;
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
  fallOfWickets: FallOfWicket[];
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
  shareToken?: string;
  isPublic?: boolean;
  history: MatchSnapshot[];
  createdAt: number;
  updatedAt: number;
};
