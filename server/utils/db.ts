import mongoose, { type Mongoose } from "mongoose";

require("dotenv").config();

const dbUrl: string = process.env.DB_URL || "";

const connectDB = async () => {
    try {
        const data: Mongoose = await mongoose.connect(dbUrl);
        console.log(`Database connected with ${data.connection.host}`);
    } catch (error) {
        console.log(error.message);
        setTimeout(connectDB, 5000);
    }
};

export default connectDB;
