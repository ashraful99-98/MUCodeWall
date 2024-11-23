import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import ContestModel from "../models/contest.model";
import RankingModel, {
  IRankData,
  IRankResult,
} from "../models/rankingSystem.model";
import {
  createNewRanking,
  getAllRankingService,
} from "../services/rankingSystem.service";

export const addNewRank = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    let results: IRankResult[] = [];
    const rankSize = req.body.contestList.length;
    let rankMap: Map<string, number[]> = new Map<string, number[]>();
    let nameMap: Map<string, string> = new Map<string, string>();
    let contestParticipants: number[] = Array(rankSize).fill(0);

    for (let idx = 0; idx < rankSize; idx++) {
      let contestId = req.body.contestList[idx];
      const contest =
        await ContestModel.findById(contestId).select("-contestData.title");

      if (contest) {
        for (let idx1 = 0; idx1 < contest.result.length; idx1++) {
          let userId: string = contest.result[idx1].id;

          if (rankMap.size === 0 || !rankMap.has(userId)) {
            rankMap.set(userId, Array(rankSize).fill(-1));
            nameMap.set(userId, contest.result[idx1].name);
          }
        }
      }
    }

    for (let idx = 0; idx < rankSize; idx++) {
      let contestId = req.body.contestList[idx];
      const contest =
        await ContestModel.findById(contestId).select("-contestData.title");

      if (contest) {
        contestParticipants[idx] = contest.result.length;
        contest.result.sort((a, b) => {
          if (a.pointGain > b.pointGain) return -1;
          if (a.pointGain < b.pointGain) return 1;
          if (a.penalty < b.penalty) return -1;
          if (a.penalty > b.penalty) return 1;
          return 0;
        });
        for (let idx1 = 0; idx1 < contest.result.length; idx1++) {
          let userId: string = contest.result[idx1].id;
          let arr = rankMap.get(userId);
          if (!arr) {
            arr = [];
            rankMap.set(userId, arr);
          }
          let pointListValue = Number(req.body.pointList[idx]);
          arr[idx] = (idx1 + 1) * (isNaN(pointListValue) ? 0 : pointListValue);
        }
      }
    }

    rankMap.forEach((value, key) => {
      let points = 0;
      for (let idx = 0; idx < value.length; idx++) {
        if (value[idx] === -1) {
          points += Number(req.body.pointList[idx]) * contestParticipants[idx];
        } else {
          points += value[idx];
        }
      }
      let person: IRankResult = {
        name: nameMap.get(key) || "",
        userId: key,
        totalPoints: points,
      };

      results.push(person);
    });

    if (!req.user) {
      return next(new ErrorHandler("User not authenticated", 401));
    }

    try {
      let data: IRankData = {
        title: req.body.title,
        result: results,
        postedBy: req.user,
      };

      await createNewRanking(data, res, next); // Ensure the correct arguments are passed
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// get all ranking

export const getAllRanking = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      getAllRankingService(res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  },
);

// delete ranking

export const deleteRanking = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const ranking = await RankingModel.findById(id);

      if (!ranking) {
        return next(new ErrorHandler("Rank not found", 404));
      }

      await ranking.deleteOne({ id });

      res.status(201).json({
        success: true,
        message: "Ranking deleted successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  },
);
