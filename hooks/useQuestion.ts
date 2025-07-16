import { Question } from "@/types";
import { getIdForQuestion } from "@/utils";
import useArea from "./useArea";

const useQuestion = (id: string): Question | null => {
  const area = useArea();

  if (!area) {
    return null;
  }

  const question = area.questions.find(
    (question) => getIdForQuestion(question) === id
  );

  if (!question) {
    throw new Error(`Could not find question with ID ${id}`);
  }

  return question;
};

export default useQuestion;
