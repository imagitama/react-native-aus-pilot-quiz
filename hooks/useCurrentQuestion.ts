import {
  selectCurrentQuestionIdx,
  selectQuestionIds,
} from "@/features/quiz/quizSlice";
import { Question } from "@/types";
import { findQuestionById } from "@/utils";
import { useAppSelector } from "./state";
import useQuestionData from "./useQuestionData";
import useSelectedNode from "./useSelectedNode";

const useCurrentQuestion = (): Question | null => {
  const [selectedNode] = useSelectedNode();
  const [questionData] = useQuestionData();
  const currentQuestionIdx = useAppSelector(selectCurrentQuestionIdx);
  const questionIds = useAppSelector(selectQuestionIds);

  if (
    selectedNode === null ||
    currentQuestionIdx === null ||
    questionIds === null ||
    !questionData
  ) {
    return null;
  }

  const questionId = questionIds[currentQuestionIdx];

  if (!questionId) {
    console.warn(
      `Could not find current question ID with idx ${currentQuestionIdx}`
    );
    return null;
  }

  const question = findQuestionById([selectedNode], questionId);

  if (!question) {
    throw new Error(
      `Could not find current question with ID ${questionId} (selectedNode "${selectedNode.name}")`
    );
  }

  return question;
};

export default useCurrentQuestion;
