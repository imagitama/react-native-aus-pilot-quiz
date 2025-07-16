import { selectOptions } from "@/features/quiz/quizSlice";
import { useAppSelector } from "./state";

const useQuizOptions = () => {
  const options = useAppSelector(selectOptions);
  return options;
};

export default useQuizOptions;
