import { updateAccessToken } from "./../controllers/user.controller";
import {
  getContestAnalytics,
  getNoticeAnalytics,
  getPostAnalytics,
  getUsersAnalytics,
} from "../controllers/analytics.controller";
import { authorizeRoles, isAutheticated } from "./../middleware/auth";
import express from "express";

const analyticsRouter = express.Router();

analyticsRouter.get(
  "/get-users-analytics",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  getUsersAnalytics,
);

analyticsRouter.get(
  "/get-notices-analytics",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  getNoticeAnalytics,
);
analyticsRouter.get(
  "/get-posts-analytics",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  getPostAnalytics,
);
analyticsRouter.get(
  "/get-contests-analytics",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  getContestAnalytics,
);

export default analyticsRouter;
