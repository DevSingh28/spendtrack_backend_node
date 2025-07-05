import express from "express";
import {
  LoggedUser,
  LogoutC,
  userLogin,
  userRegister,
} from "../controllers/auth.controller.js";
import { verify_token } from "../middleware/token.generate.js";

const router = express.Router();

router.post("/login", userLogin);
router.post("/register", userRegister);
router.post("/me", verify_token, LoggedUser);
router.post("/logout", verify_token, LogoutC);

export default router;
