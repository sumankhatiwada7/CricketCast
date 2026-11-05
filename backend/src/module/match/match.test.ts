import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

import app from "../../app.js";
import { createMatch } from "./match.service.js";

vi.mock("./match.service.js", () => ({
  createMatch: vi.fn(),
  MatchServiceError: class MatchServiceError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

describe("POST /api/v1/match", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a match successfully", async () => {
    const mockMatch = {
      id: "match-123",
      format: "T20",
      totalOvers: 20,
      tournamentId: "tournament-123",
      teamAId: "team-1",
      teamBId: "team-2",
    };

    vi.mocked(createMatch).mockResolvedValue(mockMatch as never);

    const response = await request(app).post("/api/v1/match").send({
      tournamentId: "tournament-123",
      teamAId: "team-1",
      teamBId: "team-2",
      format: "T20",
      totalOvers: 20,
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Match created successfully");
    expect(response.body.data.id).toBe("match-123");

    expect(createMatch).toHaveBeenCalledWith(
      expect.objectContaining({
        tournamentId: "tournament-123",
        teamAId: "team-1",
        teamBId: "team-2",
        format: "T20",
        totalOvers: 20,
      }),
    );
  });

  it("should reject a request with missing required IDs", async () => {
    const response = await request(app).post("/api/v1/match").send({
      format: "T20",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Tournament ID, Team A ID and Team B ID are required",
    );

    expect(createMatch).not.toHaveBeenCalled();
  });

  it("should reject the same team playing against itself", async () => {
    const response = await request(app).post("/api/v1/match").send({
      tournamentId: "tournament-123",
      teamAId: "team-1",
      teamBId: "team-1",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Team A and Team B cannot be the same");

    expect(createMatch).not.toHaveBeenCalled();
  });

  it("should reject  a invalid match format", async () => {
    const response = await request(app).post("/api/v1/match").send({
      tournamentId: "tournament-123",
      teamAId: "team-1",
      teamBId: "team-2",
      format: "INVALID_FORMAT",
    });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid match format");
    expect(createMatch).not.toHaveBeenCalled();
  });

  it("should reject invalid total overs", async () => {
    const response = await request(app).post("/api/v1/match").send({
      tournamentId: "tournament-123",
      teamAId: "team-1",
      teamBId: "team-2",
      totalOvers: -20,
    });
    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Total overs must be a positive integer",
    );
    expect(createMatch).not.toHaveBeenCalled();
  });
  it("should reject an invalid scheduled date", async () => {
    const response = await request(app).post("/api/v1/match").send({
      tournamentId: "tournament-123",
      teamAId: "team-1",
      teamBId: "team-2",
      scheduledAt: "not-a-valid-date",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid scheduled date");
    expect(createMatch).not.toHaveBeenCalled();
  });

  it("should return 404 when tournament does not exist", async () => {
    vi.mocked(createMatch).mockRejectedValueOnce(
      new (await import("./match.service.js")).MatchServiceError(
        "Tournament not found",
        404,
      ),
    );

    const response = await request(app).post("/api/v1/match").send({
      tournamentId: "invalid-tournament",
      teamAId: "team-1",
      teamBId: "team-2",
    });

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Tournament not found");
  });
  it("should return 400 when team is not registered in tournament", async () => {
    vi.mocked(createMatch).mockRejectedValueOnce(
      new (await import("./match.service.js")).MatchServiceError(
        "Team A is not registered in this tournament",
        400,
      ),
    );

    const response = await request(app).post("/api/v1/match").send({
      tournamentId: "tournament-123",
      teamAId: "team-1",
      teamBId: "team-2",
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Team A is not registered in this tournament",
    );
  });
});
