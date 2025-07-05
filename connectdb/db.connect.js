import mongoose from "mongoose";

export const DBConnector = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to db");
  } catch (error) {
    console.error("Error in connecting to the database:", error.message);
  }
};
