import {
  selectFinalAnswersByQuestionIdx,
  toggleFinalAnswerIdAction,
} from "@/features/quiz/quizSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/state";
import { Answer } from "@/types";
import { Pressable, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

const AnswerOption = ({
  questionIdx,
  answer,
}: {
  questionIdx: number;
  answer: Answer;
}) => {
  const dispatch = useAppDispatch();
  const toggleAnswer = () =>
    dispatch(toggleFinalAnswerIdAction(answer.internalId));
  const selectedAnswerIndexes = useAppSelector(selectFinalAnswersByQuestionIdx);

  if (selectedAnswerIndexes === null) {
    throw new Error("Cannot render answer without some indexes");
  }

  const isSelected =
    selectedAnswerIndexes[questionIdx]?.answerId === answer.internalId;

  return (
    <>
      <Pressable onPress={toggleAnswer}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 10,
          }}
        >
          <IconSymbol
            name={
              isSelected ? "radio-button-checked" : "radio-button-unchecked"
            }
            color="white"
            style={{ marginRight: 10 }}
          />
          <ThemedText>{answer.answer}</ThemedText>
        </View>
      </Pressable>
    </>
  );
};

export default AnswerOption;
