import ejs from "ejs";
import { type NextFunction, type Request, type Response } from "express";
import path from "path";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import NotificationModel from "../models/notificationModel";
import { IOrder } from "../models/orderModel";
import { findCourseById } from "../services/courseService";
import { findAllOrders, newOrder } from "../services/orderService";
import { findUserById } from "../services/userService";
import ErrorHandler from "../utils/ErrorHandler";
import sendMail from "../utils/sendMail";

export const createOrder = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { courseId, payment_info }: IOrder = req.body;
            const user = await findUserById(req.user?._id);
            const isCourseExistsInUser = user?.courses.some(
                (course: any) => course._id.toString() === courseId
            );
            if (isCourseExistsInUser) {
                return next(new ErrorHandler("Your have already purchased this course", 400));
            }

            const course = await findCourseById(courseId);
            if (!course) {
                return next(new ErrorHandler("Course not found", 404));
            }

            const data: any = {
                courseId: course._id,
                userId: user?._id,
                payment_info,
            };
            const mailData = {
                order: {
                    _id: course._id.toString().slice(0, 6),
                    name: course.name,
                    price: course.price,
                    date: new Date().toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    }),
                },
            };
            const html = await ejs.renderFile(
                path.join(__dirname, "../mails/order-confirmation.ejs"),
                { order: mailData }
            );

            try {
                if (user) {
                    await sendMail({
                        email: user.email,
                        subject: "Order Confirmation",
                        template: "order-confirmation.ejs",
                        data: mailData,
                    });
                }
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 500));
            }

            user?.courses.push(course?._id);

            await user?.save();

            await NotificationModel.create({
                user: user?._id,
                title: "New Order",
                message: `You have a new order from ${course?.name}`,
            });

            const order = await newOrder(data);

            res.status(201).json({
                success: true,
                order,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

// Admin only
export const getAllOrders = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const orders = await findAllOrders();
            res.status(200).json({
                success: true,
                orders,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);
