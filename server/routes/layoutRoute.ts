import express from "express";
import { createLayout, editLayout, getLayoutByType } from "../controllers/layoutController";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const layoutRouter = express.Router();

layoutRouter.get("/get-layout", getLayoutByType);
layoutRouter.post("/create-layout", isAuthenticated, authorizeRoles("admin"), createLayout);
layoutRouter.put("/edit-layout", isAuthenticated, authorizeRoles("admin"), editLayout);

export default layoutRouter;
