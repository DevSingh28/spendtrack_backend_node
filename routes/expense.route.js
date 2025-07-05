import express from "express";
import {
  addExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
  getCategoryTotal,
} from "../controllers/expense.controller.js";
import { verify_token } from "../middleware/token.generate.js";

const router = express.Router();

router.post("/", verify_token, addExpense);
router.get("/", verify_token, getExpenses);
router.put("/:id", verify_token, updateExpense);
router.delete("/:id", verify_token, deleteExpense);
router.get("/category-total", verify_token, getCategoryTotal);

export default router;
