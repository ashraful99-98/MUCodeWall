import express from "express";
import {
  registrationUser,
  activateUser,
  loginUser,
  logoutUser,
  updateAccessToken,
  updatePassword,
  updateProfilePicture,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserInfo,
  updateUserInfo,
  // RegistrationController,
} from "../controllers/user.controller";

import { authorizeRoles, isAutheticated } from "../middleware/auth";

const userRouter = express.Router();

userRouter.post(
  "/registration",
  registrationUser,
  // updateAccessToken,
  // authorizeRoles("admin"),
  // isAutheticated,
);

userRouter.post(
  "/activate-user",
  activateUser,
  // authorizeRoles("admin"),
  // isAutheticated,
  // updateAccessToken,
);

userRouter.post("/login", loginUser);

userRouter.get("/logout", isAutheticated, logoutUser);

userRouter.get("/me", updateAccessToken, isAutheticated, getUserInfo);

userRouter.get("/refreshtoken", updateAccessToken);

userRouter.put(
  "/update-user-password",
  updateAccessToken,
  isAutheticated,
  updatePassword,
);
userRouter.put(
  "/update-user-info",
  updateAccessToken,
  isAutheticated,
  updateUserInfo,
);

userRouter.put(
  "/update-user-avatar",
  updateAccessToken,
  isAutheticated,
  updateProfilePicture,
);

userRouter.get(
  "/get-all-users",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin", "moderator"),
  getAllUsers,
);

userRouter.put(
  "/update-user",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin"),
  updateUserRole,
);

userRouter.delete(
  "/delete-user/:id",
  updateAccessToken,
  isAutheticated,
  authorizeRoles("admin"),
  deleteUser,
);

export default userRouter;
