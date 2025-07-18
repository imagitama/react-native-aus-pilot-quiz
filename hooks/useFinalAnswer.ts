import {
  selectFinalAnswersByQuestionIdx,
  setFinalAnswerAction,
} from "@/features/quiz/quizSlice";
import { FinalAnswer } from "@/types";
import { useAppDispatch, useAppSelector } from "./state";

const useFinalAnswer = (
  questionIdx: number
): [null | FinalAnswer, (newFinalAnswer: null | FinalAnswer) => void] => {
  const finalAnswersByQuestionIdx = useAppSelector(
    selectFinalAnswersByQuestionIdx
  );
  const currentFinalAnswer = finalAnswersByQuestionIdx
    ? finalAnswersByQuestionIdx[questionIdx]
    : null;

  const dispatch = useAppDispatch();

  const storeFinalAnswer = (newFinalAnswer: null | FinalAnswer) =>
    dispatch(setFinalAnswerAction([questionIdx, newFinalAnswer]));

  return [currentFinalAnswer, storeFinalAnswer];
};

export default useFinalAnswer;
