import { describe, it, expect } from "vitest";
import {
  calculateDelivery,
  formatOvers,
  updateBowlerScore,
  updatedBatterScore,
  calculateStrikeRate,
  calculateEconomyRate,
  calculateRunRate,
  updateExtrasScore
} from "./scoring.service.js";
import type { BowlerScore, InningsScore ,ExtrasScore} from "./scoring.type.js";

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