import jwt from "jsonwebtoken";

export const generate_token = async (res, id) => {
  try {
    const token = jwt.sign({ id }, process.env.SECRET_TOKEN, {
      expiresIn: "7d",
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    res.status(400).json({ message: "error while generating cookie and jwt." });
  }
};

export const verify_token = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authentication required" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_TOKEN);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
