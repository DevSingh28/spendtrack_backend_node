import Expense from "../modals/expense.modal.js";
import mongoose from "mongoose";

export const addExpense = async (req, res) => {
  const { amount, category, date, paymentMethod, notes } = req.body;
  const userId = req.user.id;
  console.log({ amount, category, paymentMethod });

  if (amount == null || !category || !paymentMethod) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    const expense = await Expense.create({
      userId,
      amount,
      category,
      date,
      paymentMethod,
      notes,
    });
    return res.status(201).json({ message: "Expense added", data: expense });
  } catch (error) {
    console.error("Add Expense Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getExpenses = async (req, res) => {
  const userId = req.user.id;
  const { category, paymentMethod, from, to, search } = req.query;

  const filter = { userId };

  if (category) filter.category = category;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  if (from && to) {
    filter.date = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  }

  if (search) {
    filter.notes = { $regex: search, $options: "i" };
  }

  try {
    const expenses = await Expense.find(filter).sort({ date: -1 });
    return res.status(200).json({ data: expenses });
  } catch (error) {
    console.error("Get Expenses Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const updateExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: id, userId },
      req.body,
      { new: true }
    );

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({ message: "Expense updated", data: expense });
  } catch (error) {
    console.error("Update Expense Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const deleted = await Expense.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      return res.status(404).json({ message: "Expense not found" });
    }

    return res.status(200).json({ message: "Expense deleted" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getCategoryTotal = async (req, res) => {
  const userId = req.user.id;
  // const { category, month, from, to } = req.query; // replace with req.user.id in real use

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  try {
    const match = {
      userId: new mongoose.Types.ObjectId(userId),
      category,
    };

    if (month) {
      const start = new Date(`${month}-01`);
      const end = new Date(new Date(start).setMonth(start.getMonth() + 1));
      match.date = { $gte: start, $lt: end };
    } else if (from && to) {
      match.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const total = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    return res.status(200).json({ totalSpent: total[0]?.totalSpent || 0 });
  } catch (error) {
    console.error("Category Total Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
