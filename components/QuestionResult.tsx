import {
  selectAnswerIdsByQuestionIdx,
  selectQuestionIds,
} from "@/features/quiz/quizSlice";
import { useAppSelector } from "@/hooks/state";
import useQuestion from "@/hooks/useQuestion";
import { Answer } from "@/types";
import { getIdForQuestion } from "@/utils";
import { View } from "react-native";
import AnswerResult from "./AnswerResult";
import { ThemedText } from "./ThemedText";

const QuestionResult = ({
  questionId,
  showQuestionText = true,
}: {
  questionId: string;
  showQuestionText?: boolean;
}) => {
  const question = useQuestion(questionId);
  const answerIdsByQuestionIdx = useAppSelector(selectAnswerIdsByQuestionIdx);
  const questionIds = useAppSelector(selectQuestionIds);

  if (!question) {
    return <ThemedText>No question</ThemedText>;
  }
  if (!questionIds) {
    return <ThemedText>No question IDs</ThemedText>;
  }
  if (!answerIdsByQuestionIdx) {
    return <ThemedText>No random answers</ThemedText>;
  }

  const questionIdx = questionIds.findIndex(
    (id) => id === getIdForQuestion(question)
  );

  const randomAnswerIds = answerIdsByQuestionIdx[questionIdx];
  const randomAnswers: Answer[] = [...question.answers];
  randomAnswers.sort((a, b) => {
    return (
      randomAnswerIds.indexOf(a.internalId) -
      randomAnswerIds.indexOf(b.internalId)
    );
  });

  const explicitCorrectAnswer = question.answers.find(
    (answer) => answer.correct
  );
  const correctAnswer = explicitCorrectAnswer
    ? explicitCorrectAnswer
    : question.answers[0];

  return (
    <>
      {showQuestionText ? (
        <ThemedText style={{ fontWeight: "bold" }}>
          {questionIdx + 1}: {question.question}
        </ThemedText>
      ) : null}
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 5,
        }}
      />
      <View
        style={{
          flexDirection: "column",
          justifyContent: "flex-start",
        }}
      >
        {randomAnswers.map((answer) => (
          <AnswerResult
            key={answer.internalId}
            answer={answer}
            correctAnswer={correctAnswer}
            questionIdx={questionIdx}
          />
        ))}
      </View>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 25,
        }}
      />
    </>
  );
};

export default QuestionResult;
