import mongoose, { Document, Schema } from "mongoose";

export type PlayerRole = "Batsman" | "Bowler" | "All-rounder" | "Wicketkeeper";
export type BattingStyle = "Right" | "Left";

export interface IPlayer extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  imageUrl?: string;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle?: string;
  matchesPlayed: number;
  batting: {
    runs: number;
    balls: number;
    outs: number;
    average: number;
    strikeRate: number;
    fours: number;
    sixes: number;
  };
  bowling: {
    balls: number;
    runsConceded: number;
    wickets: number;
    economy: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PlayerSchema = new Schema<IPlayer>(
  {
    name: { type: String, required: true, trim: true, index: true },
    imageUrl: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ["Batsman", "Bowler", "All-rounder", "Wicketkeeper"],
      required: true,
      default: "Batsman",
    },
    battingStyle: {
      type: String,
      enum: ["Right", "Left"],
      required: true,
      default: "Right",
    },
    bowlingStyle: { type: String, trim: true, default: "" },
    matchesPlayed: { type: Number, default: 0, min: 0 },
    batting: {
      runs: { type: Number, default: 0, min: 0 },
      balls: { type: Number, default: 0, min: 0 },
      outs: { type: Number, default: 0, min: 0 },
      average: { type: Number, default: 0, min: 0 },
      strikeRate: { type: Number, default: 0, min: 0 },
      fours: { type: Number, default: 0, min: 0 },
      sixes: { type: Number, default: 0, min: 0 },
    },
    bowling: {
      balls: { type: Number, default: 0, min: 0 },
      runsConceded: { type: Number, default: 0, min: 0 },
      wickets: { type: Number, default: 0, min: 0 },
      economy: { type: Number, default: 0, min: 0 },
    },
  },
  { timestamps: true }
);

export const Player =
  mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);
