require("dotenv").config();
import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// const emailRegexPattern : RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const emailRegexPattern: RegExp = /[A-Za-z0-9_+-][A-Za-z0-9_+-]*([.][A-Za-z0-9_+-]+)*@[A-Za-z.-]*\.[A-Za-z]{2,4}/;
// const emailRegexPattern: RegExp = /[A-Za-z0-9_+-][A-Za-z0-9_+-]*([.][A-Za-z0-9_+-]+)*@[A-Za-z.-]+"."[A-Za-z]{2,4}/;
// const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const emailRegexPattern: RegExp = /^[^.]+@[^.]+\.[a-z]{2,3}$/;

var validateEmail = function (email: string) {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

export interface IUser extends Document {
  name: string;
  email: string;
  id: string;
  batch: string;
  department: string;
  password: string;
  avatar: {
    public_id: string;
    url: string;
  };
  role: string;
  isVerified: boolean;
  // posts: Array<{ postId: string }>;
  comparePassword: (password: string) => Promise<boolean>;

  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

export const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    id: {
      type: String,
      required: [true, "Please enter your id"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "please enter a valid email",
      },
      unique: true,
    },
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
      default: "student",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    batch: {
      type: String,
      default: "none",
    },
    department: {
      type: String,
      default: "none",
    },
    // posts: [
    //   {
    //     postId: String,
    //   },
    // ],
  },
  { timestamps: true },
);

//Hash Password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN || "", {
    expiresIn: "5m",
  });
};

//sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN || "", {
    expiresIn: "3d",
  });
};

//compare password
userSchema.methods.comparePassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
