import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./user.model";

interface IMember extends Document {
  name: string;
  batch: string;
  id: string;
}

const memberScema = new Schema<IMember>({
  name: { type: String, required: true },
  batch: { type: String, required: true },
  id: {
    type: String,
    required: true,
    //  unique: true
  },
});

interface ITeam extends Document {
  teamName: string;
  members: IMember[];
  coach: string;
  coachDesignition: string;
  rank: number;
}

const teamSchema = new Schema<ITeam>(
  {
    teamName: { type: String, required: true },
    members: [memberScema],
    coach: { type: String, required: true },
    coachDesignition: { type: String, required: true },
    rank: { type: Number, required: true },
  },
  { timestamps: true },
);

interface IContest extends Document {
  name: string;
  date: string;
  postedBy: IUser;
  totalParticipation: number;
  teams: ITeam[];
}

const contestSchema = new Schema<IContest>(
  {
    name: { type: String, required: true },
    date: { type: String, required: true },
    postedBy: [Object],
    totalParticipation: {
      type: Number,
      required: true,
    },
    teams: [teamSchema],
  },
  { timestamps: true },
);

// Create models
// const TeamModel: Model<ITeam> = mongoose.model("Team", teamSchema);
const NationalContestModel: Model<IContest> = mongoose.model(
  "NationalContest",
  contestSchema,
);

export {
  // TeamModel,
  NationalContestModel,
};
