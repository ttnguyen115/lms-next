require("dotenv").config();
import { type Response } from "express";
import { type IUser } from "../models/userModel";
import { redis } from "./redis";

interface ITokenOptions {
    expires: Date;
    maxAge: number;
    httpOnly: boolean;
    sameSite: "lax" | "strict" | "none" | undefined;
    secure?: boolean;
}

const FALLBACK_ACCESS_TOKEN_EXPIRE = "300";
const FALLBACK_REFRESH_TOKEN_EXPIRE = "1200";
const MILLISECONDS_PER_MINUTES = 1000;
const RADIX = 10;

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
    const accessToken = user.signAccessToken();
    const refreshToken = user.signRefreshToken();

    // Upload session to redis
    redis.set(user._id, JSON.stringify(user));

    // Parse env to integrates with fallback values
    const accessTokenExpire = parseInt(
        process.env.ACCESS_TOKEN_EXPIRE || FALLBACK_ACCESS_TOKEN_EXPIRE,
        RADIX
    );
    const refreshTokenExpire = parseInt(
        process.env.REFRESH_TOKEN_EXPIRE || FALLBACK_REFRESH_TOKEN_EXPIRE,
        RADIX
    );

    // Options for cookies
    const accessTokenOptions: ITokenOptions = {
        expires: new Date(
            Date.now() + accessTokenExpire * MILLISECONDS_PER_MINUTES
        ),
        maxAge: accessTokenExpire * MILLISECONDS_PER_MINUTES,
        httpOnly: true,
        sameSite: "lax",
    };

    const refreshTokenOptions: ITokenOptions = {
        expires: new Date(
            Date.now() + refreshTokenExpire * MILLISECONDS_PER_MINUTES
        ),
        maxAge: refreshTokenExpire * MILLISECONDS_PER_MINUTES,
        httpOnly: true,
        sameSite: "lax",
    };

    // Only set secure to true in production
    if (process.env.NODE_ENV === "production") {
        accessTokenOptions.secure = true;
    }

    res.cookie("access_token", accessToken, accessTokenOptions);
    res.cookie("refresh_token", refreshToken, refreshTokenOptions);

    res.status(statusCode).json({
        success: true,
        user,
        accessToken,
    });
};
