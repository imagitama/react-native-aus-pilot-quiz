import { Question } from "@/types";
import { findQuestionById } from "@/utils";
import useSelectedNode from "./useSelectedNode";

const useQuestion = (id: string): Question | null => {
  const [selectedNode] = useSelectedNode();

  if (!selectedNode) {
    return null;
  }

  const question = findQuestionById([selectedNode], id);

  if (!question) {
    console.warn(`Could not find question with ID ${id}`);
    return null;
  }

  return question;
};

export default useQuestion;
