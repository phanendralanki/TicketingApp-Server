import { Router } from "express";
import {loginUser, registerUser,refreshAccessToken,logoutUser,forgotPassword} from "../controllers/user.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/forgotPassword").post(forgotPassword);

//secured routes
router.route("/logout").post(verifyJWT,logoutUser);

export default router;