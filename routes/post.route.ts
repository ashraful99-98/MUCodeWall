import express from "express";
import { authorizeRoles, isAutheticated } from "./../middleware/auth";
import { updateAccessToken } from "../controllers/user.controller";
import {
  addPostAnswer,
  addPostQuestion,
  addVote,
  deletePost,
  editPost,
  getAllPosts,
  getSinglePost,
  uploadPost,
} from "../controllers/post.controller";

const postRouter = express.Router();

postRouter.post("/create-post", updateAccessToken, isAutheticated, uploadPost);

postRouter.put("/edit-post/:id", updateAccessToken, isAutheticated, editPost);

postRouter.get("/get-post/:id", getSinglePost);

postRouter.get(
  "/get-posts",

  isAutheticated,

  getAllPosts,
);

postRouter.put(
  "/add-post-question",
  updateAccessToken,
  isAutheticated,
  addPostQuestion,
);

postRouter.put(
  "/add-post-answer",
  updateAccessToken,
  isAutheticated,
  addPostAnswer,
);

postRouter.put("/add-vote", updateAccessToken, isAutheticated, addVote);

postRouter.delete(
  "/delete-post/:id",
  updateAccessToken,
  isAutheticated,
  // authorizeRoles("admin", "moderator"),
  deletePost,
);

export default postRouter;
