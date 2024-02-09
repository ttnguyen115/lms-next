import cloudinary from "cloudinary";
import { NextFunction, Request, Response } from "express";
import { CatchAsyncErrors } from "../middleware/catchAsyncErrors";
import LayoutModel from "../models/layoutModel";
import ErrorHandler from "../utils/ErrorHandler";

export const getLayoutByType = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type } = req.body;
            const layout = await LayoutModel.findOne({ type });

            res.status(200).json({
                success: true,
                layout,
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const createLayout = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type } = req.body;
            const isTypeExist = await LayoutModel.findOne({ type });
            if (isTypeExist) {
                return next(new ErrorHandler(`${type} already exists`, 400));
            }

            if (type === "Banner") {
                const { image, title, subTitle } = req.body;
                const myCloudinary = await cloudinary.v2.uploader.upload(image, {
                    folder: "layout",
                });
                const banner = {
                    type: "Banner",
                    image: {
                        public_id: myCloudinary.public_id,
                        url: myCloudinary.secure_url,
                    },
                    title,
                    subTitle,
                };
                await LayoutModel.create(banner);
            }

            if (type === "FAQ") {
                const { faq } = req.body;
                const faqItems = await Promise.all(
                    faq.map(async (item: any) => {
                        return {
                            question: item.question,
                            answer: item.answer,
                        };
                    })
                );
                await LayoutModel.create({ type: "FAQ", faq: faqItems });
            }

            if (type === "Categories") {
                const { categories } = req.body;
                const categoryItems = await Promise.all(
                    categories.map(async (item: any) => {
                        return {
                            title: item.title,
                        };
                    })
                );
                await LayoutModel.create({ type: "Categories", categories: categoryItems });
            }

            res.status(201).json({
                success: true,
                message: "Layout created successfully",
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);

export const editLayout = CatchAsyncErrors(
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { type } = req.body;

            if (type === "Banner") {
                const { image, title, subTitle } = req.body;
                const bannerData: any = await LayoutModel.findOne({ type: "Banner" });

                await cloudinary.v2.uploader.destroy(bannerData?.image.public_id);

                const myCloudinary = await cloudinary.v2.uploader.upload(image, {
                    folder: "layout",
                });
                const banner = {
                    type: "Banner",
                    image: {
                        public_id: myCloudinary.public_id,
                        url: myCloudinary.secure_url,
                    },
                    title,
                    subTitle,
                };
                await LayoutModel.findByIdAndUpdate(bannerData._id, { banner });
            }

            if (type === "FAQ") {
                const { faq } = req.body;
                const faqItem = await LayoutModel.findOne({ type: "FAQ" });
                const faqItems = await Promise.all(
                    faq.map(async (item: any) => {
                        return {
                            question: item.question,
                            answer: item.answer,
                        };
                    })
                );
                await LayoutModel.findByIdAndUpdate(faqItem?._id, { type: "FAQ", faq: faqItems });
            }

            if (type === "Categories") {
                const { categories } = req.body;
                const categoryItem = await LayoutModel.findOne({ type: "Categories" });
                const categoryItems = await Promise.all(
                    categories.map(async (item: any) => {
                        return {
                            title: item.title,
                        };
                    })
                );
                await LayoutModel.findByIdAndUpdate(categoryItem?._id, {
                    type: "Categories",
                    categories: categoryItems,
                });
            }

            res.status(201).json({
                success: true,
                message: "Layout updated successfully",
            });
        } catch (error: any) {
            return next(new ErrorHandler(error.message, 500));
        }
    }
);
