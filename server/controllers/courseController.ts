import cloudinary from "cloudinary";
import { type NextFunction, type Request, type Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import {
    createCourse,
    findCourseById,
    findCourseByIdAndUpdate,
    findCourses,
} from "../services/courseService";
import ErrorHandler from "../utils/ErrorHandler";
import { redis } from "../utils/redis";

export const uploadCourse = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const thumbnail = data.thumbnail;
            if (thumbnail) {
                const myCloudinary = await cloudinary.v2.uploader.upload(
                    thumbnail,
                    {
                        folder: "courses",
                    }
                );

                data.thumbnail = {
                    public_id: myCloudinary.public_id,
                    url: myCloudinary.secure_url,
                };
            }

            const course = await createCourse(data);

            res.status(201).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const editCourse = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const thumbnail = data.thumbnail;
            if (thumbnail) {
                await cloudinary.v2.uploader.destroy(thumbnail.public_id);

                const myCloudinary = await cloudinary.v2.uploader.upload(
                    thumbnail,
                    {
                        folder: "courses",
                    }
                );

                data.thumbail = {
                    public_id: myCloudinary.public_id,
                    url: myCloudinary.secure_url,
                };
            }

            const courseId = req.params.id;
            const course = await findCourseByIdAndUpdate(courseId, data);

            res.status(201).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const getSingleCourseWithoutPurchasing = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const courseId = req.params.id;
            const isCacheExist = await redis.get(courseId);
            if (isCacheExist) {
                const course = JSON.parse(isCacheExist);
                res.status(200).json({
                    success: true,
                    course,
                });
            } else {
                const course = await findCourseById(
                    courseId,
                    "-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links"
                );

                await redis.set(courseId, JSON.stringify(course));

                res.status(200).json({
                    success: true,
                    course,
                });
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const getAllCoursesWithoutPurchasing = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isCacheExist = await redis.get("allCourses");
            if (isCacheExist) {
                const courses = JSON.parse(isCacheExist);
                res.status(200).json({
                    success: true,
                    courses,
                });
            } else {
                const courses = await findCourses(
                    "-courseData.videoUrl -courseData.suggestions -courseData.questions -courseData.links"
                );

                await redis.set("allCourses", JSON.stringify(courses));

                res.status(200).json({
                    success: true,
                    courses,
                });
            }
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);
