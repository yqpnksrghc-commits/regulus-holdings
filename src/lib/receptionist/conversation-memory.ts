import type { IntentClassification } from "@/lib/receptionist/intent";
import type { QualificationFields } from "@/lib/receptionist/schema";

const QUESTION_BY_FIELD: { field: keyof QualificationFields; ask: string }[] = [
  { field: "business_type", ask: "What type of business do you operate?" },
  { field: "industry", ask: "What industry does your business operate in?" },
  { field: "business_problem", ask: "Which workflow or operational problem would you most like to improve?" },
  { field: "desired_outcome", ask: "What outcome would make solving that problem worthwhile?" },
  { field: "urgency", ask: "How soon would you like to improve it?" },
  { field: "decision_authority", ask: "Who would be involved in deciding whether to move forward?" },
  { field: "email", ask: "What is the best email for arranging the next step?" },
];

export function questionForField(field: keyof QualificationFields | null): string | null {
  if (field === null) return null;
  return QUESTION_BY_FIELD.find((item) => item.field === field)?.ask ?? null;
}

export function rememberAnsweredQuestion(q: QualificationFields, classification: IntentClassification): QualificationFields {
  const key = classification.intent;
  if (key === "unknown" || q.questions_answered.includes(key)) return q;
  return { ...q, questions_answered: [...q.questions_answered, key].slice(-30) };
}

export function nextQualificationQuestion(q: QualificationFields): string {
  for (const item of QUESTION_BY_FIELD) {
    const value = q[item.field];
    if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) return item.ask;
  }
  return "Would you like to arrange a discovery call to examine the opportunity?";
}
