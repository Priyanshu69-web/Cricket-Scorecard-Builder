import mongoose, { Schema, Document } from 'mongoose';

export interface IScorecardField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'select' | 'checkbox';
  options?: string[];
  required?: boolean;
  order: number;
}

export interface IScorecardValue {
  fieldId: string;
  value: string | number | boolean;
}

export type ScorecardType = 'Cricket' | 'Football' | 'Custom';

export interface IScorecard extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  type: ScorecardType;
  fields: IScorecardField[];
  values: IScorecardValue[];
  createdBy: mongoose.Types.ObjectId;
  isPublic: boolean;
  shareToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScorecardFieldSchema = new Schema<IScorecardField>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['text', 'number', 'select', 'checkbox'], required: true },
  options: [String],
  required: Boolean,
  order: { type: Number, required: true },
});

const ScorecardValueSchema = new Schema<IScorecardValue>({
  fieldId: { type: String, required: true },
  value: Schema.Types.Mixed,
});

const ScorecardSchema = new Schema<IScorecard>(
  {
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['Cricket', 'Football', 'Custom'], required: true },
    fields: [ScorecardFieldSchema],
    values: [ScorecardValueSchema],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isPublic: { type: Boolean, default: false },
    shareToken: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

ScorecardSchema.index({ createdBy: 1, createdAt: -1 });
ScorecardSchema.index({ shareToken: 1 });

export const Scorecard = mongoose.models.Scorecard || mongoose.model<IScorecard>('Scorecard', ScorecardSchema);
