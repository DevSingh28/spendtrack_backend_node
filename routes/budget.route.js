import express from "express";
import {
  setOrUpdateBudget,
  checkBudgetAlert,
} from "../controllers/budget.controller.js";
import { verify_token } from "../middleware/token.generate.js";

const router = express.Router();

router.post("/", verify_token, setOrUpdateBudget);
router.get("/check-alert", verify_token, checkBudgetAlert);

export default router;
