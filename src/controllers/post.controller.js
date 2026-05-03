import { Post } from "../models/post.model.js";

//create a new post
const createPost = async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required." });
        }
        const post = new Post({ title, content });
        await post.save();
        res.status(201).json({ message: "Post created successfully.", post });
    } catch (error) {
        console.error("Post creation error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

//read all posts
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json({ message: "Posts retrieved successfully.", posts });
    } catch (error) {
        console.error("Post retrieval error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

//update a post
const updatePost = async (req, res) => {
    try {
        //basic validation to check if the body is empty or not
        //title 
        //object.keys --> ["title", "content"]
        if(Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Request body is empty." });
        }
        const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!post) {
            return res.status(404).json({ message: "Post not found." });
        }
        res.status(200).json({ message: "Post updated successfully.", post });
    } catch (error) {
        console.error("Post update error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
};

//delete a post
const deletePost = async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.id);
        if (!deletedPost) {
            return res.status(404).json({ message: "Post not found." });
        }
        res.status(200).json({ message: "Post deleted successfully.", post: deletedPost });
    } catch (error) {
        console.error("Post deletion error:", error);
        res.status(500).json({ message: "Internal server error.", error: error.message });
    }
}


export { createPost, getAllPosts, updatePost, deletePost };