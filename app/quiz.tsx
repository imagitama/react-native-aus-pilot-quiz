import Slider from "@react-native-community/slider";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Checkbox } from "react-native-paper";

import alert from "@/alert";
import Button from "@/components/Button";
import QuestionInput from "@/components/QuestionInput";
import QuestionResult from "@/components/QuestionResult";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  Options,
  nextQuestionAction,
  prevQuestionAction,
  quitQuizAction,
  restartQuizAction,
  selectAnswerIdsByQuestionIdx,
  selectAppState,
  selectCurrentQuestionIdx,
  selectFinalAnswersByQuestionIdx,
  selectOptions,
  selectQuestionIds,
  selectSelectedAreaId,
  selectSelectedLevelId,
  setOptionsAction,
  setSelectedAreaIdAction,
  setSelectedLevelIdAction,
  startQuizAction,
} from "@/features/quiz/quizSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/state";
import useArea from "@/hooks/useArea";
import useCurrentQuestion from "@/hooks/useCurrentQuestion";
import useLevel from "@/hooks/useLevel";
import useLoadInitialQuestionData from "@/hooks/useLoadInitialQuestionData";
import useQuestionData from "@/hooks/useQuestionData";
import { AppState } from "@/types";
import { tallyCorrectAnswers } from "@/utils";
import { useEffect } from "react";

const SelectLevelView = () => {
  const dispatch = useAppDispatch();
  const setSelectedLevelId = (id: string) =>
    dispatch(setSelectedLevelIdAction(id));
  const [questionData] = useQuestionData();
  const loadInitialQuestionData = useLoadInitialQuestionData(false);

  if (!questionData) {
    return (
      <ThemedText>
        You must load some question data to get started{" "}
        <Button title="Load default data" onPress={loadInitialQuestionData} />
      </ThemedText>
    );
  }

  return (
    <>
      <ThemedText type="title">Choose your study level</ThemedText>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 25,
        }}
      />
      {questionData.levels.map((level) => (
        <ThemedText
          key={level.name}
          type="link"
          onPress={() => setSelectedLevelId(level.name)}
        >
          {level.name} ({level.areas.length} areas)
        </ThemedText>
      ))}
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 100,
        }}
      />
      <EndQuizButton />
    </>
  );
};

const SelectAreaView = () => {
  const dispatch = useAppDispatch();
  const setSelectedAreaId = (id: string) =>
    dispatch(setSelectedAreaIdAction(id));
  const level = useLevel();

  if (!level) {
    return <ThemedText>Loading level...</ThemedText>;
  }

  return (
    <>
      <ThemedText type="title">Choose your area</ThemedText>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 25,
        }}
      />
      {level.areas.map((area) => (
        <ThemedText
          key={area.name}
          type="link"
          onPress={() => setSelectedAreaId(area.name)}
        >
          {area.name} ({area.questions.length} questions)
        </ThemedText>
      ))}
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 100,
        }}
      />
      <EndQuizButton />
    </>
  );
};

const QuizView = () => {
  const appState = useAppSelector(selectAppState);

  switch (appState) {
    case AppState.MainMenu:
      return <ConfigureQuizView />;
    case AppState.Progress:
      return (
        <>
          <QuizInProgressView />
          <View
            style={{
              borderBottomColor: "white",
              borderBottomWidth: 100,
            }}
          />
          <EndQuizButton />
        </>
      );
    case AppState.Ended:
      return <QuizEndedView />;
    default:
      return <ThemedText>Unknown app state {appState}</ThemedText>;
  }
};

const EndQuizButton = () => {
  const dispatch = useAppDispatch();
  const { push } = useRouter();
  const quitQuiz = () => {
    dispatch(quitQuizAction());
    push("/");
  };

  const confirmEndQuiz = () => {
    alert(
      "Are you sure you want to end the current quiz?",
      "You will lose any saved progress or results",
      [
        { text: "Cancel", style: "cancel" },
        { text: "End Quiz", style: "destructive", onPress: quitQuiz },
      ],
      { cancelable: true }
    );
  };

  return <Button title="End Quiz" onPress={confirmEndQuiz} type="ghost" />;
};

const ConfigureQuizView = () => {
  const dispatch = useAppDispatch();
  const area = useArea();
  const options = useAppSelector(selectOptions);
  const updateOptions = (newOptions: Options) =>
    dispatch(setOptionsAction(newOptions));

  const updateOption = <K extends keyof Options>(
    name: K,
    value: Options[K]
  ) => {
    updateOptions({
      ...options,
      [name]: value,
    });
  };

  if (!area) {
    return <Text>Loading area...</Text>;
  }

  const startQuiz = () => dispatch(startQuizAction(area));

  return (
    <>
      <ThemedText type="title">Options</ThemedText>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 25,
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox
          status={options.randomizeQuestions ? "checked" : "unchecked"}
          onPress={() =>
            updateOption("randomizeQuestions", !options.randomizeQuestions)
          }
        />
        <ThemedText
          onPress={() =>
            updateOption("randomizeQuestions", !options.randomizeQuestions)
          }
        >
          Randomise questions (recommended)
        </ThemedText>
      </View>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 25,
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox
          status={options.randomizeAnswers ? "checked" : "unchecked"}
          onPress={() =>
            updateOption("randomizeAnswers", !options.randomizeAnswers)
          }
        />
        <ThemedText
          onPress={() =>
            updateOption("randomizeAnswers", !options.randomizeAnswers)
          }
        >
          Randomise answers (recommended)
        </ThemedText>
      </View>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 25,
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox
          status={options.immediatelyShowResult ? "checked" : "unchecked"}
          onPress={() =>
            updateOption(
              "immediatelyShowResult",
              !options.immediatelyShowResult
            )
          }
        />
        <ThemedText
          onPress={() =>
            updateOption(
              "immediatelyShowResult",
              !options.immediatelyShowResult
            )
          }
        >
          Immediately show answers
        </ThemedText>
      </View>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 25,
        }}
      />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox
          status={options.allowHints ? "checked" : "unchecked"}
          onPress={() => updateOption("allowHints", !options.allowHints)}
        />
        <ThemedText
          onPress={() => updateOption("allowHints", !options.allowHints)}
        >
          Allow hints
        </ThemedText>
      </View>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 25,
        }}
      />
      <ThemedText>Number of Questions (default 10):</ThemedText>
      <Slider
        value={options.questionLimit}
        onValueChange={(newVal) => updateOption("questionLimit", newVal)}
        style={{ width: "100%", height: 40 }}
        minimumValue={1}
        step={1}
        maximumValue={area.questions.length}
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#8ED1FC"
        thumbTintColor="#1EB1FC"
      />
      <ThemedText>
        {options.questionLimit}/{area.questions.length}
      </ThemedText>
      <Button
        title="Reset Limit"
        onPress={() =>
          updateOption(
            "questionLimit",
            area.questions.length > 10 ? 10 : area.questions.length
          )
        }
        type="ghost"
      />
      <Button
        title="Max"
        onPress={() => updateOption("questionLimit", area.questions.length)}
        type="ghost"
      />
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 25,
        }}
      />
      <Button title="Start Quiz" onPress={startQuiz} />
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 5,
        }}
      />
      <EndQuizButton />
    </>
  );
};

const QuizInProgressView = () => {
  const dispatch = useAppDispatch();
  const prevQuestion = () => dispatch(prevQuestionAction());
  const nextQuestion = () => dispatch(nextQuestionAction());
  const area = useArea();
  const startQuiz = () => dispatch(startQuizAction(area!));
  const question = useCurrentQuestion();
  const questionIds = useAppSelector(selectQuestionIds);
  const answersByQuestionIdx = useAppSelector(selectAnswerIdsByQuestionIdx);
  const selectedAnswerIndexes = useAppSelector(selectFinalAnswersByQuestionIdx);
  const currentQuestionIdx = useAppSelector(selectCurrentQuestionIdx);

  useEffect(() => {
    if (!area || !area.questions.length) {
      return;
    }

    startQuiz();
  }, [area !== null]);

  if (!area) {
    return <ThemedText>Loading area...</ThemedText>;
  }
  if (!area.questions.length) {
    return <ThemedText>Area has no questions</ThemedText>;
  }
  if (!question) {
    return <ThemedText>Loading question...</ThemedText>;
  }
  if (!questionIds) {
    return <ThemedText>Loading question IDs...</ThemedText>;
  }
  if (currentQuestionIdx === null) {
    return <ThemedText>Loading current questions...</ThemedText>;
  }
  if (!answersByQuestionIdx) {
    return <ThemedText>Loading answers...</ThemedText>;
  }
  if (!selectedAnswerIndexes) {
    return <ThemedText>Loading selected answers...</ThemedText>;
  }

  const randomAnswers = answersByQuestionIdx[currentQuestionIdx];

  const answersInOrder = [...question.answers];
  answersInOrder.sort((a, b) => {
    return randomAnswers.indexOf(a.answer) - randomAnswers.indexOf(b.answer);
  });

  const isLastQuestion = currentQuestionIdx === questionIds.length - 1;
  const canFinish =
    selectedAnswerIndexes.find((selectedAnswer) => selectedAnswer === null) ===
    undefined;

  return (
    <>
      <QuestionInput question={question} />
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 50,
        }}
      />
      <View style={{ flexDirection: "row" }}>
        <Button
          title="Back"
          onPress={prevQuestion}
          disabled={currentQuestionIdx === 0}
        />
        <Button
          title={isLastQuestion ? "Finish" : "Next"}
          onPress={nextQuestion}
          disabled={isLastQuestion && !canFinish}
        />
      </View>
    </>
  );
};

const QuizEndedView = () => {
  const dispatch = useAppDispatch();
  const area = useArea();
  const quitQuiz = () => dispatch(quitQuizAction());
  const restartQuiz = () => dispatch(restartQuizAction());
  const questionIds = useAppSelector(selectQuestionIds);
  const quizState = useAppSelector((state) => state.quiz);

  if (!questionIds) {
    return <ThemedText>No question IDs</ThemedText>;
  }

  if (!area) {
    return <ThemedText>No area</ThemedText>;
  }

  const correctCount = tallyCorrectAnswers(quizState, area.questions);

  const confirmRestart = () => {
    alert(
      "Are you sure?",
      "This will clear your current quiz results",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Restart", style: "destructive", onPress: restartQuiz },
      ],
      { cancelable: true }
    );
  };
  const confirmQuit = () => {
    alert(
      "Are you sure?",
      "You cannot return to your quiz results",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Quit", style: "destructive", onPress: quitQuiz },
      ],
      { cancelable: true }
    );
  };

  return (
    <>
      <ThemedText type="title">Quiz Complete</ThemedText>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 50,
        }}
      />
      <ThemedText type="subtitle">
        You scored {correctCount} out of {questionIds.length}
      </ThemedText>
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 50,
        }}
      />
      {questionIds.map((questionId) => (
        <QuestionResult key={questionId} questionId={questionId} />
      ))}
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 75,
        }}
      />
      <Button title="Restart Quiz" onPress={confirmRestart} />
      <View
        style={{
          borderBottomColor: "white",
          borderBottomWidth: 50,
        }}
      />
      <Button title="Main Menu" onPress={confirmQuit} />
    </>
  );
};

const Content = () => {
  const selectedLevelId = useAppSelector(selectSelectedLevelId);
  const selectedAreaId = useAppSelector(selectSelectedAreaId);

  if (!selectedLevelId) {
    return <SelectLevelView />;
  }

  if (!selectedAreaId) {
    return <SelectAreaView />;
  }

  return <QuizView />;
};

const getBreadcrumbs = (...items: (string | undefined)[]): string => {
  let str = "";

  for (const item of items) {
    if (item === undefined) {
      break;
    } else {
      str += ` / ${item}`;
    }
  }

  return str;
};

export default function Quiz() {
  const data = useQuestionData();
  const level = useLevel();
  const area = useArea();
  const currentQuestionIdx = useAppSelector(selectCurrentQuestionIdx);

  if (!data) {
    return <ThemedText>Loading question data...</ThemedText>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Quiz${getBreadcrumbs(
            level?.name,
            area?.name,
            currentQuestionIdx !== null
              ? `Question ${currentQuestionIdx + 1}`
              : undefined
          )}`,
        }}
      />
      <ThemedView style={styles.container}>
        <Content />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  button: {
    backgroundColor: "#ddd",
    padding: 12,
    borderRadius: 8,
  },
  buttonSelected: {
    backgroundColor: "#4CAF50",
  },
  text: {
    color: "#000",
    textAlign: "center",
  },
  textSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
});
