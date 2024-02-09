import { type NextFunction, type Request, type Response } from "express";
import cron from "node-cron";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import {
    deleteNotifications,
    findNotificationById,
    findNotifications,
} from "../services/notificationService";
import ErrorHandler from "../utils/ErrorHandler";

// Admin only
export const getNotifications = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notifications = await findNotifications({ createdAt: -1 });

            res.status(201).json({
                success: true,
                notifications,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const updateNotificationStatus = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const notification = await findNotificationById(req.params.id.toString());
            if (!notification) {
                return next(new ErrorHandler("Notification not found", 404));
            } else {
                notification.status ? (notification.status = "read") : notification.status;
            }

            await notification.save();

            const notifications = await findNotifications({ createdAt: -1 });

            res.status(201).json({
                success: true,
                notifications,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

const MILLISECONDS_BY_THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
cron.schedule("0 0 0 * * *", async () => {
    const thirtyDaysAgo = new Date(Date.now() - MILLISECONDS_BY_THREE_DAYS);
    await deleteNotifications({ status: "read", createdAt: { $lt: thirtyDaysAgo } });
    console.log("Deleted read notifications");
});
