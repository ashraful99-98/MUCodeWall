import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import cloudinary from "cloudinary";
import ErrorHandler from "../utils/ErrorHandler";
import { createPost, getAllPostService } from "../services/post.service";
import PostModel from "../models/post.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import NotificationModel from "../models/notificationModel";
import sendMail from "../utils/sendMail";
import userModel from "../models/user.model";

// upload post
export const uploadPost = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "posts",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      data.postedBy = {
        userId: req.user,
      };

      const user = await userModel.findById(req.user?._id);
      const post = await PostModel.create(data);

      // user?.posts.push(post._id);
      await redis.set(req.user?._id, JSON.stringify(user));
      await user?.save();

      return res.status(201).json({
        success: true,
        message: "Post create successfully",
        post,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// edit post

export const editPost = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      const postId = req.params.id;

      const postData = (await PostModel.findById(postId)) as any;

      if (!postData) {
        return next(new ErrorHandler("Post not found", 404));
      }
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "posts",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const updatedPost = await PostModel.findByIdAndUpdate(
        postId,
        { $set: data },
        { new: true },
      );

      if (!updatedPost) {
        return next(new ErrorHandler("Failed to update post", 500));
      }

      res.status(200).json({
        success: true,
        post: updatedPost,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get single post

export const getSinglePost = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.id;

      const isCacheExist = await redis.get(postId);

      if (isCacheExist) {
        const post = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          post,
        });
      } else {
        const post = await PostModel.findById(req.params.id).select(
          "-postData.tags -postData.links -postData.question -postData.name",
        );

        await redis.set(postId, JSON.stringify(post), "EX", 604800);

        res.status(200).json({
          success: true,
          post,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all post

export const getAllPosts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllPostService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add question in post
interface IAddQuestionPostData {
  question: string;
  postId: string;
}

export const addPostQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, postId }: IAddQuestionPostData = req.body;

      const post = await PostModel.findById(postId);

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return next(new ErrorHandler("Invalid id", 400));
      }

      if (!post) {
        return next(new ErrorHandler("Invalid id", 400));
      }

      // create a new question object

      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // add this question to our post content

      post.questions.push(newQuestion);

      await NotificationModel.create({
        user: req.user?._id,
        title: "New Question Received",
        message: `You have a new question in ${post.name}`,
      });

      // save the updated post

      await post?.save();

      res.status(200).json({
        success: true,
        post,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add answer in create question
interface IAddPostAnswerData {
  answer: string;
  postId: string;
  questionId: string;
}

export const addPostAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, postId, questionId }: IAddPostAnswerData = req.body;

      const post = await PostModel.findById(postId);

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      if (!post) {
        if (!mongoose.Types.ObjectId.isValid(postId)) {
          return next(new ErrorHandler("Invalid content id", 400));
        }

        if (!post) {
          return next(new ErrorHandler("Invalid content id", 400));
        }
      }

      const question = post?.questions?.find((item: any) =>
        item._id.equals(questionId),
      );

      if (!question) {
        return next(new ErrorHandler("Invalid question id", 400));
      }

      // create a new answer object

      const newAnswer: any = {
        user: req.user,
        answer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // add this answer to our post content
      question.questionReplies?.push(newAnswer);

      await post?.save();

      if (req.user?._id === question.user?._id) {
        // create a notification model

        await NotificationModel.create({
          user: req.user?._id,
          title: "New Question Reply Received",
          message: `You have a new question reply in ${post.name}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: post?.name,
        };

        try {
          await sendMail({
            email: question.user.email,
            subject: "Question Reply",
            template: "question-reply.ejs",
            data,
          });
        } catch (error: any) {
          return next(new ErrorHandler(error.message, 500));
        }
      }

      res.status(200).json({
        success: true,
        post,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add a Vote in post

interface IAddUpVoteData {
  upVote: number;
  downVote: number;
  postId: string;
}

export const addVote = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { upVote, downVote, postId }: IAddUpVoteData = req.body;
      const userId = req.user?._id;

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      const post = await PostModel.findById(postId);
      if (!post) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      // Check if the user has already voted on the post
      const existingVoteIndex = post.votes.findIndex(
        (v: any) => v.user.toString() === userId.toString(),
      );

      if (existingVoteIndex !== -1) {
        // Update the existing vote
        post.votes[existingVoteIndex].upVote += upVote;

        post.votes[existingVoteIndex].downVote += downVote;

        post.upVotes += upVote;

        post.downVotes += downVote;
      } else {
        post.upVotes += upVote;

        post.downVotes += downVote;
        // Create a new vote object and add it to the post
        const newVote: any = {
          user: userId,
          upVote,
          downVote,
        };
        post.votes.push(newVote);
      }

      // Save the updated post
      await post.save();

      // Create a notification only if it's a new vote
      if (existingVoteIndex === -1) {
        await NotificationModel.create({
          user: userId,
          title: "New Vote Received",
          message: `You have a ${upVote > 0 ? "up" : "down"} vote in ${post.name}`,
        });
      }

      res.status(200).json({
        success: true,
        post,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// delete post

export const deletePost = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const post = await PostModel.findById(id);

      if (!post) {
        return next(new ErrorHandler("User not found", 404));
      }

      await post.deleteOne({ id });

      await redis.del(id);

      res.status(201).json({
        success: true,
        message: "post deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);
