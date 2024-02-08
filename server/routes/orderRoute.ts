import express from "express";
import { isAuthenticated } from "../middleware/auth";
import { createOrder } from "../controllers/orderController";
const orderRouter = express.Router();

orderRouter.post("/create-order", isAuthenticated, createOrder);

export default orderRouter;