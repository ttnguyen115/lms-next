import express from "express";
import { activateUser, registrationUser } from "../controllers/userController";
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activation", activateUser);

export default userRouter;
