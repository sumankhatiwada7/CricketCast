export type ExtraType = "WIDE" | "NO_BALL" | "BYE" | "LEG_BYE";

export type WicketType =
  | "BOWLED"
  | "CAUGHT"
  | "LBW"
  | "RUN_OUT"
  | "STUMPED"
  | "HIT_WICKET";

export interface BallEvent {
  batsmanRuns: number;
  extraType?: ExtraType;
  extraRuns?: number;
  wicketType?: WicketType;
}

export interface InningsScore {
  runs: number;
  wickets: number;
  legalBalls: number;
}

export interface BatterScore {
  playerId: string;
  name: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
}
export interface BowlerScore {
  playerId: string;
  name: string;
  legalBalls: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
}

export interface ExtrasScore {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  total: number;
}

export interface DeliveryResult {
  innings: InningsScore;
  batter: BatterScore;
  bowler: BowlerScore;
  extras: ExtrasScore;
}

export interface ProcessDeliveryInput {
  innings: InningsScore;
  batter: BatterScore;
  bowler: BowlerScore;
  extras: ExtrasScore;
  event: BallEvent;
}