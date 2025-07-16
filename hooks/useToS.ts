import {
  agreeToToSAction,
  selectHasAgreedToToS,
} from "@/features/quiz/quizSlice";
import { useAppDispatch, useAppSelector } from "./state";

const useToS = (): [boolean, () => void] => {
  const hasAgreedToToS = useAppSelector(selectHasAgreedToToS);
  const dispatch = useAppDispatch();
  const agreeToToS = () => dispatch(agreeToToSAction());

  return [hasAgreedToToS, agreeToToS];
};

export default useToS;
