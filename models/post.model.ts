import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IComment extends Document {
  user: IUser;
  question: string;
  questionReplies?: IComment[];
}

interface ILink extends Document {
  // questions: any;
  title: string;
  url: string;
}

interface IVote extends Document {
  user: IUser;
  upVote: number;
  downVote: number;
}

interface IPost extends Document {
  name: string;
  description: string;
  thumbnail: object;
  questions: IComment[];
  votes: IVote[];
  upVotes: number;
  downVotes: number;
  postedBy: IUser;
}

const linkSchema = new Schema<ILink>({
  title: String,
  url: String,
});

const commentSchema = new Schema<IComment>(
  {
    user: Object,
    question: String,
    questionReplies: [Object],
  },
  { timestamps: true },
);

const voteSchema = new Schema<IVote>(
  {
    user: Object,
    upVote: Number,
    downVote: Number,
  },
  { timestamps: true },
);

const postSchema = new Schema<IPost>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
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
    votes: [voteSchema],
    upVotes: {
      type: Number,
      default: 0,
    },
    downVotes: {
      type: Number,
      default: 0,
    },
    postedBy: [Object],
  },
  { timestamps: true },
);

const PostModel: Model<IPost> = mongoose.model("Post", postSchema);

export default PostModel;
