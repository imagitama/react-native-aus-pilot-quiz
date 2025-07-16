import { selectSelectedAreaId } from "@/features/quiz/quizSlice";
import { Area } from "@/types";
import { useAppSelector } from "./state";
import useLevel from "./useLevel";

const useArea = (): Area | null => {
  const level = useLevel();
  const currentAreaId = useAppSelector(selectSelectedAreaId);

  if (!level || !currentAreaId) {
    return null;
  }

  const area = level.areas.find((area) => area.name === currentAreaId);

  if (!area) {
    throw new Error(`Could not find area with ID ${currentAreaId}`);
  }

  return area;
};

export default useArea;
