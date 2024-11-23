import mongoose, { Model, Schema, Document } from "mongoose";
import { IUser } from "./user.model";

export interface IRankResult {
  name: string;
  userId: string; // Renamed field to avoid conflict
  totalPoints: number;
}

export interface IRankData {
  title: string;
  result: IRankResult[];
  postedBy: IUser;
}

interface IRankResultDocument extends IRankResult, Document {}
interface IRankDataDocument extends IRankData, Document {}

const rankResultSchema = new Schema<IRankResultDocument>(
  {
    name: { type: String, required: true },
    userId: { type: String, required: true }, // Updated field name
    totalPoints: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const rankSchema = new Schema<IRankDataDocument>(
  {
    title: { type: String, required: true },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    result: [rankResultSchema],
  },
  { timestamps: true },
);

const RankingModel: Model<IRankDataDocument> =
  mongoose.model<IRankDataDocument>("RankingSystem", rankSchema);

export default RankingModel;
