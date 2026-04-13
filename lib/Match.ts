import mongoose, { Document, Schema } from "mongoose";

export interface IMatch extends Document {
  matchId: string;
  status: string;
  teamAName: string;
  teamBName: string;
  date?: string;
  venue?: string;
  payload: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const MatchSchema = new Schema<IMatch>(
  {
    matchId: { type: String, required: true, unique: true, index: true },
    status: { type: String, required: true, default: "live" },
    teamAName: { type: String, required: true, default: "" },
    teamBName: { type: String, required: true, default: "" },
    date: { type: String, default: "" },
    venue: { type: String, default: "" },
    payload: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const MatchModel =
  mongoose.models.Match || mongoose.model<IMatch>("Match", MatchSchema);
