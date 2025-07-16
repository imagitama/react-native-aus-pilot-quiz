import {
  selectCurrentQuestionIdx,
  selectQuestionIds,
} from "@/features/quiz/quizSlice";
import { Question } from "@/types";
import { getIdForQuestion } from "@/utils";
import { useAppSelector } from "./state";
import useArea from "./useArea";

const useCurrentQuestion = (): Question | null => {
  const area = useArea();
  const currentQuestionIdx = useAppSelector(selectCurrentQuestionIdx);
  const questionIds = useAppSelector(selectQuestionIds);

  if (area === null || currentQuestionIdx === null || questionIds === null) {
    return null;
  }

  const questionId = questionIds[currentQuestionIdx];

  if (!questionId) {
    console.warn(
      `Could not find current question ID with idx ${currentQuestionIdx}`
    );
    return null;
  }

  const question = area.questions.find(
    (question) => getIdForQuestion(question) === questionId
  );

  if (!question) {
    throw new Error(
      `Could not find current question with ID ${questionId} (area "${area.name}")`
    );
  }

  return question;
};

export default useCurrentQuestion;
