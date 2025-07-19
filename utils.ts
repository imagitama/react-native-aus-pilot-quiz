import { QuizState } from "./features/quiz/quizSlice";
import { Answer, LevelNode, Question } from "./types";

export function shuffleArray<T>(array: T[]): T[] {
  const result = JSON.parse(JSON.stringify(array));
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD") // separate accents
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]+/g, "-") // replace non-alphanumerics with dashes
    .replace(/^-+|-+$/g, "") // trim leading/trailing dashes
    .replace(/-+/g, "-"); // collapse multiple dashes
}

export const getIdForQuestion = (question: Question): string => {
  if (!question.question) {
    throw new Error(
      `Question does not have a question: ${JSON.stringify(question)}`
    );
  }
  return slugify(question.question);
};

export const getIdForAnswer = (answer: Answer): string => {
  if (!answer.internalId) {
    throw new Error(
      `Answer does not have an internal ID: ${JSON.stringify(answer)}`
    );
  }
  return slugify(answer.internalId);
};

export function tallyCorrectAnswers(
  state: QuizState,
  allQuestions: Question[]
): number {
  if (
    !state.questionIds ||
    !state.answerIdsByQuestionIdx ||
    !state.finalAnswersByQuestionIdx
  ) {
    return 0;
  }

  let tally = 0;

  for (let i = 0; i < state.questionIds.length; i++) {
    const questionId = state.questionIds[i];
    const finalAnswer = state.finalAnswersByQuestionIdx[i];
    const shuffledAnswerIds = state.answerIdsByQuestionIdx[i];

    const question = allQuestions.find(
      (q) => getIdForQuestion(q) === questionId
    );

    if (
      finalAnswer == null ||
      !shuffledAnswerIds ||
      !question ||
      !question.answers.length
    ) {
      continue; // skip unanswered or invalid questions
    }

    const isDragAndDrop = question.answers.some(
      (answer) => answer.correctIndex !== undefined
    );

    if (isDragAndDrop) {
      // Sort correct answers by correctIndex
      const correctOrder = question.answers
        .filter((a) => a.correctIndex !== undefined)
        .sort((a, b) => a.correctIndex! - b.correctIndex!)
        .map((a) => a.internalId);

      const userOrder = "answerIds" in finalAnswer ? finalAnswer.answerIds : [];

      // Check if user order matches the correct order exactly
      const isCorrect =
        userOrder.length === correctOrder.length &&
        userOrder.every((id, idx) => id === correctOrder[idx]);

      if (isCorrect) tally++;
    } else {
      // Normal single-answer logic
      const explicitCorrectAnswer = question.answers.find(
        (answer) => answer.correct
      );
      const correctAnswerId = explicitCorrectAnswer
        ? explicitCorrectAnswer.internalId
        : question.answers[0].internalId;
      const finalAnswerId = shuffledAnswerIds.find(
        (id) => "answerId" in finalAnswer && id === finalAnswer.answerId
      );

      if (finalAnswerId === correctAnswerId) {
        tally++;
      }
    }
  }

  return tally;
}

export function findNodeById(
  nodes: LevelNode[],
  nodeId: string
): LevelNode | null {
  for (const node of nodes) {
    if (node.internalId === nodeId) return node;

    if (node.children) {
      const found = findNodeById(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

export function collectQuestions(node: LevelNode): Question[] {
  let questions: Question[] = [];

  if (node.questions) {
    questions = [...node.questions];
  }

  if (node.children) {
    for (const child of node.children) {
      questions.push(...collectQuestions(child));
    }
  }

  return questions;
}

export function collectNodes(node: LevelNode): LevelNode[] {
  let nodes: LevelNode[] = [];

  if (node.children) {
    for (const child of node.children) {
      nodes.push(...collectNodes(child));
    }
  }

  return nodes;
}

export function findQuestionById(
  nodes: LevelNode[],
  questionId: string
): Question | null {
  for (const node of nodes) {
    if (node.children) {
      const found = findQuestionById(node.children, questionId);
      if (found) return found;
    } else if (node.questions) {
      const found = node.questions.find(
        (question) => getIdForQuestion(question) === questionId
      );
      if (found) return found;
    }
  }
  return null;
}
