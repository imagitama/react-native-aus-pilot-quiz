import { selectSelectedLevelId } from "@/features/quiz/quizSlice";
import { Level } from "@/types";
import { useAppSelector } from "./state";
import useQuestionData from "./useQuestionData";

const useLevel = (): Level | null => {
  const [questionData] = useQuestionData();
  const selectedLevelId = useAppSelector(selectSelectedLevelId);

  if (!questionData || !selectedLevelId) {
    return null;
  }

  const level = questionData.levels.find(
    (level) => level.name === selectedLevelId
  );

  if (!level) {
    throw new Error(`Could not find level with ID ${selectedLevelId}`);
  }

  return level;
};

export default useLevel;
