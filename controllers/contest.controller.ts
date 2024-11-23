import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import {
  createContest,
  getAllContestsService,
} from "../services/contest.service";
import userModel from "../models/user.model";
import ContestModel, { IContestResult } from "../models/contest.model";
import { redis } from "../utils/redis";
import mongoose from "mongoose";

// upload contest
export const addContest = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      data.postedBy = {
        userId: req.user,
      };
      await createContest(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// edit contest

export const editContest = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const contestId = req.params.id;

      const contestData = (await ContestModel.findById(contestId)) as any;

      if (!contestData) {
        return next(new ErrorHandler("Contest not found", 404));
      }

      const updatedContest = await ContestModel.findByIdAndUpdate(
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

// get single contest

export const getSingleContest = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const contest = await ContestModel.findById(req.params.id).select(
        "-contestData.title",
      );
      // if (contest) {
      //   contest.result = contest.result.sort({pointGain:-1, penalty:1});
      // }

      if (contest) {
        contest.result.sort((a, b) => {
          // Sort by pointGain in descending order
          if (a.pointGain > b.pointGain) return -1;
          if (a.pointGain < b.pointGain) return 1;

          // If pointGain is equal, sort by penalty in ascending order
          if (a.penalty < b.penalty) return -1;
          if (a.penalty > b.penalty) return 1;

          return 0; // No change in order
        });
      }

      res.status(200).json({
        success: true,
        contest,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all contest

export const getAllContest = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const contests = await ContestModel.find().select("-contestData.title");

      const contests = await ContestModel.find().sort({ createdAt: -1 });

      if (contests) {
        contests.forEach((contest: any) => {
          contest.result.sort((a: any, b: any) => {
            // Sort by pointGain in descending order
            if (a.pointGain > b.pointGain) return -1;
            if (a.pointGain < b.pointGain) return 1;

            // If pointGain is equal, sort by penalty in ascending order
            if (a.penalty < b.penalty) return -1;
            if (a.penalty > b.penalty) return 1;

            return 0; // No change in order
          });
        });
      }

      res.status(200).json({
        success: true,
        contests,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all contest --only for admin

export const getAdminAllContests = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllContestsService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// add contest result

interface IAddResult {
  contestId: string;
  name: string;
  id: number;
  pointGain: number;
  penalty: number;
  solvedProblem: number;
}

export const addResult = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contestId }: IAddResult = req.body;

      const { name, id, pointGain, penalty, solvedProblem }: IContestResult =
        req.body;

      const contest = await ContestModel.findById(contestId);

      const isUserEmail = await userModel.findOne({ id, name });
      if (!isUserEmail) {
        throw next(new ErrorHandler("User not found", 404));
      }

      if (!mongoose.Types.ObjectId.isValid(contestId)) {
        throw next(new ErrorHandler("Invalid content id", 400));
      }

      if (!contest) {
        throw next(new ErrorHandler("Invalid content id", 400));
      }

      const alreadyAdded = contest.result.find((element) => element.id === id);

      if (alreadyAdded) {
        throw next(new ErrorHandler("Id already added", 400));
      }
      // create a new question object

      const newResult: any = {
        user: req.user,
        name,
        id,
        penalty,
        pointGain,
        solvedProblem,
      };

      contest.result.push(newResult);

      // contest.result =  contest.result.sort({ contest.result.pointGain: -1, penalty: 1 });

      // save the updated post

      await contest?.save();

      res.status(200).json({
        success: true,
        contest,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

interface IDeleteResult {
  contestId: string;
  resultId: string;
}

export const deleteContestResult = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { contestId, resultId }: IDeleteResult = req.body;

      const contest = await ContestModel.findById(contestId);

      if (!contest) {
        return next(new ErrorHandler("Contest not found", 404));
      }

      const resultIndex = contest.result.findIndex(
        (result) => result._id.toString() === resultId,
      );
      if (resultIndex === -1) {
        return next(new ErrorHandler("Result not found", 404));
      }

      contest.result.splice(resultIndex, 1);

      await contest.save();

      // await contest.result.deleteOne({ resultId });

      await redis.del(resultId);

      res.status(201).json({
        success: true,
        message: "Result deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);

// delete contest

export const deleteContest = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const contest = await ContestModel.findById(id);

      if (!contest) {
        return next(new ErrorHandler("Contest not found", 404));
      }

      await contest.deleteOne({ id });

      await redis.del(id);

      res.status(201).json({
        success: true,
        message: "Contest deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);
function orderBy(array: any, arg1: string[], arg2: string[]): IContestResult[] {
  throw new Error("Function not implemented.");
}
