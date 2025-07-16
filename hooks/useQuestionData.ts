import {
  selectQuestionData,
  storeQuestionDataAction,
} from "@/features/quiz/quizSlice";
import { QuestionData } from "../types";
import { useAppDispatch, useAppSelector } from "./state";

const useQuestionData = (): [
  QuestionData | null,
  (newData: QuestionData) => void,
] => {
  const questionData = useAppSelector(selectQuestionData);
  const dispatch = useAppDispatch();
  const storeQuestionData = (newData: QuestionData) =>
    dispatch(storeQuestionDataAction(newData));

  return [questionData, storeQuestionData];
};

export default useQuestionData;
