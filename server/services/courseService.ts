import CourseModel from "../models/courseModel";

export const createCourse = async (data: any) => {
    return await CourseModel.create(data);
};

export const findCourseByIdAndUpdate = async (courseId: string, data: any) => {
    return await CourseModel.findByIdAndUpdate(
        courseId,
        {
            $set: data,
        },
        { new: true }
    );
};
