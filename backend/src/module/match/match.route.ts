import express from "express"
import { createMatchController } from "./match.controller.js";
const router = express.Router();


router.post("/", createMatchController);

export default router;