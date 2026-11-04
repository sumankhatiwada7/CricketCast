import express from "express";
import cors from "cors";
import helmet from "helmet";

import healthRoutes from "./module/health/health.route.js";
import matcheRoutes from "./module/match/match.route.js"

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/match", matcheRoutes)

export default app;