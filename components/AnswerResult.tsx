import {
  selectAnswerIdsByQuestionIdx,
  selectFinalAnswersByQuestionIdx,
} from "@/features/quiz/quizSlice";
import { useAppSelector } from "@/hooks/state";
import { Answer } from "@/types";
import { View } from "react-native";
import ReferenceLikeOutput from "./ReferenceLikeOutput";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

const AnswerResult = ({
  answer,
  questionIdx,
  correctAnswer,
  forceSelected = false,
}: {
  answer: Answer;
  questionIdx: number;
  correctAnswer: Answer;
  forceSelected?: boolean;
}) => {
  const finalAnswersByQuestionIdx = useAppSelector(
    selectFinalAnswersByQuestionIdx
  );
  const answersByQuestionIdx = useAppSelector(selectAnswerIdsByQuestionIdx);

  if (finalAnswersByQuestionIdx === null) {
    throw new Error("Cannot render answer without some indexes");
  }
  if (answersByQuestionIdx === null) {
    throw new Error("Cannot render answer without random answer indexes");
  }

  const isCorrectAnswer = answer.internalId === correctAnswer.internalId;

  // TODO: Store more complex object to keep track of answers - current system complicated and hard to follow
  // eg. state.quiz.answerIdsPerQuestionId[questionId] = answerId[]

  const answerIdsForQuestion = answersByQuestionIdx[questionIdx];
  const answerIdx = answerIdsForQuestion.findIndex(
    (answerId) => answerId === answer.internalId
  )!;

  const finalAnswer = finalAnswersByQuestionIdx[questionIdx];
  const wasSelected =
    (finalAnswer &&
      "answerId" in finalAnswer &&
      finalAnswer.answerId === answer.internalId) ||
    forceSelected;

  if (wasSelected) {
    console.debug("AnswerResult.wasSelected", {
      answer,
      answerIdsForQuestion,
      finalAnswersByQuestionIdx,
      answerIdx,
      questionIdx,
    });
  }

  const isIncorrectAnswer = !isCorrectAnswer && wasSelected;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <IconSymbol
          name={wasSelected ? "radio-button-checked" : "radio-button-unchecked"}
          color="white"
          style={{ marginRight: 10 }}
        />
        <ThemedText
          style={{
            textDecorationLine:
              wasSelected && !isCorrectAnswer ? "line-through" : undefined,
          }}
        >
          {answer.answer}{" "}
        </ThemedText>
      </View>
      {isCorrectAnswer ? (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}
        >
          <IconSymbol name="check" color="green" />{" "}
          <ThemedText style={{ color: "green", fontWeight: "bold" }}>
            Correct answer
          </ThemedText>
        </View>
      ) : isIncorrectAnswer ? (
        <View
          style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}
        >
          <IconSymbol name="close" color="red" />{" "}
          <ThemedText style={{ color: "red", fontWeight: "bold" }}>
            Incorrect answer
          </ThemedText>
        </View>
      ) : null}
      {answer.rationale ? (
        <ThemedText style={{ marginLeft: 10, fontStyle: "italic" }}>
          Rationale/Explanation:{" "}
          <ReferenceLikeOutput referenceLike={answer.rationale} />
        </ThemedText>
      ) : null}
      {answer.reference ? (
        <ThemedText style={{ marginLeft: 10, fontStyle: "italic" }}>
          Reference: <ReferenceLikeOutput referenceLike={answer.reference} />
        </ThemedText>
      ) : null}
    </View>
  );
};

export default AnswerResult;
