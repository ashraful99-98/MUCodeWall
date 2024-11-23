import express from "express";
import { updateAccessToken } from "../controllers/user.controller";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import {
  addAnswer,
  addQuestion,
  deleteNotice,
  editNotice,
  getAdminAllNotices,
  getAllNotice,
  getSingleNotice,
  uploadNotice,
} from "../controllers/notice.controller";

const noticeRouter = express.Router();
noticeRouter.post(
  "/create-notice",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  uploadNotice,
);

noticeRouter.put(
  "/edit-notice/:id",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  editNotice,
);

noticeRouter.get("/get-notice/:id", getSingleNotice);

noticeRouter.get("/get-notices", isAutheticated, getAllNotice);

noticeRouter.get(
  "/get-admin-notices",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  getAdminAllNotices,
);

noticeRouter.put(
  "/add-question",
  updateAccessToken,
  isAutheticated,
  addQuestion,
);

noticeRouter.put("/add-answer", updateAccessToken, isAutheticated, addAnswer);

noticeRouter.delete(
  "/delete-notice/:id",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  deleteNotice,
);

export default noticeRouter;
