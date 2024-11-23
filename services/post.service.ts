import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import PostModel from "../models/post.model";

// create post
export const createPost = CatchAsyncError(
  async (data: any, res: Response, req: Request) => {
    const post = await PostModel.create(data);

    res.status(201).json({
      success: true,
      post,
    });
  },
);

// get all posts

export const getAllPostService = async (res: Response) => {
  const posts = await PostModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    posts,
  });
};
