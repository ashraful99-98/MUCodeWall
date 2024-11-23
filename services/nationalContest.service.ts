import { Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import { NationalContestModel } from "../models/nationalContest.model";

// create contest
export const createNationalContest = CatchAsyncError(
  async (data: any, res: Response) => {
    const contest = await NationalContestModel.create(data);

    res.status(201).json({
      success: true,
      contest,
    });
  },
);

// get all National Contests Service

export const getAllNationalContestsService = async (res: Response) => {
  const contests = await NationalContestModel.find().sort({ createdAt: -1 });

  res.status(201).json({
    success: true,
    contests,
  });
};
