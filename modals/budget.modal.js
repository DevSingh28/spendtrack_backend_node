import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Food",
        "Rent",
        "Shopping",
        "Transport",
        "Utilities",
        "Entertainment",
        "Health",
        "Education",
        "Travel",
        "Miscellaneous",
      ],
    },
    monthlyLimit: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);
