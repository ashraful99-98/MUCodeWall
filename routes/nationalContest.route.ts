import { authorizeRoles } from "./../middleware/auth";
import express from "express";
import { updateAccessToken } from "../controllers/user.controller";
import { isAutheticated } from "../middleware/auth";
import {
  addNationalContest,
  deleteNationalContest,
  editNationalContest,
  getAdminAllNationalContests,
  getSingleNationalContest,
} from "../controllers/nationalContest.controller";

const nationalContestRouter = express.Router();

nationalContestRouter.post(
  "/national-contest",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  addNationalContest,
);

nationalContestRouter.put(
  "/edit-national-contest/:id",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  editNationalContest,
);

nationalContestRouter.get(
  "/get-national-contest/:id",
  getSingleNationalContest,
);

nationalContestRouter.get(
  "/get-admin-national-contests",
  // updateAccessToken,
  // isAutheticated,
  // authorizeRoles("admin", "moderator"),
  getAdminAllNationalContests,
);

nationalContestRouter.delete(
  "/delete-national-contest/:id",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  deleteNationalContest,
);

export default nationalContestRouter;
