import express from "express";
import {
    addAnswer,
    addQuestion,
    addReplyToReview,
    addReview,
    editCourse,
    getAllCoursesWithoutPurchasing,
    getCourseByValidUser,
    getSingleCourseWithoutPurchasing,
    uploadCourse,
} from "../controllers/courseController";
import { authorizeRoles, isAuthenticated } from "../middleware/auth";
const courseRouter = express.Router();

courseRouter.post("/create-course", isAuthenticated, authorizeRoles("admin"), uploadCourse);

courseRouter.post("/edit-course/:id", isAuthenticated, authorizeRoles("admin"), editCourse);

courseRouter.get("/course/:id", getSingleCourseWithoutPurchasing);

courseRouter.get("/course", getAllCoursesWithoutPurchasing);

courseRouter.get("/course-content/:id", isAuthenticated, getCourseByValidUser);

courseRouter.put("/add-question", isAuthenticated, addQuestion);

courseRouter.put("/add-answer", isAuthenticated, addAnswer);

courseRouter.put("/add-review/:id", isAuthenticated, addReview);

courseRouter.put("/add-reply", isAuthenticated, authorizeRoles("admin"), addReplyToReview);

export default courseRouter;
