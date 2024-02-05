import userModel from "../models/userModel";

export const findUserByEmail = async (
    email: string,
    isSelectPassword: boolean = false
) => {
    return isSelectPassword
        ? await userModel.findOne({ email }).select("+password")
        : await userModel.findOne({ email });
};

export const getUserById = async (id: string) => {
    return await userModel.findById(id);
};