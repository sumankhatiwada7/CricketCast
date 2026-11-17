import { describe, it, expect } from "vitest";
import {
  calculateDelivery,
  formatOvers,
  updateBowlerScore,
  updatedBatterScore,
  calculateStrikeRate,
  calculateEconomyRate,
  calculateRunRate,
  updateExtrasScore,
  processDelivery,
  validateDelivery,
  createInningsState,
  isInningsCompleted,
  updateInningsStatus,
  rotateStrike,
  shouldRotateStrike,isOverCompleted,
  
  shouldRotateStrikeAfterDelivery,
  processStrikeRotation,
  changeBowler
} from "./scoring.service.js";
import type { BowlerScore, InningsScore ,ExtrasScore,ProcessDeliveryInput} from "./scoring.type.js";

describe("calculateDelivery", () => {
  const initialScore: InningsScore = {
    runs: 0,
    wickets: 0,
    legalBalls: 0,
  };

  it("should calculate a normal delivery", () => {
    const result = calculateDelivery(initialScore, {
      batsmanRuns: 4,
    });

    expect(result).toEqual({
      runs: 4,
      wickets: 0,
      legalBalls: 1,
    });
  });

  it("should not count a wide as a legal delivery", () => {
    const result = calculateDelivery(initialScore, {
      batsmanRuns: 0,
      extraType: "WIDE",
      extraRuns: 1,
    });

    expect(result).toEqual({
      runs: 1,
      wickets: 0,
      legalBalls: 0,
    });
  });

  it("should not count a no-ball as a legal delivery", () => {
    const result = calculateDelivery(initialScore, {
      batsmanRuns: 2,
      extraType: "NO_BALL",
      extraRuns: 1,
    });

    expect(result).toEqual({
      runs: 3,
      wickets: 0,
      legalBalls: 0,
    });
  });

  it("should count byes as a legal delivery", () => {
    const result = calculateDelivery(initialScore, {
      batsmanRuns: 0,
      extraType: "BYE",
      extraRuns: 2,
    });

    expect(result).toEqual({
      runs: 2,
      wickets: 0,
      legalBalls: 1,
    });
  });

  it("should increase wickets when a wicket falls", () => {
    const result = calculateDelivery(initialScore, {
      batsmanRuns: 0,
      wicketType: "BOWLED",
    });

    expect(result).toEqual({
      runs: 0,
      wickets: 1,
      legalBalls: 1,
    });
  });
});

describe("formatOvers", () => {
  it("should format overs correctly", () => {
    const result = formatOvers(14);
    expect(result).toBe("2.2");
  });
  it("should format overs correctly for exact overs", () => {
    const result = formatOvers(12);
    expect(result).toBe("2.0");
  });
  it("should format overs correctly for zero overs", () => {
    const result = formatOvers(0);
    expect(result).toBe("0.0");
  });
  it("should format five balls correctly", () => {
    expect(formatOvers(5)).toBe("0.5");
  });

  it("should format six balls as one complete over", () => {
    expect(formatOvers(6)).toBe("1.0");
  });
});

describe("updatedBatterScore", () => {
  const initialBatterScore = {
    playerId: "player-1",
    name: "John Doe",
    runs: 0,
    fours: 0,
    sixes: 0,
    ballsFaced: 0,
  };
  it("should update batter score for a normal delivery", () => {
    const result = updatedBatterScore(initialBatterScore, {
      batsmanRuns: 2,
    });
    expect(result.runs).toBe(2);
    expect(result.ballsFaced).toBe(1);
  });
  it("should increase fours when batter hits a four", () => {
    const result = updatedBatterScore(initialBatterScore, {
      batsmanRuns: 4,
    });
    expect(result.fours).toBe(1);
    expect(result.runs).toBe(4);
  });
  it("should increase sixes when batter hits a six", () => {
    const result = updatedBatterScore(initialBatterScore, {
      batsmanRuns: 6,
    });
    expect(result.sixes).toBe(1);
    expect(result.runs).toBe(6);
  });
  it("should not increase balls faced for a wide delivery", () => {
    const result = updatedBatterScore(initialBatterScore, {
      batsmanRuns: 0,
      extraType: "WIDE",
      extraRuns: 1,
    });
    expect(result.ballsFaced).toBe(0);
    expect(result.runs).toBe(0);
  });
});

describe("updateBowlerScore", () => {
  const initialBowler: BowlerScore = {
    playerId: "bowler-1",
    name: "Rahul",
    legalBalls: 0,
    runsConceded: 0,
    wickets: 0,
    wides: 0,
    noBalls: 0,
  };

  it("should update runs conceded and legal balls", () => {
    const result = updateBowlerScore(initialBowler, {
      batsmanRuns: 4,
    });

    expect(result.runsConceded).toBe(4);
    expect(result.legalBalls).toBe(1);
  });

  it("should not count a wide as a legal ball", () => {
    const result = updateBowlerScore(initialBowler, {
      batsmanRuns: 0,
      extraType: "WIDE",
      extraRuns: 1,
    });

    expect(result.legalBalls).toBe(0);
    expect(result.wides).toBe(1);
    expect(result.runsConceded).toBe(1);
  });

  it("should not count a no-ball as a legal ball", () => {
    const result = updateBowlerScore(initialBowler, {
      batsmanRuns: 2,
      extraType: "NO_BALL",
      extraRuns: 1,
    });

    expect(result.legalBalls).toBe(0);
    expect(result.noBalls).toBe(1);
    expect(result.runsConceded).toBe(3);
  });

  it("should not charge byes to the bowler", () => {
    const result = updateBowlerScore(initialBowler, {
      batsmanRuns: 0,
      extraType: "BYE",
      extraRuns: 2,
    });

    expect(result.runsConceded).toBe(0);
    expect(result.legalBalls).toBe(1);
  });

  it("should not credit a run out to the bowler", () => {
    const result = updateBowlerScore(initialBowler, {
      batsmanRuns: 0,
      wicketType: "RUN_OUT",
    });

    expect(result.wickets).toBe(0);
    expect(result.legalBalls).toBe(1);
  });

  it("should credit a bowled dismissal to the bowler", () => {
    const result = updateBowlerScore(initialBowler, {
      batsmanRuns: 0,
      wicketType: "BOWLED",
    });

    expect(result.wickets).toBe(1);
  });
});

describe("calculateStrikeRate", () => {
  it("should calculate strike rate correctly", () => {
    const result = calculateStrikeRate(50, 25);
    expect(result).toBe(200);
  });
  it("should return 0 for zero balls faced", () => {
    const result = calculateStrikeRate(50, 0);
    expect(result).toBe(0);
  });
  it("should return strike rate rounded to two decimal places", () => {
    expect(calculateStrikeRate(33, 20)).toBe(165);
  });
});

describe("calculateEconomyRate", () => {
  it("should calculate economy rate correctly", () => {
    const result = calculateEconomyRate(24, 36);
    expect(result).toBe(4);
  });
  it("should return 0 for zero legal balls", () => {
    const result = calculateEconomyRate(24, 0);
    expect(result).toBe(0);
  });
  it("should return economy rate rounded to two decimal places", () => {
    expect(calculateEconomyRate(25, 30)).toBe(5);
  });
});

describe("calculateRunRate", () => {
    it("should calculate run rate correctly", () => {
        const result = calculateRunRate(120, 60);
        expect(result).toBe(12);
    });
    it("should return 0 for zero legal balls", () => {
        const result = calculateRunRate(120, 0);
        expect(result).toBe(0);

    });
    it("should return run rate rounded to two decimal places", () => {
        expect(calculateRunRate(33, 20)).toBe(9.9);
    });
})

describe("updateExtrasScore", () => {
  const initialExtras: ExtrasScore = {
    wides: 0,
    noBalls: 0,
    byes: 0,
    legByes: 0,
    total: 0,
  };

  it("should update wide extras", () => {
    const result = updateExtrasScore(initialExtras, {
      batsmanRuns: 0,
      extraType: "WIDE",
      extraRuns: 2,
    });

    expect(result.wides).toBe(2);
    expect(result.total).toBe(2);
  });

  it("should update no-ball extras", () => {
    const result = updateExtrasScore(initialExtras, {
      batsmanRuns: 2,
      extraType: "NO_BALL",
      extraRuns: 1,
    });

    expect(result.noBalls).toBe(1);
    expect(result.total).toBe(1);
  });

  it("should update bye extras", () => {
    const result = updateExtrasScore(initialExtras, {
      batsmanRuns: 0,
      extraType: "BYE",
      extraRuns: 3,
    });

    expect(result.byes).toBe(3);
    expect(result.total).toBe(3);
  });

  it("should update leg-bye extras", () => {
    const result = updateExtrasScore(initialExtras, {
      batsmanRuns: 0,
      extraType: "LEG_BYE",
      extraRuns: 2,
    });

    expect(result.legByes).toBe(2);
    expect(result.total).toBe(2);
  });

  it("should preserve existing extras", () => {
    const existingExtras: ExtrasScore = {
      wides: 2,
      noBalls: 1,
      byes: 3,
      legByes: 0,
      total: 6,
    };

    const result = updateExtrasScore(existingExtras, {
      batsmanRuns: 0,
      extraType: "WIDE",
      extraRuns: 1,
    });

    expect(result).toEqual({
      wides: 3,
      noBalls: 1,
      byes: 3,
      legByes: 0,
      total: 7,
    });
  });
});

describe("processDelivery", () => {
  it("should update innings, batter, bowler and extras together", () => {
    const input: ProcessDeliveryInput = {
      innings: {
        runs: 10,
        wickets: 1,
        legalBalls: 5,
      },
      batter: {
        playerId: "batter-1",
        name: "Suman",
        runs: 20,
        ballsFaced: 10,
        fours: 2,
        sixes: 0,
      },
      bowler: {
        playerId: "bowler-1",
        name: "Rahul",
        legalBalls: 5,
        runsConceded: 10,
        wickets: 1,
        wides: 0,
        noBalls: 0,
      },
      extras: {
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0,
        total: 0,
      },
      event: {
        batsmanRuns: 4,
      },
    };

    const result = processDelivery(input);

    expect(result).toEqual({
      innings: {
        runs: 14,
        wickets: 1,
        legalBalls: 6,
      },
      batter: {
        playerId: "batter-1",
        name: "Suman",
        runs: 24,
        ballsFaced: 11,
        fours: 3,
        sixes: 0,
      },
      bowler: {
        playerId: "bowler-1",
        name: "Rahul",
        legalBalls: 6,
        runsConceded: 14,
        wickets: 1,
        wides: 0,
        noBalls: 0,
      },
      extras: {
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0,
        total: 0,
      },
    });
  });
});

describe("validateDelivery", () => {
  it("should accept a valid delivery", () => {
    expect(validateDelivery({ batsmanRuns: 4 })).toBe(true);
  });

  it("should reject negative batsman runs", () => {
    expect(validateDelivery({ batsmanRuns: -2 })).toBe(false);
  });

  it("should reject fractional batsman runs", () => {
    expect(validateDelivery({ batsmanRuns: 2.5 })).toBe(false);
  });

  it("should reject negative extra runs", () => {
    expect(
      validateDelivery({
        batsmanRuns: 0,
        extraType: "WIDE",
        extraRuns: -1,
      }),
    ).toBe(false);
  });

  it("should reject fractional extra runs", () => {
    expect(
      validateDelivery({
        batsmanRuns: 0,
        extraType: "WIDE",
        extraRuns: 1.5,
      }),
    ).toBe(false);
  });

  it("should accept zero extra runs", () => {
    expect(
      validateDelivery({
        batsmanRuns: 0,
        extraType: "BYE",
        extraRuns: 0,
      }),
    ).toBe(true);
  });
});

describe("createInningsState", () => {
  it("should initialize a new innings with default scores", () => {
    const result = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    expect(result).toEqual({
      innings: {
        runs: 0,
        wickets: 0,
        legalBalls: 0,
      },
      strikerId: "player-1",
      nonStrikerId: "player-2",
      currentBowlerId: "bowler-1",
      totalOvers: 20,
      totalWickets: 10,
      isCompleted: false,
    });
  });
});

describe("isInningsCompleted", () => {
  it("should return false when innings is still in progress", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    expect(isInningsCompleted(state)).toBe(false);
  });

  it("should return true when all wickets are lost", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    state.innings.wickets = 10;

    expect(isInningsCompleted(state)).toBe(true);
  });

  it("should return true when all allocated overs are completed", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    state.innings.legalBalls = 120;

    expect(isInningsCompleted(state)).toBe(true);
  });

  it("should return false when only 119 legal balls are completed", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    state.innings.legalBalls = 119;

    expect(isInningsCompleted(state)).toBe(false);
  });
});

describe("updateInningsStatus", () => {
  it("should keep innings incomplete when overs and wickets remain", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    const result = updateInningsStatus(state);

    expect(result.isCompleted).toBe(false);
  });

  it("should mark innings completed when all wickets are lost", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    state.innings.wickets = 10;

    const result = updateInningsStatus(state);

    expect(result.isCompleted).toBe(true);
  });

  it("should mark innings completed when all overs are completed", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    state.innings.legalBalls = 120;

    const result = updateInningsStatus(state);

    expect(result.isCompleted).toBe(true);
  });

  it("should not mutate the original state", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    const result = updateInningsStatus(state);

    expect(result).not.toBe(state);
    expect(state.isCompleted).toBe(false);
  });
});
describe("rotateStrike", () => {
  it("should swap striker and non-striker", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    const result = rotateStrike(state);

    expect(result.strikerId).toBe("player-2");
    expect(result.nonStrikerId).toBe("player-1");
  });

  it("should not mutate the original state", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    const result = rotateStrike(state);

    expect(result).not.toBe(state);
    expect(state.strikerId).toBe("player-1");
    expect(state.nonStrikerId).toBe("player-2");
  });

  it("should preserve the rest of the innings state", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    const result = rotateStrike(state);

    expect(result.innings).toEqual(state.innings);
    expect(result.currentBowlerId).toBe("bowler-1");
    expect(result.totalOvers).toBe(20);
    expect(result.totalWickets).toBe(10);
  });
});

describe("shouldRotateStrike", () => {
  it("should return false for zero runs", () => {
    expect(shouldRotateStrike(0)).toBe(false);
  });

  it("should return true for odd runs", () => {
    expect(shouldRotateStrike(1)).toBe(true);
    expect(shouldRotateStrike(3)).toBe(true);
    expect(shouldRotateStrike(5)).toBe(true);
  });

  it("should return false for even runs", () => {
    expect(shouldRotateStrike(2)).toBe(false);
    expect(shouldRotateStrike(4)).toBe(false);
    expect(shouldRotateStrike(6)).toBe(false);
  });
});

describe("isOverCompleted", () => {
  it("should return false when no legal balls are bowled", () => {
    expect(isOverCompleted(0)).toBe(false);
  });

  it("should return false before completing an over", () => {
    expect(isOverCompleted(5)).toBe(false);
    expect(isOverCompleted(7)).toBe(false);
    expect(isOverCompleted(11)).toBe(false);
  });

  it("should return true after completing an over", () => {
    expect(isOverCompleted(6)).toBe(true);
    expect(isOverCompleted(12)).toBe(true);
    expect(isOverCompleted(18)).toBe(true);
  });
});


describe("shouldRotateStrikeAfterDelivery", () => {
  it("should rotate strike after odd runs", () => {
    expect(shouldRotateStrikeAfterDelivery(1, 1)).toBe(true);
    expect(shouldRotateStrikeAfterDelivery(3, 3)).toBe(true);
  });

  it("should not rotate after even runs when over is incomplete", () => {
    expect(shouldRotateStrikeAfterDelivery(2, 2)).toBe(false);
    expect(shouldRotateStrikeAfterDelivery(4, 5)).toBe(false);
  });

  it("should rotate strike when an over is completed", () => {
    expect(shouldRotateStrikeAfterDelivery(0, 6)).toBe(true);
    expect(shouldRotateStrikeAfterDelivery(2, 6)).toBe(true);
  });

  it("should rotate only once when odd runs also complete an over", () => {
    expect(shouldRotateStrikeAfterDelivery(1, 6)).toBe(true);
  });
});

describe("processStrikeRotation", () => {
  it("should rotate strike after odd completed runs", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    state.innings.legalBalls = 1;

    const result = processStrikeRotation(state, 1);

    expect(result.strikerId).toBe("player-2");
    expect(result.nonStrikerId).toBe("player-1");
  });

  it("should not rotate after even runs when over is incomplete", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    state.innings.legalBalls = 2;

    const result = processStrikeRotation(state, 2);

    expect(result.strikerId).toBe("player-1");
    expect(result.nonStrikerId).toBe("player-2");
  });

  it("should rotate strike at the end of an over", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    state.innings.legalBalls = 6;

    const result = processStrikeRotation(state, 0);

    expect(result.strikerId).toBe("player-2");
    expect(result.nonStrikerId).toBe("player-1");
  });

  it("should not mutate the original state", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );

    state.innings.legalBalls = 1;

    const result = processStrikeRotation(state, 1);

    expect(result).not.toBe(state);
    expect(state.strikerId).toBe("player-1");
  });
});

describe("changeBowler", () => {
  it("should change the current bowler", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );
    state.innings.legalBalls = 6;
    const result = changeBowler(state, "bowler-2");

    expect(result.currentBowlerId).toBe("bowler-2");
  });

  it("should reject the same bowler bowling consecutive overs", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );
    state.innings.legalBalls = 6;

    expect(() => changeBowler(state, "bowler-1")).toThrow(
      "A bowler cannot bowl consecutive overs",
    );
  });

  it("should not mutate the original state", () => {
    const state = createInningsState(
      "player-1",
      "player-2",
      "bowler-1",
      20,
      10,
    );
     state.innings.legalBalls = 6;
    const result = changeBowler(state, "bowler-2");

    expect(result).not.toBe(state);
    expect(state.currentBowlerId).toBe("bowler-1");
  });
  it("should reject bowler change before over completion", () => {
  const state = createInningsState(
    "player-1",
    "player-2",
    "bowler-1",
    20,
    10,
  );

  state.innings.legalBalls = 5;

  expect(() => changeBowler(state, "bowler-2")).toThrow(
    "Cannot change bowler before over completion",
  );
});
});