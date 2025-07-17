import {
  selectAnswerIdsByQuestionIdx,
  selectCurrentQuestionIdx,
  selectFinalAnswersByQuestionIdx,
} from "@/features/quiz/quizSlice";
import { useAppSelector } from "@/hooks/state";
import useQuizOptions from "@/hooks/useQuizOptions";
import { Answer, Question } from "@/types";
import { getIdForAnswer, getIdForQuestion } from "@/utils";
import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";
import AnswerOption from "./AnswerOption";
import Button from "./Button";
import QuestionResult from "./QuestionResult";
import ReferenceLikeOutput from "./ReferenceLikeOutput";
import { ThemedText } from "./ThemedText";

const HintButton = ({ hint }: { hint: string }) => {
  const [isVisible, setIsVisible] = useState(false);

  if (isVisible) {
    return (
      <ThemedText style={{ fontStyle: "italic" }}>Hint: {hint}</ThemedText>
    );
  }

  return (
    <Button onPress={() => setIsVisible(true)} title="Show Hint" type="ghost" />
  );
};

const QuestionInput = ({ question }: { question: Question }) => {
  const questionIdx = useAppSelector(selectCurrentQuestionIdx)!;
  const answerIdsByQuestionIdx = useAppSelector(selectAnswerIdsByQuestionIdx)!;
  const selectedAnswerIndexes = useAppSelector(
    selectFinalAnswersByQuestionIdx
  )!;

  const options = useQuizOptions();

  const randomAnswerIds = answerIdsByQuestionIdx[questionIdx];
  const randomAnswers: Answer[] = [...question.answers];
  randomAnswers.sort((a, b) => {
    return (
      randomAnswerIds.indexOf(a.internalId) -
      randomAnswerIds.indexOf(b.internalId)
    );
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
        {randomAnswers.map((answer) => (
          <AnswerOption
            key={getIdForAnswer(answer)}
            questionIdx={questionIdx}
            answer={answer}
          />
        ))}
      </View>
      {options.allowHints && question.hint ? (
        <>
          <View
            style={{
              borderBottomColor: "white",
              borderBottomWidth: 25,
            }}
          />
          <HintButton hint={question.hint} />
        </>
      ) : null}
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
          <QuestionResult
            questionId={getIdForQuestion(question)}
            showQuestionText={false}
          />
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
