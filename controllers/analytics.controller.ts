import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";

import userModel from "../models/user.model";
import NoticeModel from "../models/notice.model";
import { generateLast12MonthsData } from "../utils/analytics.generator";
import PostModel from "../models/post.model";
import ContestModel from "../models/contest.model";
// get user analytics --only for admin
export const getUsersAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await generateLast12MonthsData(userModel);
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get notice analytics  only for admin

export const getNoticeAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notices = await generateLast12MonthsData(NoticeModel);
      res.status(200).json({
        success: true,
        notices,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
// get posts analytics  only for admin

export const getPostAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const posts = await generateLast12MonthsData(PostModel);
      res.status(200).json({
        success: true,
        posts,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
// get contest analytics  only for admin

export const getContestAnalytics = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contests = await generateLast12MonthsData(ContestModel);
      res.status(200).json({
        success: true,
        contests,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);
