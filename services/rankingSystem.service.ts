import { Response, NextFunction } from "express";
import RankingModel, { IRankData } from "../models/rankingSystem.model";

export const createNewRanking = async (
  data: IRankData,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ranking = await RankingModel.create(data);
    res.status(201).json({
      success: true,
      ranking,
    });
  } catch (error) {
    next(error);
  }
};

// export const getAllRankingService = async (res: Response) => {
//   const ranks = await RankingModel.find().sort({ createdAt: -1 });

//   // if (ranks) {
//   //   ranks.forEach((contest: any) => {
//   //     contest.result.sort({ totalPoints: -1 });
//   //   });
//   // }

//   res.status(201).json({
//     success: true,
//     ranks,
//   });
// };

export const getAllRankingService = async (res: Response) => {
  const ranks = await RankingModel.find().sort({ createdAt: -1 });

  if (ranks) {
    ranks.forEach((contest: any) => {
      contest.result.sort((a: any, b: any) => a.totalPoints - b.totalPoints);
    });
  }

  res.status(201).json({
    success: true,
    ranks,
  });
};
