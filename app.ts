require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error";
import userRouter from "./routes/user.route";
import notificationRoute from "./routes/notification.route";

import analyticsRouter from "./routes/analytics.route";

import layoutRouter from "./routes/layout.route";
import { rateLimit } from "express-rate-limit";
import noticeRouter from "./routes/notice.route";

import postRouter from "./routes/post.route";
// import contestResultRouter from "./routes/contestResult.rote";

import contestRouter from "./routes/contest.route";
import nationalContestRouter from "./routes/nationalContest.route";
import rankingSystemRouter from "./routes/rankingSystem.route";
//body parser
app.use(express.json({ limit: "100mb" }));

//cookie parser
app.use(cookieParser());

//cors = cross origin resource sharing
app.use(
  cors({
    // origin: process.env.ORIGIN,
    origin: ["http://localhost:3000"],
    credentials: true,
  }),
);

// api requests lemit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

//routes
app.use("/api/v1", userRouter);
app.use("/api/v1", noticeRouter);
app.use("/api/v1", contestRouter);
app.use("/api/v1", postRouter);
app.use("/api/v1", nationalContestRouter);
app.use("/api/v1", analyticsRouter);
app.use("/api/v1", notificationRoute);
app.use("/api/v1", rankingSystemRouter);
app.use("/api/v1", layoutRouter);

//testing api

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "API is working",
  });
});

//unknown route
app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});
// middleware calls
app.use(limiter);

app.use(ErrorMiddleware);
