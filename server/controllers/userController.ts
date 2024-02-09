require("dotenv").config();
import cloudinary from "cloudinary";
import ejs from "ejs";
import { type NextFunction, type Request, type Response } from "express";
import jwt, { JwtPayload, type Secret } from "jsonwebtoken";
import path from "path";

import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import UserModel, { IUser } from "../models/userModel";
import {
    deleteUserById,
    findAllUsers,
    findUserByEmail,
    findUserById,
    updateUserRoleById,
} from "../services/userService";
import ErrorHandler from "../utils/ErrorHandler";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
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

type ISocialAuthBody = Omit<IRegistrationBody, "password">;

interface IUpdateUserInfo {
    name?: string;
    email?: string;
}

interface IUpdatePassword {
    oldPassword: string;
    newPassword: string;
}

interface IUpdateProfilePicture {
    avatar: {
        public_id: string;
        url: string;
    };
}

const MILLISECONDS_BY_7_DAYS = 604800;

export const registrationUser = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email, password } = req.body;
            const isEmailExist = await findUserByEmail(email);
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
            const { activation_token, activation_code } = req.body as IActivationRequest;
            const newUser: { user: IUser; activationCode: string } = jwt.verify(
                activation_token,
                process.env.ACTIVATION_SECRET as string
            ) as { user: IUser; activationCode: string };

            if (newUser.activationCode !== activation_code) {
                return next(new ErrorHandler("Invalid activation code", 400));
            }

            const { name, email, password } = newUser.user;
            const existUser = await findUserByEmail(email);

            if (existUser) {
                return next(new ErrorHandler("Email already exists", 400));
            }

            const user = await UserModel.create({
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
                return next(new ErrorHandler("Please enter email and password", 400));
            }

            const user = await findUserByEmail(email, true);
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

            const userId = req.user?._id || "";
            redis.del(userId);

            res.status(200).json({
                success: true,
                message: "Logged out successfully",
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const updateAccessToken = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refresh_token = req.cookies.refresh_token as string;
            const decoded = jwt.verify(
                refresh_token,
                process.env.REFRESH_TOKEN as string
            ) as JwtPayload;
            const tokenError = new ErrorHandler("Please login to access this resource", 400);
            if (!decoded) return next(tokenError);

            const session = await redis.get(decoded.id as string);
            if (!session) return next(tokenError);

            const user = JSON.parse(session);
            const accessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN as string, {
                expiresIn: "5m",
            });
            const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN as string, {
                expiresIn: "3d",
            });

            req.user = user;

            res.cookie("access_token", accessToken, accessTokenOptions);
            res.cookie("refresh_token", refreshToken, refreshTokenOptions);

            await redis.set(user._id, JSON.stringify(user), "EX", MILLISECONDS_BY_7_DAYS);

            res.status(200).json({
                success: true,
                accessToken,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const getUserInfo = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?._id;
            const user = await findUserById(userId);
            res.status(201).json({
                success: true,
                user,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const socialAuth = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, name, avatar } = req.body as ISocialAuthBody;
            const user = await findUserByEmail(email);
            if (!user) {
                const newUser = await UserModel.create({ name, email, avatar });
                sendToken(newUser, 200, res);
            } else {
                sendToken(user, 200, res);
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const updateUserInfo = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name, email } = req.body as IUpdateUserInfo;
            const userId = req.user?._id;
            const user = await findUserById(userId);
            if (email && user) {
                const isEmailExist = await findUserByEmail(email);
                if (isEmailExist) {
                    return next(new ErrorHandler("Email already exists", 400));
                }
                user.email = email;
            }
            if (name && user) user.name = name;

            await user?.save();
            await redis.set(userId, JSON.stringify(user));

            res.status(201).json({
                success: true,
                user,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const updatePassword = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { oldPassword, newPassword } = req.body as IUpdatePassword;
            if (!oldPassword || !newPassword) {
                return next(new ErrorHandler("Please enter old and new passwords", 400));
            }

            const user = await findUserById(req.user?._id, true);
            if (!user?.password) {
                return next(new ErrorHandler("Invalid user", 400));
            }

            const isPasswordMatch = await user?.comparePassword(oldPassword);
            if (!isPasswordMatch) {
                return next(new ErrorHandler("Invalid old password", 400));
            }

            user.password = newPassword;

            await user.save();
            await redis.set(req.user?._id, JSON.stringify(user));

            res.status(201).json({
                success: true,
                user,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const updateProfilePicture = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { avatar } = req.body;
            const userId = req.user?._id;
            const user = await findUserById(userId);

            if (avatar && user) {
                if (user?.avatar.public_id) {
                    // Delete old image
                    await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

                    const myCloudinary = await cloudinary.v2.uploader.upload(avatar, {
                        folder: "avatars",
                        width: 150,
                    });
                } else {
                    const myCloudinary = await cloudinary.v2.uploader.upload(avatar, {
                        folder: "avatars",
                        width: 150,
                    });
                    user.avatar = {
                        public_id: myCloudinary.public_id,
                        url: myCloudinary.secure_url,
                    };
                }
            }

            await user?.save();
            await redis.set(userId, JSON.stringify(user));

            res.status(201).json({
                success: true,
                user,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

// Admin only
export const getAllUsers = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await findAllUsers();
            res.status(200).json({
                success: true,
                users,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

// Admin only
export const updateUserRole = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id, role } = req.body;
            const user = await updateUserRoleById(id, role);
            res.status(201).json({
                success: true,
                user,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

// Admin only
export const deleteUser = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const user = await findUserById(id);
            if (!user) {
                return next(new ErrorHandler("User not found", 404));
            }

            await deleteUserById(id);
            await redis.del(id);

            res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);

export const createActivationToken = (user: IRegistrationBody): IActivationToken => {
    const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = jwt.sign({ user, activationCode }, process.env.ACTIVATION_SECRET as Secret, {
        expiresIn: "5m",
    });
    return { token, activationCode };
};
