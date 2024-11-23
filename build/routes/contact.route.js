"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const contact_controller_1 = require("../controllers/contact.controller");
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("./../middleware/auth");
const express_1 = __importDefault(require("express"));
const contactRouter = express_1.default.Router();
contactRouter.post("/contact", user_controller_1.updateAccessToken, auth_1.isAutheticated, contact_controller_1.contactHandler);
exports.default = contactRouter;
