import {
  createlayout,
  editLayout,
  getLayoutByType,
} from "../controllers/layout.controller";
import { updateAccessToken } from "../controllers/user.controller";
import { authorizeRoles, isAutheticated } from "./../middleware/auth";
import express from "express";

const layoutRouter = express.Router();

layoutRouter.post(
  "/create-layout",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  createlayout,
);

layoutRouter.put(
  "/edit-layout",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  editLayout,
);

layoutRouter.get("/get-layout/:type", getLayoutByType);

export default layoutRouter;
