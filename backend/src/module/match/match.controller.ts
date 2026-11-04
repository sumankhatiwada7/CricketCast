
import type { Request, Response } from "express";
import { createMatch, MatchServiceError ,} from "./match.service.js";
import type { CreateMatchInput,matchapiResponse ,matchcreateResponse} from "./match.type.js";

const allowedFormats = ["T10", "T20", "ODI", "TEST", "CUSTOM"];

export const createMatchController = async (
  req: Request,
  res: Response,
) => {
  try {
    const body = req.body as Record<string, unknown>;

    const { tournamentId, teamAId, teamBId } = body;

    if (
      typeof tournamentId !== "string" ||
      typeof teamAId !== "string" ||
      typeof teamBId !== "string" ||
      !tournamentId ||
      !teamAId ||
      !teamBId
    ) {
      const payload:matchapiResponse = {
        message: "Tournament ID, Team A ID and Team B ID are required",
        success: false
      };
      return res.status(400).json(payload);
    }

    if (teamAId === teamBId) {
      const payload:matchapiResponse = {
        message: "Team A and Team B cannot be the same",
        success: false
      };
      return res.status(400).json(payload);
    }

    const format = body.format ?? "T20";

    if (
      typeof format !== "string" ||
      !allowedFormats.includes(format)
    ) {
      const payload:matchapiResponse = {
        message: "Invalid match format",
        success: false
      };
      return res.status(400).json(payload);
    }

    const totalOvers = body.totalOvers ?? 20;

    if (
      typeof totalOvers !== "number" ||
      !Number.isInteger(totalOvers) ||
      totalOvers <= 0
    ) {
      const payload:matchapiResponse = {
        message: "Total overs must be a positive integer",
        success: false
      };
        return res.status(400).json(payload);
    }

    if (
      body.scheduledAt !== undefined &&
      (
        typeof body.scheduledAt !== "string" ||
        Number.isNaN(Date.parse(body.scheduledAt))
      )
    ) {
      const payload:matchapiResponse = {
        message: "Invalid scheduled date",
        success: false
      };
      return res.status(400).json(payload);
    }

    if (body.name !== undefined && typeof body.name !== "string") {
        const payload:matchapiResponse = {
            message: "Match name must be a string",
            success: false
        };
        return res.status(400).json(payload);
    }

    if (body.venue !== undefined && typeof body.venue !== "string") {
        const payload:matchapiResponse = {
            message: "Match venue must be a string",
            success: false
        };
        return res.status(400).json(payload);

    }

    const matchData: CreateMatchInput = {
      tournamentId,
      teamAId,
      teamBId,
      format: format as CreateMatchInput["format"],
      totalOvers,
      name: body.name as string | undefined,
      venue: body.venue as string | undefined,
      scheduledAt: body.scheduledAt as string | undefined,
    };

    const match = await createMatch(matchData);

    const payload: matchcreateResponse<typeof match> = {
      message: "Match created successfully",
      success: true,
      data: match,
    };
    return res.status(201).json(payload);
  } catch (error) {
    if (error instanceof MatchServiceError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Create match error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
