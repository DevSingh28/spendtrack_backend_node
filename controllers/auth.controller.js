import User from "../modals/user.modal.js";
import mongoose from "mongoose";
import bcryptjs from "bcryptjs";
import { generate_token } from "../middleware/token.generate.js";

export const userRegister = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    const isalready = await User.findOne({ email });
    if (isalready) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashPass = await bcryptjs.hash(password, 10);
    const newuser = new User({
      name,
      email,
      password: hashPass,
    });
    await newuser.save();

    generate_token(res, newuser._id);

    return res.status(201).json({
      message: "User registered successfully",
      data: { name: newuser.name, email, _id: newuser._id },
    });
  } catch (error) {
    console.error("Error in Register:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "all fields required." });
  }

  try {
    const isuser = await User.findOne({ email });
    if (!isuser) {
      return res
        .status(400)
        .json({ message: "No account exists with this email." });
    }

    const ispassword_match = await bcryptjs.compare(password, isuser.password);
    if (!ispassword_match) {
      return res.status(400).json({ message: "Password incorrect" });
    }

    generate_token(res, isuser._id);

    return res.status(200).json({
      message: "Login success",
      data: {
        name: isuser.name,
        email: isuser.email,
        role: isuser.role,
        _id: isuser._id,
      },
    });
  } catch (error) {
    console.error("Error in Login:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const LoggedUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const LogoutC = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
  res.status(200).json({ message: "Logout Successful" });
};
