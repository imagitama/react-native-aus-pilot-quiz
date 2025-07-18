export enum Mode {
  Quiz,
}

export enum AppState {
  MainMenu,
  SelectNode,
  Configure,
  Progress,
  Ended,
}

export interface QuestionData {
  children: LevelNode[];
}

export type QuestionsJson = QuestionData;

export interface LevelNode {
  internalId: string; // generated
  name: string;
  abbr?: string;
  questions?: Question[];
  children?: LevelNode[];
}

export interface Question {
  question: string; // also used as unique ID
  hint?: string;
  imageName?: string | null;
  answers: Answer[];
  source?: ReferenceLike;
}

export interface Answer {
  internalId: string; // generated
  answer: string;
  correct?: boolean; // otherwise assume 1st index is correct
  rationale?: ReferenceLike;
  reference?: ReferenceLike;
}

export type ReferenceLike = string | UrlDescriptor | UrlDescriptor[];

export interface UrlDescriptor {
  url: string;
}

export interface FinalAnswerAnswer {
  answerId: string;
}

export interface FinalTextAnswer {
  text: string;
}

export type FinalAnswer = FinalTextAnswer | FinalAnswerAnswer;
