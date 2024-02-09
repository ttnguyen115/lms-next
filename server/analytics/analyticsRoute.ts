import express from "express";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
import { getCoursesAnalytics, getOrdersAnalytics, getUsersAnalytics } from "./analyticsController";
const analyticsRouter = express.Router();

analyticsRouter.get("/users-analytics", isAuthenticated, authorizeRoles("admin"), getUsersAnalytics);
analyticsRouter.get("/courses-analytics", isAuthenticated, authorizeRoles("admin"), getCoursesAnalytics);
analyticsRouter.get("/orders-analytics", isAuthenticated, authorizeRoles("admin"), getOrdersAnalytics);

export default analyticsRouter;
