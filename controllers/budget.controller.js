import Expense from "../modals/expense.modal.js";
import Budget from "../modals/budget.modal.js";
import mongoose from "mongoose";

export const setOrUpdateBudget = async (req, res) => {
  const { category, monthlyLimit } = req.body;
  const userId = req.user.id;

  if (!category || !monthlyLimit) {
    return res
      .status(400)
      .json({ message: "Category and monthly limit required." });
  }

  try {
    const existing = await Budget.findOne({ userId, category });

    if (existing) {
      existing.monthlyLimit = monthlyLimit;
      await existing.save();
      return res
        .status(200)
        .json({ message: "Budget updated", data: existing });
    }

    const budget = await Budget.create({ userId, category, monthlyLimit });
    return res.status(201).json({ message: "Budget created", data: budget });
  } catch (error) {
    console.error("Set Budget Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const checkBudgetAlert = async (req, res) => {
  const { category, month } = req.query;
  const userId = req.user.id;

  if (!category || !month) {
    return res
      .status(400)
      .json({ message: "Category and month are required." });
  }

  try {
    const start = new Date(`${month}-01`);
    const end = new Date(new Date(start).setMonth(start.getMonth() + 1));

    const total = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          category,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const totalSpent = total[0]?.totalSpent || 0;

    const budget = await Budget.findOne({ userId, category });

    const monthlyLimit = budget?.monthlyLimit ?? 15000;
    const percent = (totalSpent / monthlyLimit) * 100;

    let alert = null;
    if (percent >= 100) {
      alert = "You have exceeded your budget limit!";
    } else if (percent >= 80) {
      alert = "You have used 80% of your budget limit.";
    }

    return res.status(200).json({
      category,
      month,
      totalSpent,
      monthlyLimit,
      percentageUsed: percent.toFixed(2),
      alert,
      isDefault: !budget,
    });
  } catch (error) {
    console.error("Budget Alert Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
