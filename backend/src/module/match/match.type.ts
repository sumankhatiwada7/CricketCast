


export type MatchFormat = "T20" | "ODI" | "TEST"  ;

export interface CreateMatchInput {
  name?: string;
  format?: MatchFormat;
  totalOvers?: number;
  venue?: string;
  scheduledAt?: string;
  tournamentId: string;
  teamAId: string;
  teamBId: string;
}

export interface matchapiResponse {
    message: string;
    success: boolean;
}
export interface matchcreateResponse<t> extends matchapiResponse {
    data: t;
}