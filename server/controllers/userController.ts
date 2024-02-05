require("dotenv").config();
import ejs from "ejs";
import { type NextFunction, type Request, type Response } from "express";
import jwt, { type Secret } from "jsonwebtoken";
import path from "path";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import userModel, { IUser } from "../models/userModel";
import ErrorHandler from "../utils/ErrorHandler";
import { sendToken } from "../utils/jwt";
import sendMail from "../utils/sendMail";

interface IRegistrationBody {
    name: string;
    email: string;
    password: string;
    avatar?: string;
}

interface IActivationToken {
    token: string;
    activationCode: string;
}

interface IActivationRequest {
    activation_token: string;
    activation_code: string;
}

interface ILoginRequest {
    email: string;
    password: string;
}

export const registrationUser = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password } = req.body;
            const isEmailExist = await userModel.findOne({ email });
            if (isEmailExist) {
                return next(new ErrorHandler("Email already exist", 400));
            }

            const user: IRegistrationBody = {
                name,
                email,
                password,
            };
            const activationToken = createActivationToken(user);
            const { activationCode, token } = activationToken;
            const data = { user: { name: user.name }, activationCode };
            const html = await ejs.renderFile(
                path.join(__dirname, "../mails/activationMail.ejs"),
                data
            );

            try {
                await sendMail({
                    email: user.email,
                    subject: "Activate your account",
                    template: "activationMail.ejs",
                    data,
                });
                res.status(201).json({
                    success: true,
                    message: `Please check your email: ${user.email} to activate your account!`,
                    activationToken: token,
                });
            } catch (error: any) {
                return next(new ErrorHandler(error.message, 400));
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const activateUser = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { activation_token, activation_code } =
                req.body as IActivationRequest;
            const newUser: { user: IUser; activationCode: string } = jwt.verify(
                activation_token,
                process.env.ACTIVATION_SECRET as string
            ) as { user: IUser; activationCode: string };

            if (newUser.activationCode !== activation_code) {
                return next(new ErrorHandler("Invalid activation code", 400));
            }

            const { name, email, password } = newUser.user;
            const existUser = await userModel.findOne({ email });

            if (existUser) {
                return next(new ErrorHandler("Email already exists", 400));
            }

            const user = await userModel.create({
                name,
                email,
                password,
            });

            res.status(201).json({
                success: true,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const loginUser = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body as ILoginRequest;
            if (!email || !password) {
                return next(
                    new ErrorHandler("Please enter email and password", 400)
                );
            }

            const user = await userModel.findOne({ email }).select("+password");
            if (!user) {
                return next(new ErrorHandler("Invalid email or password", 400));
            }

            const isPasswordMatch = await user.comparePassword(password);
            if (!isPasswordMatch) {
                return next(new ErrorHandler("Password is incorrect", 400));
            }

            sendToken(user, 200, res);
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const logoutUser = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.cookie("access_token", "", { maxAge: 1 });
            res.cookie("refresh_token", "", { maxAge: 1 });
            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const createActivationToken = (
    user: IRegistrationBody
): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign(
        { user, activationCode },
        process.env.ACTIVATION_SECRET as Secret,
        {
            expiresIn: "5m",
        }
    );
    return { token, activationCode };
};