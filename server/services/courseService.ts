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

export const findCourseById = async (courseId: string, select: string = "") => {
    return select.length > 0
        ? await CourseModel.findById(courseId).select(select)
        : await CourseModel.findById(courseId);
};

export const findCourses = async (select: string = "") => {
    return select.length > 0 ? await CourseModel.find().select(select) : await CourseModel.find();
};

export const deleteCourseById = async (id: string) => {
    return await CourseModel.findOneAndDelete({ _id: id });
};
