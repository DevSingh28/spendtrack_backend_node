import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { DBConnector } from "./connectdb/db.connect.js";
import authRoutes from "./routes/auth.route.js";
import expenseRoutes from "./routes/expense.route.js";
import reportRoutes from "./routes/monthlyreport.route.js";
import budgetRoutes from "./routes/budget.route.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("I am On");
});

app.use("/api", authRoutes);
app.use("/exp", expenseRoutes);
app.use("/report", reportRoutes);
app.use("/budget", budgetRoutes);

const startServer = async () => {
  try {
    await DBConnector();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error.message);
  }
};

startServer();
