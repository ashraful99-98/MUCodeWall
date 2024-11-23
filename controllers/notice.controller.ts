import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import cloudinary from "cloudinary";
import ErrorHandler from "../utils/ErrorHandler";
import { createNotice, getAllNoticesService } from "../services/notice.service";
import NoticeModel from "../models/notice.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";
import NotificationModel from "../models/notificationModel";
import sendMail from "../utils/sendMail";

// upload notice
export const uploadNotice = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "notices",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      data.postedBy = {
        userId: req.user,
      };

      createNotice(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// edit notice

export const editNotice = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      const noticeId = req.params.id;

      const noticeData = (await NoticeModel.findById(noticeId)) as any;

      if (!noticeData) {
        return next(new ErrorHandler("Notice not found", 404));
      }

      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "notices",
        });
        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const updatedNotice = await NoticeModel.findByIdAndUpdate(
        noticeId,
        { $set: data },
        { new: true },
      );

      if (!updatedNotice) {
        return next(new ErrorHandler("Failed to update notice", 500));
      }

      res.status(200).json({
        success: true,
        notice: updatedNotice,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get single notice

export const getSingleNotice = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const noticeId = req.params.id;

      const isCacheExist = await redis.get(noticeId);

      if (isCacheExist) {
        const notice = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          notice,
        });
      } else {
        const notice = await NoticeModel.findById(req.params.id).select(
          "-noticeData.title -noticeData.description -noticeData.date",
        );

        await redis.set(noticeId, JSON.stringify(notice), "EX", 604800);

        res.status(200).json({
          success: true,
          notice,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all notice

export const getAllNotice = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllNoticesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all notice --only for admin

export const getAdminAllNotices = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllNoticesService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// add question in notice
interface IAddQuestionData {
  question: string;
  noticeId: string;
}

export const addQuestion = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { question, noticeId }: IAddQuestionData = req.body;

      const notice = await NoticeModel.findById(noticeId);

      if (!mongoose.Types.ObjectId.isValid(noticeId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      if (!notice) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      // create a new question object

      const newQuestion: any = {
        user: req.user,
        question,
        questionReplies: [],
      };

      // add this question to our post content

      notice.questions.push(newQuestion);

      await NotificationModel.create({
        user: req.user?._id,
        title: "New Question Received",
        message: `You have a new question in ${notice.title}`,
      });

      // save the updated post

      await notice?.save();

      res.status(200).json({
        success: true,
        notice,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// add answer in create question
interface IAddAnswerData {
  answer: string;
  noticeId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, noticeId, questionId }: IAddAnswerData = req.body;

      const notice = await NoticeModel.findById(noticeId);

      if (!mongoose.Types.ObjectId.isValid(noticeId)) {
        return next(new ErrorHandler("Invalid content id", 400));
      }

      if (!notice) {
        if (!mongoose.Types.ObjectId.isValid(noticeId)) {
          return next(new ErrorHandler("Invalid content id", 400));
        }

        if (!notice) {
          return next(new ErrorHandler("Invalid content id", 400));
        }
      }

      const question = notice?.questions?.find((item: any) =>
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

      await notice?.save();

      if (req.user?._id === question.user?._id) {
        // create a notification model

        await NotificationModel.create({
          user: req.user?._id,
          title: "New Question Reply Received",
          message: `You have a new question reply in ${notice.title}`,
        });
      } else {
        const data = {
          name: question.user.name,
          title: notice?.title,
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
        notice,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// delete notice

export const deleteNotice = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const notice = await NoticeModel.findById(id);

      if (!notice) {
        return next(new ErrorHandler("Notice not found", 404));
      }

      await notice.deleteOne({ id });

      await redis.del(id);

      res.status(201).json({
        success: true,
        message: "Notice deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);
