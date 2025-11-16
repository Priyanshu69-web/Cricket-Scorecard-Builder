export type Player = {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  isOut: boolean;
};

export type Bowler = {
  id: string;
  name: string;
  overs: number;
  runsConceded: number;
  wickets: number;
};

export type Team = {
  id: string;
  name: string;
  players: Player[];
  bowlers: Bowler[];
  score: number;
  wickets: number;
  overs: number;
};

export type Match = {
  id: string;
  teamA: Team;
  teamB: Team;
  currentInnings: 1 | 2;
  date?: string;
  venue?: string;
  matchType?: "T20" | "ODI" | "Test" | "Custom";
  oversPerInnings?: number;
  createdAt?: number;
};
