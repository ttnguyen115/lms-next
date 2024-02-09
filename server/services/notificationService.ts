import { type FilterQuery, type SortOrder } from "mongoose";
import NotificationModel, { type INotification } from "../models/notificationModel";

export const findNotifications = async (sort: string | { [key: string]: SortOrder } = {}) => {
    return await NotificationModel.find().sort(sort);
};

export const findNotificationById = async (id: string) => {
    return await NotificationModel.findById(id);
};

export const deleteNotifications = async (filter: FilterQuery<INotification> | undefined = {}) => {
    return await NotificationModel.deleteMany(filter);
};
