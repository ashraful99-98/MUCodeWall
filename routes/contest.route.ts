import express from "express";
import { updateAccessToken } from "../controllers/user.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import {
  addContest,
  addResult,
  deleteContest,
  deleteContestResult,
  editContest,
  getAdminAllContests,
  getAllContest,
  getSingleContest,
} from "../controllers/contest.controller";

const contestRouter = express.Router();

contestRouter.post(
  "/create-contest",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  addContest,
);

contestRouter.put(
  "/edit-contest/:id",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  editContest,
);

contestRouter.get("/get-contest/:id", getSingleContest);

contestRouter.get("/get-contests", getAllContest);

contestRouter.get(
  "/get-admin-contests",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  getAdminAllContests,
);

contestRouter.put(
  "/add-result",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  addResult,
);

contestRouter.delete(
  "/delete-contest-result",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  deleteContestResult,
);

contestRouter.delete(
  "/delete-contest/:id",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  deleteContest,
);

export default contestRouter;
