import useFinalAnswer from "@/hooks/useFinalAnswer";
import { Answer } from "@/types";
import React from "react";
import { StyleSheet, View } from "react-native";
import Button from "./Button";
import DraggableList, { DraggableItem } from "./DraggableList";
import Gap from "./Gap";

const DragAndDropAnswerInput = ({
  questionIdx,
  randomAnswers,
}: {
  questionIdx: number;
  randomAnswers: Answer[];
}) => {
  const [finalAnswer, storeFinalAnswer] = useFinalAnswer(questionIdx);

  const setDraggableItems = (newItems: DraggableItem[]) =>
    storeFinalAnswer({
      answerIds: newItems.map((item) => item.id),
    });

  const draggableItems =
    finalAnswer && "answerIds" in finalAnswer
      ? finalAnswer.answerIds.map((id) => ({
          id,
          label: randomAnswers.find((answer) => answer.internalId === id)!
            .answer,
        }))
      : [];

  const remainingAnswers = randomAnswers.filter(
    (a) => !draggableItems.find((item) => item.id === a.internalId)
  );

  //   const handleAddAnswer = (answer: Answer) => {
  //     setDraggableItems([
  //       ...draggableItems,
  //       { id: answer.internalId, label: answer.answer },
  //     ]);
  //   };

  //   const handleRemoveAnswerId = (answerId: string) => {
  //     setDraggableItems(draggableItems.filter((item) => item.id !== answerId));
  //   };

  const onDraggableChange = (
    leftItems: DraggableItem[],
    rightItems: DraggableItem[]
  ) => {
    // leftItems = remaining answers
    // rightItems = selected answers
    setDraggableItems(leftItems);
  };

  return (
    <View style={styles.container}>
      <DraggableList
        leftItems={draggableItems}
        rightItems={remainingAnswers.map((answer) => ({
          id: answer.internalId,
          label: answer.answer,
        }))}
        onChange={onDraggableChange}
      />
      <Gap />
      <Button
        title="Reset"
        onPress={() => storeFinalAnswer(null)}
        type="ghost"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  item: {
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  text: { fontSize: 16 },
  removeText: { color: "red", fontSize: 18, paddingLeft: 10 },
});

export default DragAndDropAnswerInput;
