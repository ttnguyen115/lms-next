import UserModel from "../models/userModel";

export const findUserByEmail = async (email: string, isSelectPassword: boolean = false) => {
    return isSelectPassword
        ? await UserModel.findOne({ email }).select("+password")
        : await UserModel.findOne({ email });
};

export const findUserById = async (id: string, isSelectPassword: boolean = false) => {
    return isSelectPassword
        ? await UserModel.findById(id).select("+password")
        : await UserModel.findById(id);
};

export const findAllUsers = async () => {
    return await UserModel.find().sort({ createdAt: -1 });
};

export const updateUserRoleById = async (id: string, role: string = "user") => {
    return await UserModel.findOneAndUpdate({ _id: id }, { role }, { new: true });
};

export const deleteUserById = async (id: string) => {
    return await UserModel.findOneAndDelete({ _id: id });
};
