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
import DragAndDropAnswerInput from "./DragAndDropAnswerInput";
import FreeTextInput from "./FreeTextInput";
import Gap from "./Gap";
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
  const finalAnswersByQuestionIdx = useAppSelector(
    selectFinalAnswersByQuestionIdx
  )!;
  const [isDragAndDropResultVisible, setIsDragAndDropResultVisible] =
    useState(false);

  const options = useQuizOptions();

  const randomAnswerIds = answerIdsByQuestionIdx[questionIdx];
  const randomAnswers: Answer[] = [...question.answers];
  randomAnswers.sort((a, b) => {
    return (
      randomAnswerIds.indexOf(a.internalId) -
      randomAnswerIds.indexOf(b.internalId)
    );
  });

  const finalAnswer = finalAnswersByQuestionIdx[questionIdx];
  const hasAnswered = finalAnswer !== null;

  const isDragAndDrop = randomAnswers.find(
    (answer) => answer.correctIndex !== undefined
  );

  return (
    <>
      <ThemedText>
        {questionIdx + 1}: &nbsp;&nbsp;&nbsp;
        {question.question}
      </ThemedText>
      <Gap />
      {question.imageName ? (
        <>
          <Image />
          <Gap />
        </>
      ) : null}
      {options.freeTextMode ? (
        <FreeTextInput questionIdx={questionIdx} />
      ) : isDragAndDrop ? (
        <DragAndDropAnswerInput
          questionIdx={questionIdx}
          randomAnswers={randomAnswers}
        />
      ) : (
        <View style={{ flexDirection: "column", justifyContent: "flex-start" }}>
          {randomAnswers.map((answer) => (
            <AnswerOption
              key={getIdForAnswer(answer)}
              questionIdx={questionIdx}
              answer={answer}
            />
          ))}
        </View>
      )}
      {options.allowHints && question.hint ? (
        <>
          <Gap small />
          <HintButton hint={question.hint} />
        </>
      ) : null}
      {options.immediatelyShowResult && hasAnswered ? (
        <>
          <Gap />
          <ThemedText type="subtitle">Actual Result</ThemedText>
          <Gap small />
          {!isDragAndDrop || (isDragAndDrop && isDragAndDropResultVisible) ? (
            <QuestionResult
              questionId={getIdForQuestion(question)}
              showQuestionText={false}
            />
          ) : (
            <Button
              title="Show Result"
              onPress={() => setIsDragAndDropResultVisible(true)}
            />
          )}
        </>
      ) : null}
      {question.source ? (
        <>
          <Gap />
          <ThemedText>
            Source: <ReferenceLikeOutput referenceLike={question.source} />
          </ThemedText>
        </>
      ) : null}
    </>
  );
};

export default QuestionInput;
