import cloudinary from "cloudinary";
import { type NextFunction, type Request, type Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import {
    createCourse,
    findCourseByIdAndUpdate,
} from "../services/courseService";
import ErrorHandler from "../utils/ErrorHandler";

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
