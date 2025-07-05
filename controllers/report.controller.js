import Expense from "../modals/expense.modal.js";
import Budget from "../modals/budget.modal.js";
import mongoose from "mongoose";

export const generateMonthlyReport = async (req, res) => {
  let { months, "months[]": monthsArray } = req.query;

  if (monthsArray) {
    months = monthsArray;
  } else if (typeof months === "string" && months.includes(",")) {
    months = months.split(",");
  }

  if (!months || (Array.isArray(months) && months.length === 0)) {
    return res.status(400).json({ message: "Month(s) required in query" });
  }

  if (!Array.isArray(months)) {
    months = [months];
  }
  const userId = req.user.id;

  if (!months) {
    return res.status(400).json({ message: "Month(s) required in query" });
  }

  try {
    const budgets = await Budget.find({ userId });
    const results = [];

    for (let month of months) {
      const start = new Date(`${month}-01`);
      const end = new Date(new Date(start).setMonth(start.getMonth() + 1));

      const expenses = await Expense.find({
        userId,
        date: { $gte: start, $lt: end },
      });

      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

      const categoryTotals = {};
      const paymentTotals = {};

      for (let exp of expenses) {
        categoryTotals[exp.category] =
          (categoryTotals[exp.category] || 0) + exp.amount;

        paymentTotals[exp.paymentMethod] =
          (paymentTotals[exp.paymentMethod] || 0) + exp.amount;
      }

      const topCategory = Object.entries(categoryTotals).reduce(
        (top, [cat, amt]) =>
          amt > top.amount ? { category: cat, amount: amt } : top,
        { category: "", amount: 0 }
      ).category;

      const overbudgetCategories = budgets
        .filter((budget) => {
          const spent = categoryTotals[budget.category] || 0;
          return spent > budget.monthlyLimit;
        })
        .map((budget) => budget.category);

      const topPaymentMethods = Object.entries(paymentTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([method, total]) => ({ method, total }));

      results.push({
        month,
        totalSpent,
        topCategory,
        overbudgetCategories,
        categoryBreakdown: categoryTotals,
        topPaymentMethods,
      });
    }

    return res.status(200).json({
      message: "Monthly report(s) generated",
      data: results,
    });
  } catch (error) {
    console.error("Generate Report Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getTotalPerCategory = async (req, res) => {
  const userId = req.user.id;
  console.log("hit");

  try {
    const totals = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const result = {};
    totals.forEach((item) => {
      result[item._id] = item.total;
    });

    return res.status(200).json({ data: result });
  } catch (error) {
    console.error("Category Total Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
