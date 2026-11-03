import { HealthCheckResponse } from "./health.type.js";
import { prisma } from "../../core/config/database.js";
import { Request, Response } from "express";
export async function healthCheck(req: Request, res: Response) {

    try{
      await prisma.$queryRaw`SELECT 1`;
      const response: HealthCheckResponse = {
        success: true,
        message: "Health check successful",
        database: "Database connection successful",
        timestamp: new Date().toISOString(),
      }
      return res.status(200).json(response);
    }
    catch(error){
        console.error("Health check failed:", error);
        const response: HealthCheckResponse = {
            success: false,
            message: "Health check failed",
            database: "Database connection failed",
            timestamp: new Date().toISOString(),
        }
        return res.status(500).json(response);
    }
}