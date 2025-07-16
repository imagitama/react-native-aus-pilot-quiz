import {
  selectAnswersByQuestionIdx,
  selectCurrentQuestionIdx,
  selectSelectedAnswerIndexes,
} from "@/features/quiz/quizSlice";
import { useAppSelector } from "@/hooks/state";
import useQuizOptions from "@/hooks/useQuizOptions";
import { Question } from "@/types";
import { getIdForAnswer, getIdForQuestion } from "@/utils";
import { Image } from "expo-image";
import { View } from "react-native";
import AnswerOption from "./AnswerOption";
import QuestionResult from "./QuestionResult";
import ReferenceLikeOutput from "./ReferenceLikeOutput";
import { ThemedText } from "./ThemedText";

const QuestionInput = ({ question }: { question: Question }) => {
  const questionIdx = useAppSelector(selectCurrentQuestionIdx)!;
  const answersByQuestionIdx = useAppSelector(selectAnswersByQuestionIdx)!;
  const selectedAnswerIndexes = useAppSelector(selectSelectedAnswerIndexes)!;

  const options = useQuizOptions();

  const answers = answersByQuestionIdx[questionIdx];

  const answersInOrder = [...question.answers];
  answersInOrder.sort((a, b) => {
    return answers.indexOf(a.answer) - answers.indexOf(b.answer);
  });

  const hasAnswered = selectedAnswerIndexes[questionIdx] !== null;

  return (
    <>
      <ThemedText>
        {questionIdx + 1}: &nbsp;&nbsp;&nbsp;
        {question.question}
      </ThemedText>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 50,
        }}
      />
      {question.imageName ? (
        <>
          <Image />
          <View
            style={{
              borderBottomColor: "white",
              borderBottomWidth: 50,
            }}
          />
        </>
      ) : null}
      <View style={{ flexDirection: "column", justifyContent: "flex-start" }}>
        {answersInOrder.map((answer, idx) => (
          <AnswerOption
            key={getIdForAnswer(answer)}
            questionIdx={questionIdx}
            answer={answer}
            idx={idx}
          />
        ))}
      </View>
      {options.immediatelyShowResult && hasAnswered ? (
        <>
          <View
            style={{
              borderBottomColor: "white",
              borderBottomWidth: 50,
            }}
          />
          <ThemedText type="subtitle">Actual Result</ThemedText>
          <View
            style={{
              borderBottomColor: "white",
              borderBottomWidth: 25,
            }}
          />
          <QuestionResult questionId={getIdForQuestion(question)} />
        </>
      ) : null}
      {question.source ? (
        <>
          <View
            style={{
              borderBottomColor: "white",
              borderBottomWidth: 50,
            }}
          />
          <ThemedText>
            Source: <ReferenceLikeOutput referenceLike={question.source} />
          </ThemedText>
        </>
      ) : null}
    </>
  );
};

export default QuestionInput;
