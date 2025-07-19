import {
  selectAnswerIdsByQuestionIdx,
  selectFinalAnswersByQuestionIdx,
} from "@/features/quiz/quizSlice";
import { useAppSelector } from "@/hooks/state";
import { Answer, Question } from "@/types";
import { View } from "react-native";
import { ThemedText } from "./ThemedText";

const AnswerResult = ({
  idx,
  answer,
  isCorrect,
  isMissing,
  isExtra,
}: {
  idx: number;
  answer: Answer;
  isCorrect?: boolean;
  isMissing?: boolean;
  isExtra?: boolean;
}) => {
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
        <ThemedText
          style={{
            //   textDecorationLine:
            //   !isCorrect ? "line-through" : undefined,
            color: isMissing
              ? "yellow"
              : isCorrect
                ? "green"
                : isExtra
                  ? "red"
                  : "red",
          }}
        >
          {idx + 1}. {answer.answer} -{" "}
          {isMissing
            ? "Missing!"
            : isCorrect
              ? "Correct"
              : isExtra
                ? "Extra"
                : "Incorrect"}
        </ThemedText>
      </View>
    </View>
  );
};

const DragAndDropAnswerResult = ({
  questionIdx,
  question,
}: {
  questionIdx: number;
  question: Question;
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

  const finalAnswer = finalAnswersByQuestionIdx[questionIdx];

  if (!finalAnswer) {
    throw new Error("No final answer for question");
  }
  if (!("answerIds" in finalAnswer)) {
    throw new Error("No answer IDs");
  }

  const userAnswerIds = finalAnswer.answerIds;

  const correctAnswersInOrder = question.answers.filter(
    (answer) => answer.correctIndex !== undefined
  );
  correctAnswersInOrder.sort(
    (answerA, answerB) => answerA.correctIndex! - answerB.correctIndex!
  );

  const correctIds = correctAnswersInOrder.map((a) => a.internalId);
  const maxLength = Math.max(userAnswerIds.length, correctIds.length);

  return (
    <View
      style={{
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        flexWrap: "wrap",
      }}
    >
      {Array.from({ length: maxLength }).map((_, idx) => {
        const userId = userAnswerIds[idx];
        const correctId = correctIds[idx];

        const isCorrect = userId && userId === correctId ? true : false;
        const isMissing = !userId && correctId;
        const isExtra = userId && !correctId ? true : false;

        if (isMissing) {
          const correctAnswer = question.answers.find(
            (a) => a.internalId === correctId
          )!;
          return (
            <View key={`missing-${idx}`} style={{ margin: 4 }}>
              <AnswerResult idx={idx} answer={correctAnswer} isMissing />
            </View>
          );
        }

        if (userId) {
          const userAnswer = question.answers.find(
            (a) => a.internalId === userId
          )!;
          return (
            <View key={userId} style={{ margin: 4 }}>
              <AnswerResult
                idx={idx}
                answer={userAnswer}
                isCorrect={isCorrect}
                isExtra={isExtra}
              />
            </View>
          );
        }

        return null;
      })}
    </View>
  );
};

export default DragAndDropAnswerResult;
