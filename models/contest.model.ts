import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IContestData extends Document {
  title: string;
  result: IContestResult[];
  postedBy: IUser;
}
export interface IContestResult extends Document {
  name: string;
  id: string;
  // email: string;
  pointGain: number;
  penalty: number;
  postedBy: IUser;
  solvedProblem: number;
}

const contestResultSchema = new Schema<IContestResult>(
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
    // email: { type: String, required: true },
    pointGain: { type: Number, required: true },
    penalty: { type: Number, required: true },
    postedBy: [Object],
    solvedProblem: { type: Number, required: true },
  },
  { timestamps: true },
);

const contestSchema = new Schema<IContestData>(
  {
    title: {
      type: String,
      required: true,
    },
    postedBy: [Object],
    result: [contestResultSchema],
  },
  { timestamps: true },
);

const ContestModel: Model<IContestData> = mongoose.model(
  "Contest",
  contestSchema,
);

export default ContestModel;
