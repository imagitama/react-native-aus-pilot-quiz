import {
  selectSelectedAnswerIndexes,
  toggleAnswerIdxAction,
} from "@/features/quiz/quizSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/state";
import { Answer } from "@/types";
import { Pressable, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

const AnswerOption = ({
  questionIdx,
  answer,
  idx,
}: {
  questionIdx: number;
  answer: Answer;
  idx: number;
}) => {
  const dispatch = useAppDispatch();
  const toggleAnswer = () => dispatch(toggleAnswerIdxAction(idx));
  const selectedAnswerIndexes = useAppSelector(selectSelectedAnswerIndexes);

  if (selectedAnswerIndexes === null) {
    throw new Error("Cannot render answer without some indexes");
  }

  const isSelected = selectedAnswerIndexes[questionIdx] === idx;

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
