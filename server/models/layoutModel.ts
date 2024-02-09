import mongoose, { Document, Schema } from "mongoose";

interface FaqItem extends Document {
    question: string;
    answer: string;
}

interface Category extends Document {
    title: string;
}

interface BannerImage extends Document {
    public_id: string;
    url: string;
}

interface Layout extends Document {
    type: string;
    faq: FaqItem[];
    categories: Category[];
    banner: {
        image: BannerImage;
        title: string;
        subTitle: string;
    };
}

const fagSchema = new Schema<FaqItem>({
    question: { type: String },
    answer: { type: String },
});

const categorySchema = new Schema<Category>({
    title: { type: String },
});

const bannerImageSchema = new Schema<BannerImage>({
    public_id: { type: String },
    url: { type: String },
});

const layoutSchema = new Schema<Layout>(
    {
        type: { type: String },
        faq: [fagSchema],
        categories: [categorySchema],
        banner: {
            image: bannerImageSchema,
            title: { type: String },
            subTitle: { type: String },
        },
    },
    {
        timestamps: true,
    }
);

const LayoutModel = mongoose.model<Layout>("Layout", layoutSchema);

export default LayoutModel;
