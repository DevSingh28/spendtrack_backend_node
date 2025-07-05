import express from "express";
import {
  generateMonthlyReport,
  getTotalPerCategory,
} from "../controllers/report.controller.js";
import { verify_token } from "../middleware/token.generate.js";

const router = express.Router();

router.get("/generate", verify_token, generateMonthlyReport);
router.get("/total", verify_token, getTotalPerCategory);

export default router;
