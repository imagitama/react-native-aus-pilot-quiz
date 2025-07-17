import { QuizState } from "./features/quiz/quizSlice";
import { Answer, Question, QuestionData } from "./types";

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

function slugify(input: string): string {
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

    const explicitCorrectAnswer = question.answers.find(
      (answer) => answer.correct
    );
    const correctAnswerText = explicitCorrectAnswer
      ? explicitCorrectAnswer.answer
      : question.answers[0].answer;
    const finalAnswerText = shuffledAnswerIds.find(
      (id) => id === finalAnswer.answerId
    );

    if (finalAnswerText === correctAnswerText) {
      tally++;
    }
  }

  return tally;
}

export const purgeDuplicateQuestionData = (
  data: QuestionData
): QuestionData => {
  const seenLevelNames = new Set<string>();

  let answerId = 0;

  const levels = data.levels
    .filter((level) => {
      if (seenLevelNames.has(level.name)) return false;
      seenLevelNames.add(level.name);
      return true;
    })
    .map((level) => {
      const seenAreaNames = new Set<string>();

      const areas = level.areas
        .filter((area) => {
          if (seenAreaNames.has(area.name)) return false;
          seenAreaNames.add(area.name);
          return true;
        })
        .map((area) => {
          const seenQuestions = new Set<string>();

          const questions = area.questions
            .filter((question) => {
              if (seenQuestions.has(question.question)) return false;
              seenQuestions.add(question.question);
              return true;
            })
            .map((question) => {
              const seenAnswers = new Set<string>();

              let answers = question.answers.filter((answer) => {
                if (seenAnswers.has(answer.answer)) return false;
                seenAnswers.add(answer.answer);
                return true;
              });

              answers = answers.map((answer) => {
                answerId++;
                return {
                  ...answer,
                  internalId: answerId.toString(),
                };
              });

              return { ...question, answers };
            });

          return { ...area, questions };
        });

      return { ...level, areas };
    });

  return { levels };
};
