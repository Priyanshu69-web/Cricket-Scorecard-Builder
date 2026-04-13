import { v4 as uuidv4 } from "uuid";
import {
  CriteriaInputType,
  IScorecard,
  IScorecardCriterion,
  IScorecardEntry,
  ScorecardTemplate,
} from "@/lib/Scorecard";

export const SCORECARD_TEMPLATES: Array<{
  id: ScorecardTemplate;
  title: string;
  description: string;
  entityLabel: string;
  criteria: Array<Omit<IScorecardCriterion, "id" | "order">>;
}> = [
  {
    id: "daily-productivity",
    title: "Daily Productivity Tracker",
    description: "Track how effectively each day or task batch performed.",
    entityLabel: "Day",
    criteria: [
      { name: "Focus", inputType: "number", weight: 30, maxScore: 10, locked: false },
      { name: "Consistency", inputType: "number", weight: 25, maxScore: 10, locked: false },
      { name: "Energy", inputType: "number", weight: 20, maxScore: 10, locked: false },
      { name: "Completion Rate", inputType: "percentage", weight: 25, locked: false },
    ],
  },
  {
    id: "startup-idea-validator",
    title: "Startup Idea Validator",
    description: "Compare ideas by demand, moat, effort, and business upside.",
    entityLabel: "Idea",
    criteria: [
      { name: "Market Demand", inputType: "number", weight: 30, maxScore: 10, locked: false },
      { name: "ROI Potential", inputType: "number", weight: 30, maxScore: 10, locked: false },
      { name: "Execution Feasibility", inputType: "number", weight: 20, maxScore: 10, locked: false },
      { name: "Risk", inputType: "percentage", weight: 20, locked: false },
    ],
  },
  {
    id: "job-candidate-evaluation",
    title: "Job Candidate Evaluation",
    description: "Rank candidates by skills, communication, and culture add.",
    entityLabel: "Candidate",
    criteria: [
      { name: "Skill Fit", inputType: "number", weight: 35, maxScore: 10, locked: false },
      { name: "Communication", inputType: "number", weight: 20, maxScore: 10, locked: false },
      { name: "Culture Add", inputType: "number", weight: 15, maxScore: 10, locked: false },
      { name: "Problem Solving", inputType: "number", weight: 20, maxScore: 10, locked: false },
      { name: "Hiring Confidence", inputType: "boolean", weight: 10, locked: false },
    ],
  },
  {
    id: "stock-analysis",
    title: "Stock Analysis",
    description: "Evaluate picks by growth, valuation, quality, and conviction.",
    entityLabel: "Stock",
    criteria: [
      { name: "Growth Outlook", inputType: "number", weight: 30, maxScore: 10, locked: false },
      { name: "Valuation", inputType: "number", weight: 20, maxScore: 10, locked: false },
      { name: "Financial Strength", inputType: "number", weight: 25, maxScore: 10, locked: false },
      { name: "Technical Setup", inputType: "number", weight: 10, maxScore: 10, locked: false },
      { name: "Conviction", inputType: "percentage", weight: 15, locked: false },
    ],
  },
  {
    id: "custom",
    title: "Blank Scorecard",
    description: "Start from scratch and define your own weighted model.",
    entityLabel: "Option",
    criteria: [
      { name: "Quality", inputType: "number", weight: 40, maxScore: 10, locked: false },
      { name: "Effort", inputType: "number", weight: 30, maxScore: 10, locked: false },
      { name: "Confidence", inputType: "percentage", weight: 30, locked: false },
    ],
  },
];

type ScorecardPayloadInput = {
  title?: unknown;
  description?: unknown;
  entityLabel?: unknown;
  template?: unknown;
  criteria?: unknown;
  entries?: unknown;
};

type CriterionPayloadInput = {
  id?: unknown;
  name?: unknown;
  description?: unknown;
  inputType?: unknown;
  weight?: unknown;
  maxScore?: unknown;
  locked?: unknown;
};

type EntryPayloadInput = {
  id?: unknown;
  name?: unknown;
  notes?: unknown;
  values?: unknown;
};

type EntryValuePayloadInput = {
  criteriaId?: unknown;
  value?: string | number | boolean;
};

export function buildCriteriaFromTemplate(template: ScorecardTemplate) {
  const found =
    SCORECARD_TEMPLATES.find((item) => item.id === template) ||
    SCORECARD_TEMPLATES[SCORECARD_TEMPLATES.length - 1];

  return found.criteria.map((criterion, index) => ({
    ...criterion,
    id: uuidv4(),
    order: index,
  }));
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function normalizeWeightTotal(criteria: IScorecardCriterion[]) {
  return criteria.reduce((sum, criterion) => sum + Number(criterion.weight || 0), 0);
}

export function normalizeValue(
  inputType: CriteriaInputType,
  value: string | number | boolean | null | undefined,
  maxScore?: number
) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  if (inputType === "boolean") {
    return value ? 100 : 0;
  }

  if (inputType === "percentage") {
    return clamp(Number(value) || 0, 0, 100);
  }

  if (inputType === "number") {
    const limit = maxScore && maxScore > 0 ? maxScore : 10;
    return clamp(((Number(value) || 0) / limit) * 100, 0, 100);
  }

  return 0;
}

export function calculateEntryFinalScore(
  entry: Pick<IScorecardEntry, "values">,
  criteria: IScorecardCriterion[]
) {
  const criterionMap = new Map(criteria.map((criterion) => [criterion.id, criterion]));

  return Number(
    entry.values
      .reduce((sum, current) => {
        const criterion = criterionMap.get(current.criteriaId);
        if (!criterion) {
          return sum;
        }

        const normalized = normalizeValue(
          criterion.inputType,
          current.value,
          criterion.maxScore
        );

        return sum + criterion.weight * (normalized / 100);
      }, 0)
      .toFixed(2)
  );
}

export function enrichEntries(scorecard: Pick<IScorecard, "criteria" | "entries">) {
  return scorecard.entries
    .map((entry) => ({
      ...entry,
      finalScore: calculateEntryFinalScore(entry, scorecard.criteria),
    }))
    .sort((a, b) => b.finalScore - a.finalScore);
}

export function buildScorecardSummary(scorecard: Pick<IScorecard, "criteria" | "entries">) {
  const rankedEntries = enrichEntries(scorecard);
  const totals = rankedEntries.map((entry) => entry.finalScore);
  const averageScore =
    totals.length > 0
      ? Number((totals.reduce((sum, value) => sum + value, 0) / totals.length).toFixed(2))
      : 0;

  const criterionInsights = scorecard.criteria.map((criterion) => {
    const average =
      rankedEntries.length > 0
        ? Number(
            (
              rankedEntries.reduce((sum, entry) => {
                const found = entry.values.find((value) => value.criteriaId === criterion.id);
                return sum + normalizeValue(criterion.inputType, found?.value, criterion.maxScore);
              }, 0) / rankedEntries.length
            ).toFixed(2)
          )
        : 0;

    return {
      id: criterion.id,
      name: criterion.name,
      average,
      weight: criterion.weight,
    };
  });

  const strongestCriterion = [...criterionInsights].sort((a, b) => b.average - a.average)[0];
  const weakestCriterion = [...criterionInsights].sort((a, b) => a.average - b.average)[0];
  const topEntry = rankedEntries[0];
  const bottomEntry = rankedEntries[rankedEntries.length - 1];

  const insights: string[] = [];
  if (topEntry) {
    insights.push(`${topEntry.name} leads with a weighted score of ${topEntry.finalScore}.`);
  }
  if (strongestCriterion) {
    insights.push(
      `${strongestCriterion.name} is the strongest area across entries at ${strongestCriterion.average}%.`
    );
  }
  if (weakestCriterion) {
    insights.push(
      `${weakestCriterion.name} is dragging results and is the clearest improvement opportunity.`
    );
  }

  return {
    rankedEntries,
    topEntry,
    bottomEntry,
    averageScore,
    highestScore: topEntry?.finalScore || 0,
    lowestScore: bottomEntry?.finalScore || 0,
    criterionInsights,
    insights,
  };
}

export function sanitizeScorecardPayload(input: ScorecardPayloadInput) {
  const criteria = Array.isArray(input.criteria) ? (input.criteria as CriterionPayloadInput[]) : [];
  const entries = Array.isArray(input.entries) ? (input.entries as EntryPayloadInput[]) : [];

  return {
    title: String(input.title || "").trim(),
    description: String(input.description || "").trim(),
    entityLabel: String(input.entityLabel || "Option").trim(),
    template: (input.template || "custom") as ScorecardTemplate,
    criteria: criteria.map((criterion, index: number) => ({
      id: String(criterion.id || uuidv4()),
      name: String(criterion.name || `Criteria ${index + 1}`).trim(),
      description: String(criterion.description || "").trim(),
      inputType: criterion.inputType as CriteriaInputType,
      weight: Number(criterion.weight || 0),
      maxScore:
        criterion.inputType === "number"
          ? Number(criterion.maxScore || 10)
          : undefined,
      order: index,
      locked: Boolean(criterion.locked),
    })),
    entries: entries.map((entry) => ({
      id: String(entry.id || uuidv4()),
      name: String(entry.name || "").trim(),
      notes: String(entry.notes || "").trim(),
      values: Array.isArray(entry.values)
        ? (entry.values as EntryValuePayloadInput[]).map((value) => ({
            criteriaId: String(value.criteriaId || ""),
            value: value.value ?? "",
          }))
        : [],
      finalScore: 0,
    })),
  };
}
