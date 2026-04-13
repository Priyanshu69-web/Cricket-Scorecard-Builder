import mongoose, { Document, Schema } from "mongoose";

export type ScorecardTemplate =
  | "daily-productivity"
  | "startup-idea-validator"
  | "job-candidate-evaluation"
  | "stock-analysis"
  | "custom";

export type CriteriaInputType = "number" | "percentage" | "boolean" | "text";

export interface IScorecardCriterion {
  id: string;
  name: string;
  description?: string;
  inputType: CriteriaInputType;
  weight: number;
  maxScore?: number;
  order: number;
  locked?: boolean;
}

export interface IScorecardEntryValue {
  criteriaId: string;
  value: string | number | boolean;
}

export interface IScorecardEntry {
  id: string;
  name: string;
  notes?: string;
  values: IScorecardEntryValue[];
  finalScore: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IScorecard extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  entityLabel: string;
  template: ScorecardTemplate;
  criteria: IScorecardCriterion[];
  entries: IScorecardEntry[];
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScorecardCriterionSchema = new Schema<IScorecardCriterion>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: String,
    inputType: {
      type: String,
      enum: ["number", "percentage", "boolean", "text"],
      required: true,
    },
    weight: { type: Number, required: true, min: 0, max: 100 },
    maxScore: { type: Number, min: 1 },
    order: { type: Number, required: true },
    locked: { type: Boolean, default: false },
  },
  { _id: false }
);

const ScorecardEntryValueSchema = new Schema<IScorecardEntryValue>(
  {
    criteriaId: { type: String, required: true },
    value: Schema.Types.Mixed,
  },
  { _id: false }
);

const ScorecardEntrySchema = new Schema<IScorecardEntry>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    notes: String,
    values: [ScorecardEntryValueSchema],
    finalScore: { type: Number, default: 0 },
  },
  { _id: false, timestamps: true }
);

const ScorecardSchema = new Schema<IScorecard>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    entityLabel: { type: String, required: true, trim: true },
    template: {
      type: String,
      enum: [
        "daily-productivity",
        "startup-idea-validator",
        "job-candidate-evaluation",
        "stock-analysis",
        "custom",
      ],
      default: "custom",
      required: true,
    },
    criteria: [ScorecardCriterionSchema],
    entries: [ScorecardEntrySchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

ScorecardSchema.index({ createdBy: 1, createdAt: -1 });
export const Scorecard =
  mongoose.models.Scorecard ||
  mongoose.model<IScorecard>("Scorecard", ScorecardSchema);
