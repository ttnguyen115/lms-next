import CourseModel from "../models/courseModel";

export const createCourse = async (data: any) => {
    return await CourseModel.create(data);
};
