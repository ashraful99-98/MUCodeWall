import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import NoticeModel from "../models/notice.model";

// create notice
export const createNotice = CatchAsyncError(
  async (data: any, res: Response) => {
    const notice = await NoticeModel.create(data);
    res.status(201).json({
      success: true,
      notice,
    });
  },
);


// get all notices

export const getAllNoticesService = async (res: Response) => {
    const notices = await NoticeModel.find().sort({ createdAt: -1 });
  
    res.status(201).json({
      success: true,
      notices,
    });
  };