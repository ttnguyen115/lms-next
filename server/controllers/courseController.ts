import cloudinary from "cloudinary";
import ejs from "ejs";
import { type NextFunction, type Request, type Response } from "express";
import path from "path";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import NotificationModel from "../models/notificationModel";
import {
    createCourse,
    findCourseById,
    findCourseByIdAndUpdate,
    findCourses,
} from "../services/courseService";
import ErrorHandler from "../utils/ErrorHandler";
import { isValidMongoTypesObjectId } from "../utils/isValidMongoTypesObjectId";
import { redis } from "../utils/redis";
import sendMail from "../utils/sendMail";

interface IAddQuestion {
    question: string;
    courseId: string;
    contentId: string;
}

interface IAddAnswerData {
    answer: string;
    courseId: string;
    contentId: string;
    questionId: string;
}

interface IAddReviewData {
    review: string;
    courseId: string;
    rating: number;
    userId: string;
}

interface IAddReplyToReviewData {
    comment: string;
    courseId: string;
    reviewId: string;
}

export const uploadCourse = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body;
            const thumbnail = data.thumbnail;
            if (thumbnail) {
                const myCloudinary = await cloudinary.v2.uploader.upload(thumbnail, {
                    folder: "courses",
                });

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

                const myCloudinary = await cloudinary.v2.uploader.upload(thumbnail, {
                    folder: "courses",
                });

                data.thumbnail = {
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

export const getCourseByValidUser = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCourses = req.user?.courses;
            const courseId = req.params.id;
            const isCourseExists = userCourses?.find(
                (course: any) => course._id.toString() === courseId
            );
            if (!isCourseExists) {
                return next(new ErrorHandler("You are not eligible to access this course", 404));
            }

            const course = await findCourseById(courseId);
            const content = course?.courseData;

            res.status(200).json({
                success: true,
                content,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const addQuestion = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { question, courseId, contentId }: IAddQuestion = req.body;
            const course = await findCourseById(courseId);
            if (!isValidMongoTypesObjectId(contentId)) {
                return next(new ErrorHandler("Invalid content ID", 400));
            }

            const courseContent = course?.courseData?.find((item: any) =>
                item._id.equals(contentId)
            );
            if (!courseContent) {
                return next(new ErrorHandler("Invalid content ID", 400));
            }

            const newQuestion: any = {
                user: req.user,
                question,
                questionReplies: [],
            };
            courseContent.questions.push(newQuestion);

            await NotificationModel.create({
                user: req.user?._id,
                title: "New Question Received",
                message: `You have a new question in ${courseContent.title}`,
            });

            await course?.save();

            res.status(200).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const addAnswer = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { answer, courseId, contentId, questionId }: IAddAnswerData = req.body;
            const course = await findCourseById(courseId);
            if (!isValidMongoTypesObjectId(contentId)) {
                return next(new ErrorHandler("Invalid content ID", 400));
            }

            const courseContent = course?.courseData?.find((item: any) =>
                item._id.equals(contentId)
            );
            if (!courseContent) {
                return next(new ErrorHandler("Invalid content ID", 400));
            }

            const question = courseContent?.questions?.find((item: any) =>
                item._id.equals(questionId)
            );
            if (!question) {
                return next(new ErrorHandler("Invalid question ID", 400));
            }

            const newAnswer: any = {
                user: req.user,
                answer,
            };
            question.questionReplies?.push(newAnswer);

            await course?.save();

            if (req.user?._id === question.user._id) {
                await NotificationModel.create({
                    user: req.user?._id,
                    title: "New Question Reply Received",
                    message: `You have a new question reply in ${courseContent.title}`,
                });
            } else {
                const data = {
                    name: question.user.name,
                    title: courseContent.title,
                };
                const html = await ejs.renderFile(
                    path.join(__dirname, "../mails/question-reply.ejs"),
                    data
                );

                try {
                    await sendMail({
                        email: question.user.email,
                        subject: "Question Reply",
                        template: "question-reply.ejs",
                        data,
                    });
                } catch (error: any) {
                    return next(new ErrorHandler(error.message, 500));
                }
            }

            res.status(201).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const addReview = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userCourses = req.user?.courses;
            const courseId = req.params.id;
            const isCourseExists = userCourses?.some(
                (course: any) => course._id.toString() === courseId.toString()
            );
            if (!isCourseExists) {
                return next(new ErrorHandler("You are not eligible to access this course", 404));
            }

            const course = await findCourseById(courseId);
            const { review, rating }: IAddReviewData = req.body;
            const reviewData: any = {
                user: req.user,
                comment: review,
                rating,
            };

            course?.reviews.push(reviewData);

            let avg = 0;
            course?.reviews.forEach((review: any) => {
                avg += review.rating;
            });

            if (course) {
                course.ratings = avg / course?.reviews.length;
            }

            await course?.save();
            await NotificationModel.create({
                user: req.user?._id,
                title: "New Review Received",
                message: `${req.user?.name} has given a review in ${course?.name}`,
            });

            res.status(200).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const addReplyToReview = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { comment, courseId, reviewId }: IAddReplyToReviewData = req.body;
            const course = await findCourseById(courseId);
            if (!course) {
                return next(new ErrorHandler("Course not found", 404));
            }

            const review = course?.reviews?.find(
                (review: any) => review._id.toString() === reviewId
            );
            if (!review) {
                return next(new ErrorHandler("Review not found", 404));
            }

            const replyData: any = {
                user: req.user,
                comment,
            };
            if (!review.commentReplies) {
                review.commentReplies = [];
            }
            review.commentReplies?.push(replyData);

            await course?.save();
            await NotificationModel.create({
                user: req.user?._id,
                title: "New Review Reply Received",
                message: `${req.user?.name} has given a review in ${course?.name}`,
            });

            res.status(200).json({
                success: true,
                course,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

// Admin only
export const getAllCourses = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const courses = await findCourses();
            res.status(200).json({
                success: true,
                courses,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 400));
        }
    }
);
