export enum Mode {
  Quiz,
}

export enum AppState {
  MainMenu,
  Progress,
  Ended,
}

export interface QuestionData {
  levels: Level[];
}

export type QuestionsJson = QuestionData;

export interface Level {
  abbr?: string;
  name: string;
  areas: Area[];
}

export interface Area {
  abbr?: string;
  name: string;
  questions: Question[];
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
