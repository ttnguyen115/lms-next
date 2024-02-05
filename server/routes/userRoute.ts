import express from "express";
import {
    activateUser,
    loginUser,
    logoutUser,
    registrationUser,
    updateAccessToken,
} from "../controllers/userController";
import { isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activation", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refreshToken", updateAccessToken);

export default userRouter;
