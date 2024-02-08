import { type NextFunction } from "express";
import OrderModel from "../models/orderModel";

export const newOrder = async (data: any) => {
    return await OrderModel.create(data);
}