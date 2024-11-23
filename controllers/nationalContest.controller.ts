import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import {
  createNationalContest,
  getAllNationalContestsService,
} from "../services/nationalContest.service";
import { NationalContestModel } from "../models/nationalContest.model";
import { redis } from "../utils/redis";
import userModel from "../models/user.model";

// upload natioanl contest
export const addNationalContest = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      data.postedBy = {
        userId: req.user,
      };

      await createNationalContest(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// edit national contest

export const editNationalContest = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const contestId = req.params.id;

      const contestData = (await NationalContestModel.findById(
        contestId,
      )) as any;

      if (!contestData) {
        return next(new ErrorHandler("Contest not found", 404));
      }

      const updatedContest = await NationalContestModel.findByIdAndUpdate(
        contestId,
        { $set: data },
        { new: true },
      );

      if (!updatedContest) {
        return next(new ErrorHandler("Failed to update contest", 500));
      }

      res.status(200).json({
        success: true,
        contest: updatedContest,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get single National Contest

export const getSingleNationalContest = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contestId = req.params.id;

      const isCacheExist = await redis.get(contestId);

      if (isCacheExist) {
        const contest = JSON.parse(isCacheExist);
        res.status(200).json({
          success: true,
          contest,
        });
      } else {
        const contest = await NationalContestModel.findById(
          req.params.id,
        ).select(
          "-nationalContestData.name,-nationalContestData.totalParticipation",
        );

        await redis.set(contestId, JSON.stringify(contest), "EX", 604800);

        res.status(200).json({
          success: true,
          contest,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all contest --only for admin

export const getAdminAllNationalContests = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllNationalContestsService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// delete national contest

export const deleteNationalContest = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const contest = await NationalContestModel.findById(id);

      if (!contest) {
        return next(new ErrorHandler("National contest not found", 404));
      }

      await contest.deleteOne({ id });

      await redis.del(id);

      res.status(201).json({
        success: true,
        message: "National contest deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);
