import {
  selectSelectedNodeId,
  setSelectedNodeIdAction,
} from "@/features/quiz/quizSlice";
import { LevelNode } from "@/types";
import { findNodeById } from "@/utils";
import { useAppDispatch, useAppSelector } from "./state";
import useQuestionData from "./useQuestionData";

const useSelectedNode = (): [LevelNode | null, (id: string) => void] => {
  const [questionData] = useQuestionData();
  const selectedNodeId = useAppSelector(selectSelectedNodeId);

  const dispatch = useAppDispatch();
  const setSelectedNodeId = (id: string) =>
    dispatch(setSelectedNodeIdAction(id));

  if (!questionData || !selectedNodeId) {
    return [null, setSelectedNodeId];
  }

  const selectedNode = findNodeById(questionData.children, selectedNodeId);

  if (!selectedNode) {
    console.warn(`Could not find selected node with ID ${selectedNodeId}`);
    return [null, setSelectedNodeId];
  }

  return [selectedNode, setSelectedNodeId];
};

export default useSelectedNode;
