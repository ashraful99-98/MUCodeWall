import express from "express";
import { updateAccessToken } from "../controllers/user.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import {
  addNewRank,
  deleteRanking,
  getAllRanking,
} from "../controllers/rankingSystem.controller";

const rankingSystemRouter = express.Router();

rankingSystemRouter.post(
  "/addNewRank",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin"),
  addNewRank,
);

rankingSystemRouter.get("/all-ranking", getAllRanking);

rankingSystemRouter.delete(
  "/delete-rank/:id",
  deleteRanking,
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
);

export default rankingSystemRouter;
