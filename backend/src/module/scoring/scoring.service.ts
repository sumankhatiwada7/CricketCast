import type{BallEvent,BatterScore,InningsScore,BowlerScore,ExtrasScore, ProcessDeliveryInput, DeliveryResult}from "./scoring.type.js";

export const calculateDelivery = (currentscore: InningsScore,event:BallEvent): InningsScore => {
   
    const batsmanRuns = event.batsmanRuns;
    const extraRuns = event.extraRuns || 0;
    const totalRuns = batsmanRuns + extraRuns;

    const isWide= event.extraType === "WIDE";
    const isNoBall= event.extraType === "NO_BALL";

    const isLegalDelivery = !isWide && !isNoBall;
    return {
        runs: currentscore.runs + totalRuns,
        wickets: currentscore.wickets + (event.wicketType ? 1 : 0),
        legalBalls: currentscore.legalBalls + (isLegalDelivery ? 1 : 0),
    }

}

export const formatOvers = (legalBalls: number): string => {
  const overs = Math.floor(legalBalls / 6);
  const balls = legalBalls % 6;

  return `${overs}.${balls}`;
};

export const updatedBatterScore = (batter: BatterScore, event: BallEvent): BatterScore => {
    const iswide = event.extraType === "WIDE";
    return{
        ...batter,
        runs: batter.runs + event.batsmanRuns,
        ballsFaced: batter.ballsFaced + (iswide ? 0 : 1),
        fours: batter.fours + (event.batsmanRuns === 4 ? 1 : 0),
        sixes: batter.sixes + (event.batsmanRuns === 6 ? 1 : 0),
    }
}


export const updateBowlerScore = (
  bowler: BowlerScore,
  event: BallEvent,
): BowlerScore => {
  const isWide = event.extraType === "WIDE";
  const isNoBall = event.extraType === "NO_BALL";
  const isBye = event.extraType === "BYE";
  const isLegBye = event.extraType === "LEG_BYE";

  const isLegalDelivery = !isWide && !isNoBall;

  const runsConceded =
    event.batsmanRuns +
    (isBye || isLegBye ? 0 : (event.extraRuns ?? 0));

  const bowlerWicketTypes = [
    "BOWLED",
    "CAUGHT",
    "LBW",  
    "STUMPED",
    "HIT_WICKET",
  ];

  const getsBowlerCredit = bowlerWicketTypes.includes(
    event.wicketType ?? "",
  );

  return {
    ...bowler,
    legalBalls: bowler.legalBalls + (isLegalDelivery ? 1 : 0),
    runsConceded: bowler.runsConceded + runsConceded,
    wickets: bowler.wickets + (getsBowlerCredit ? 1 : 0),
    wides: bowler.wides + (isWide ? 1 : 0),
    noBalls: bowler.noBalls + (isNoBall ? 1 : 0),
  };
};

export const calculateStrikeRate = (
  runs: number,
  ballsFaced: number,
): number => {
  if (ballsFaced === 0) return 0;

  return Number(((runs / ballsFaced) * 100).toFixed(2));
};

export const calculateEconomyRate = ( runsconceded: number, legalBalls: number): number => {
    if (legalBalls === 0) return 0;
    const economyRate = (runsconceded *6 / legalBalls) ;
    return Number(economyRate.toFixed(2));
}

export const calculateRunRate = (runs: number, legalBalls: number): number => {
    if (legalBalls === 0) return 0;
    const runRate = (runs * 6) / legalBalls;
    return Number(runRate.toFixed(2));
}

export const updateExtrasScore = ( extras: ExtrasScore, event: BallEvent): ExtrasScore => {

    const extraruns= event.extraRuns ?? 0;
    const updateExtras=  {...extras}
    switch(event.extraType){
        case "WIDE":
            updateExtras.wides += extraruns;
            break;
        case "NO_BALL":
            updateExtras.noBalls += extraruns;
            break;
        case "BYE":
            updateExtras.byes += extraruns;
            break;
        case "LEG_BYE":
            updateExtras.legByes += extraruns;
            break;
    }
    updateExtras.total = updateExtras.wides + updateExtras.noBalls + updateExtras.byes + updateExtras.legByes;
    return updateExtras;
}
export const processDelivery = (
  input: ProcessDeliveryInput,
): DeliveryResult => {
  const { innings, batter, bowler, extras, event } = input;

  return {
    innings: calculateDelivery(innings, event),
    batter: updatedBatterScore(batter, event),
    bowler: updateBowlerScore(bowler, event),
    extras: updateExtrasScore(extras, event),
  };
};