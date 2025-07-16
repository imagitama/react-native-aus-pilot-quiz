import {
  selectAnswersByQuestionIdx,
  selectQuestionIds,
} from "@/features/quiz/quizSlice";
import { useAppSelector } from "@/hooks/state";
import useQuestion from "@/hooks/useQuestion";
import { getIdForQuestion } from "@/utils";
import { View } from "react-native";
import AnswerResult from "./AnswerResult";
import { ThemedText } from "./ThemedText";

const QuestionResult = ({ questionId }: { questionId: string }) => {
  const question = useQuestion(questionId);
  const answersByQuestionIdx = useAppSelector(selectAnswersByQuestionIdx);
  const questionIds = useAppSelector(selectQuestionIds);

  if (!question) {
    return <ThemedText>No question</ThemedText>;
  }
  if (!questionIds) {
    return <ThemedText>No question IDs</ThemedText>;
  }
  if (!answersByQuestionIdx) {
    return <ThemedText>No random answers</ThemedText>;
  }

  const questionIdx = questionIds.findIndex(
    (id) => id === getIdForQuestion(question)
  );

  const answerIds = answersByQuestionIdx[questionIdx];

  const answers = [...question.answers];
  answers.sort((a, b) => {
    return answerIds.indexOf(a.answer) - answerIds.indexOf(b.answer);
  });

  const explicitCorrectAnswer = question.answers.find(
    (answer) => answer.correct
  );
  const correctAnswer = explicitCorrectAnswer
    ? explicitCorrectAnswer
    : question.answers[0];

  console.debug(`QuestionResult`, { answers, correctAnswer });

  return (
    <>
      <ThemedText style={{ fontWeight: "bold" }}>
        {questionIdx + 1}: {question.question}
      </ThemedText>
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
        {answers.map((answer) => (
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
