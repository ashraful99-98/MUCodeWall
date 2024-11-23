"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSchema = void 0;
require('dotenv').config();
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// const emailRegexPattern : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const emailRegexPattern: RegExp = /[A-Za-z0-9_+-][A-Za-z0-9_+-]*([.][A-Za-z0-9_+-]+)*@[A-Za-z.-]*\.[A-Za-z]{2,4}/;
// const emailRegexPattern: RegExp = /[A-Za-z0-9_+-][A-Za-z0-9_+-]*([.][A-Za-z0-9_+-]+)*@[A-Za-z.-]+"."[A-Za-z]{2,4}/;
// const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const emailRegexPattern = /^[^.]+@[^.]+\.[a-z]{2,3}$/;
var validateEmail = function (email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email);
};
;
exports.userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"],
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value) {
                return emailRegexPattern.test(value);
            },
            message: "please enter a valid email",
        },
        unique: true,
    },
    // email: {
    //     type: String,
    //     trim: true,
    //     lowercase: true,
    //     unique: true,
    //     required:[true, "Please enter your email"],
    //     validate: [validateEmail, 'Please fill a valid email address'],
    //     match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    // },
    // email: {
    //     type: String,
    //     trim: true,
    //     lowercase: true,
    //     unique: true,
    //     validate: {
    //         validator: function(v: string) {
    //             return /[A-Za-z0-9_+-][A-Za-z0-9_+-]*([.][A-Za-z0-9_+-]+)*@[A-Za-z.-]*\.[A-Za-z]{2,4}/.test(v);
    //         },
    //         message: "Please enter a valid email"
    //     },
    //     required: [true, "Email required"]
    // },
    password: {
        type: String,
        minlength: [6, "Password must be at least 6 characters"],
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
        // default: "User",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        }
    ],
}, { timestamps: true });
//Hash Password before saving 
exports.userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcryptjs_1.default.hash(this.password, 10);
    next();
});
// sign access token 
exports.userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN || '', {
        expiresIn: "5m",
    });
};
//sign refresh token
exports.userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN || '', {
        expiresIn: "3d",
    });
};
//compare password
exports.userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcryptjs_1.default.compare(enteredPassword, this.password);
};
const userModel = mongoose_1.default.model("User", exports.userSchema);
exports.default = userModel;
