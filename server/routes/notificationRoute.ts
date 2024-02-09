import express from "express";
import { getNotifications, updateNotificationStatus } from "../controllers/notificationController";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const notificationRouter = express.Router();

notificationRouter.get(
    "/notifications",
    isAuthenticated,
    authorizeRoles("admin"),
    getNotifications
);

notificationRouter.put(
    "/update-notification/:id",
    isAuthenticated,
    authorizeRoles("admin"),
    updateNotificationStatus
);

export default notificationRouter;
