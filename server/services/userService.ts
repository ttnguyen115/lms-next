import userModel from "../models/userModel";

export const findUserByEmail = async (
    email: string,
    isSelectPassword: boolean = false
) => {
    return isSelectPassword
        ? await userModel.findOne({ email }).select("+password")
        : await userModel.findOne({ email });
};

export const findUserById = async (
    id: string,
    isSelectPassword: boolean = false
) => {
    return isSelectPassword
        ? await userModel.findById(id).select("+password")
        : await userModel.findById(id);
};
