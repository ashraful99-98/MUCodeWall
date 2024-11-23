import mongoose, { Document, Model, Schema } from "mongoose";

import { IUser } from "./user.model";

interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies?: IComment[];
}

interface LogoImage extends Document {
  public_id: string;
  url: string;
}

interface INoticeData extends Document {
  title: string;
  description: string;
  date: Date;
  thumbnail: object;
  questions: IComment[];
  postedBy: IUser;
}

const commentSchema = new Schema<IComment>(
  {
    user: Object,
    question: String,
    questionReplies: [Object],
  },
  { timestamps: true },
);

const noticeSchema = new Schema<INoticeData>(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    thumbnail: {
      public_id: {
        // required: true,
        type: String,
      },
      url: {
        // required: true,
        type: String,
      },
    },
    questions: [commentSchema],
    postedBy: [Object],
  },
  { timestamps: true },
);

const NoticeModel: Model<INoticeData> = mongoose.model("Notice", noticeSchema);

export default NoticeModel;

