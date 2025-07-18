import Slider from "@react-native-community/slider";
import { Stack, useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { Checkbox } from "react-native-paper";

import alert from "@/alert";
import Button from "@/components/Button";
import Gap from "@/components/Gap";
import QuestionInput from "@/components/QuestionInput";
import QuestionResult from "@/components/QuestionResult";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  Options,
  configureQuizAction,
  nextQuestionAction,
  prevQuestionAction,
  quitQuizAction,
  resetOptionsAction,
  restartQuizAction,
  selectAnswerIdsByQuestionIdx,
  selectAppState,
  selectCurrentQuestionIdx,
  selectFinalAnswersByQuestionIdx,
  selectOptions,
  selectQuestionIds,
  setOptionsAction,
  startQuizAction,
} from "@/features/quiz/quizSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/state";
import useCurrentQuestion from "@/hooks/useCurrentQuestion";
import useLoadInitialQuestionData from "@/hooks/useLoadInitialQuestionData";
import useQuestionData from "@/hooks/useQuestionData";
import useSelectedNode from "@/hooks/useSelectedNode";
import { AppState, LevelNode } from "@/types";
import { collectQuestions, tallyCorrectAnswers } from "@/utils";
import { Fragment } from "react";

const SelectNodeSubView = () => {
  const [questionData] = useQuestionData();
  const loadInitialQuestionData = useLoadInitialQuestionData(false);
  const [selectedNode, setSelectedNodeId] = useSelectedNode();
  const dispatch = useAppDispatch();
  const configureQuiz = () => dispatch(configureQuizAction());

  if (!questionData || !questionData.children) {
    return (
      <ThemedText>
        You must load some question data to get started{" "}
        <Button title="Load default data" onPress={loadInitialQuestionData} />{" "}
        <EndQuizButton />
      </ThemedText>
    );
  }

  const onPressSelect = () => {
    if (!selectedNode) {
      console.warn("No selected node");
      return;
    }
    setSelectedNodeId(selectedNode.internalId);
    configureQuiz();
  };

  const questionCount = selectedNode
    ? collectQuestions(selectedNode).length
    : 0;

  return (
    <>
      <ThemedText type="title">Choose your questions</ThemedText>
      {selectedNode ? (
        <>
          <View
            style={{ borderBottomColor: "transparent", borderBottomWidth: 25 }}
          />
          <ThemedText type="subtitle">
            Chosen: {selectedNode.name} ({questionCount})
          </ThemedText>
          <View
            style={{ borderBottomColor: "transparent", borderBottomWidth: 25 }}
          />
          <Button
            title={`Continue with ${selectedNode.name}`}
            onPress={onPressSelect}
          />
        </>
      ) : null}
      <View
        style={{ borderBottomColor: "transparent", borderBottomWidth: 25 }}
      />

      {(selectedNode
        ? selectedNode.children
          ? selectedNode.children
          : []
        : questionData.children
      ).map((node) => (
        <NodeItem key={node.internalId} node={node} />
      ))}

      <View
        style={{ borderBottomColor: "transparent", borderBottomWidth: 100 }}
      />
      <EndQuizButton />
    </>
  );
};

const NodeItem = ({ node }: { node: LevelNode }) => {
  const [, setSelectedNodeId] = useSelectedNode();

  const onPressItem = () => setSelectedNodeId(node.internalId);

  return (
    <>
      <ThemedText type="link" onPress={onPressItem}>
        {node.name} ({collectQuestions(node).length})
      </ThemedText>
    </>
  );
};

const Content = () => {
  const appState = useAppSelector(selectAppState);

  switch (appState) {
    case AppState.SelectNode:
      return <SelectNodeSubView />;
    case AppState.Configure:
      return <ConfigureSubView />;
    case AppState.Progress:
      return (
        <>
          <QuizInProgressSubView />
          <View
            style={{
              borderBottomColor: "transparent",
              borderBottomWidth: 100,
            }}
          />
          <EndQuizButton />
        </>
      );
    case AppState.Ended:
      return <QuizEndedSubView />;
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

const ConfigureSubView = () => {
  const dispatch = useAppDispatch();
  const options = useAppSelector(selectOptions);
  const updateOptions = (newOptions: Options) =>
    dispatch(setOptionsAction(newOptions));
  const resetOptions = () => dispatch(resetOptionsAction());
  const [selectedNode] = useSelectedNode();

  if (!selectedNode) {
    return <ThemedText>Waiting for selected node with questions</ThemedText>;
  }

  const updateOption = <K extends keyof Options>(
    name: K,
    value: Options[K]
  ) => {
    updateOptions({
      ...options,
      [name]: value,
    });
  };

  const startQuiz = () => dispatch(startQuizAction());

  const questions = collectQuestions(selectedNode);

  return (
    <>
      <ThemedText type="title">Options</ThemedText>
      <Gap small />
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
      <Gap small />
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
      <Gap small />
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
      <Gap small />
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
      <Gap small />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox
          status={options.freeTextMode ? "checked" : "unchecked"}
          onPress={() => updateOption("freeTextMode", !options.freeTextMode)}
        />
        <ThemedText
          onPress={() => updateOption("freeTextMode", !options.freeTextMode)}
        >
          Type in answers instead
        </ThemedText>
      </View>
      <Gap small />
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Checkbox
          status={options.autoNextQuestionOnAnswer ? "checked" : "unchecked"}
          onPress={() =>
            updateOption(
              "autoNextQuestionOnAnswer",
              !options.autoNextQuestionOnAnswer
            )
          }
        />
        <ThemedText
          onPress={() =>
            updateOption(
              "autoNextQuestionOnAnswer",
              !options.autoNextQuestionOnAnswer
            )
          }
        >
          Automatically go to next question on answer
        </ThemedText>
      </View>
      <Gap small />
      <ThemedText>Number of Questions (default 10):</ThemedText>
      <Slider
        value={options.questionLimit}
        onValueChange={(newVal) => updateOption("questionLimit", newVal)}
        style={{ width: "100%", height: 40 }}
        minimumValue={1}
        step={1}
        maximumValue={questions.length}
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#8ED1FC"
        thumbTintColor="#1EB1FC"
      />
      <ThemedText>
        {options.questionLimit}/{questions.length}
      </ThemedText>
      <Button
        title="Reset Limit"
        onPress={() =>
          updateOption(
            "questionLimit",
            questions.length > 10 ? 10 : questions.length
          )
        }
        type="ghost"
      />
      <Button
        title="Max"
        onPress={() => updateOption("questionLimit", questions.length)}
        type="ghost"
      />
      <Gap />
      <Button title="Start Quiz" onPress={startQuiz} />
      <Button title="Reset Options" onPress={resetOptions} type="ghost" />
      <Gap />
      <EndQuizButton />
    </>
  );
};

const QuizInProgressSubView = () => {
  const dispatch = useAppDispatch();
  const prevQuestion = () => dispatch(prevQuestionAction());
  const nextQuestion = () => dispatch(nextQuestionAction());
  const [selectedNode] = useSelectedNode();
  const question = useCurrentQuestion();
  const questionIds = useAppSelector(selectQuestionIds);
  const answersByQuestionIdx = useAppSelector(selectAnswerIdsByQuestionIdx);
  const selectedAnswerIndexes = useAppSelector(selectFinalAnswersByQuestionIdx);
  const currentQuestionIdx = useAppSelector(selectCurrentQuestionIdx);

  if (!selectedNode) {
    return <ThemedText>Loading node...</ThemedText>;
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
      <Gap />
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

const QuizEndedSubView = () => {
  const dispatch = useAppDispatch();
  const [selectedNode] = useSelectedNode();
  const { push } = useRouter();
  const quitQuiz = () => {
    dispatch(quitQuizAction());
    push("/");
  };
  const restartQuiz = () => dispatch(restartQuizAction());
  const questionIds = useAppSelector(selectQuestionIds);
  const quizState = useAppSelector((state) => state.quiz);

  if (!questionIds) {
    return (
      <ThemedText>
        No question IDs <EndQuizButton />
      </ThemedText>
    );
  }

  if (!selectedNode) {
    return (
      <ThemedText>
        No selected node <EndQuizButton />
      </ThemedText>
    );
  }

  const questions = collectQuestions(selectedNode);

  const correctCount = tallyCorrectAnswers(quizState, questions);

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
      <Gap />
      <ThemedText type="subtitle">
        You scored {correctCount} out of {questionIds.length}
      </ThemedText>
      <Gap />
      <ScrollView style={{ flex: 1, backgroundColor: "transparent" }}>
        {questionIds.map((questionId, idx) => (
          <Fragment key={questionId}>
            {idx !== 0 ? <Gap small /> : null}
            <QuestionResult questionId={questionId} />
          </Fragment>
        ))}
      </ScrollView>
      <Gap large />
      <Button title="Restart Quiz" onPress={confirmRestart} />
      <Gap />
      <Button title="Main Menu" onPress={confirmQuit} />
    </>
  );
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
  const [selectedNode] = useSelectedNode();
  const currentQuestionIdx = useAppSelector(selectCurrentQuestionIdx);

  if (!data) {
    return <ThemedText>Loading question data...</ThemedText>;
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: `Quiz${getBreadcrumbs(
            selectedNode?.name,
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
