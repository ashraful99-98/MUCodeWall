import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";

import ContestResultModel from "../models/contestResult.model";
import ContestModel from "../models/contest.model";

// create contest
export const createContest = CatchAsyncError(
  async (data: any, res: Response) => {
    const contest = await ContestModel.create(data);
    res.status(201).json({
      success: true,
      contest,
    });
  },
);

// get all contests

export const getAllContestsService = async (res: Response) => {
  const contests = await ContestModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    contests,
  });
};
