import { type NextFunction, type Request, type Response } from "express";
import { generateLast12MonthsData } from ".";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import CourseModel from "../models/courseModel";
import OrderModel from "../models/orderModel";
import UserModel from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";

export const getUsersAnalytics = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await generateLast12MonthsData(UserModel);
            res.status(200).json({
                success: true,
                users,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const getCoursesAnalytics = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const courses = await generateLast12MonthsData(CourseModel);
            res.status(200).json({
                success: true,
                courses,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const getOrdersAnalytics = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orders = await generateLast12MonthsData(OrderModel);
            res.status(200).json({
                success: true,
                orders,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);
