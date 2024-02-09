import express from "express";
import {
    activateUser,
    getAllUsers,
    getUserInfo,
    loginUser,
    logoutUser,
    registrationUser,
    socialAuth,
    updateAccessToken,
    updatePassword,
    updateProfilePicture,
    updateUserInfo,
} from "../controllers/userController";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activation", activateUser);
userRouter.post("/login", loginUser);
userRouter.get("/logout", isAuthenticated, logoutUser);
userRouter.get("/refreshToken", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/socialAuth", socialAuth);
userRouter.put("/updateUser", isAuthenticated, updateUserInfo);
userRouter.put("/updatePassword", isAuthenticated, updatePassword);
userRouter.put("/updateProfilePicture", isAuthenticated, updateProfilePicture);
userRouter.get("/get-users", isAuthenticated, authorizeRoles("admin"), getAllUsers);

export default userRouter;
