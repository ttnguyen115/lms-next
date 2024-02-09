require("dotenv").config();
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { ErrorMiddleware } from "./middleware/error";
import { courseRouter, notificationRouter, orderRouter, userRouter } from "./routes";

export const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.ORIGIN,
    })
);

// Routes
app.use("/api/v1", userRouter, courseRouter, orderRouter, notificationRouter);

// Checking API health
app.get("/health", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: "API is working",
    });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err["statusCode"] = 404;
    next(err);
});

app.use(ErrorMiddleware);
