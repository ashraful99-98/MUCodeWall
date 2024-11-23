import { Document, Schema, Model, model } from "mongoose";

import { IUser } from "./user.model";

export interface IContestResult extends Document {
  find(arg0: (element: any) => boolean): unknown;
  push(newResult: any): unknown;
  name: string;
  id: string;
  email: string;
  pointGain: number;
  penalty: number;
  postedBy: IUser;
  solvedProblem: number;
}

export const ContestResultSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
    email: { type: String, required: true },
    pointGain: { type: Number, required: true },
    penalty: { type: Number, required: true },
    postedBy: [Object],
    solvedProblem: { type: Number, required: true },
  },
  { timestamps: true },
);

const ContestResultModel: Model<IContestResult> = model<IContestResult>(
  "ContestResult",
  ContestResultSchema,
);

export default ContestResultModel;
