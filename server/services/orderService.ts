import OrderModel from "../models/orderModel";

export const newOrder = async (data: any) => {
    return await OrderModel.create(data);
};

export const findAllOrders = async () => {
    return await OrderModel.find().sort({ createdAt: -1 });
};
