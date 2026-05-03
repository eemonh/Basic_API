import { Router } from "express";
import { createPost, getAllPosts, updatePost, deletePost } from "../controllers/post.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/getPosts").get(getAllPosts);

// Protected routes
router.route("/create").post(verifyJWT, createPost);
router.route("/update/:id").patch(verifyJWT, updatePost);
router.route("/delete/:id").delete(verifyJWT, deletePost);

export default router;