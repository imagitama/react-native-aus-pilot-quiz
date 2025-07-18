import { AppState, FinalAnswer, LevelNode, Mode, QuestionData } from "@/types";
import {
  collectQuestions,
  findNodeById,
  getIdForQuestion,
  shuffleArray,
  slugify,
} from "@/utils";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface Options {
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  questionLimit: number;
  immediatelyShowResult: boolean;
  allowHints: boolean;
  freeTextMode: boolean;
  autoNextQuestionOnAnswer: boolean;
}

const defaultOptions: Options = {
  randomizeQuestions: true,
  randomizeAnswers: true,
  questionLimit: 0,
  immediatelyShowResult: false,
  allowHints: true,
  freeTextMode: false,
  autoNextQuestionOnAnswer: false,
};

export interface QuizState {
  hasAgreedToToS: boolean;
  questionData: QuestionData | null;
  isLoadingQuestionData: boolean;
  currentAppState: AppState;
  selectedMode: Mode | null;
  selectedNodeId: string | null;
  questionIds: string[] | null;
  currentQuestionIdx: number | null;
  answerIdsByQuestionIdx: string[][] | null;
  finalAnswersByQuestionIdx: (FinalAnswer | null)[] | null;
  options: Options;
}

const initialState: QuizState = {
  hasAgreedToToS: false,
  questionData: null,
  isLoadingQuestionData: false,
  currentAppState: AppState.MainMenu,
  selectedMode: null,
  selectedNodeId: null,
  questionIds: null,
  currentQuestionIdx: null,
  answerIdsByQuestionIdx: null,
  finalAnswersByQuestionIdx: null,
  options: defaultOptions,
};

const nextQuestion = (state: QuizState) => {
  if (!state.questionIds) {
    throw new Error("Cannot go to next question without question IDs");
  }
  const currentIdx = state.currentQuestionIdx;

  if (currentIdx === null) {
    throw new Error("Cannot go to next question without a current idx");
  }

  if (!state.finalAnswersByQuestionIdx) {
    throw new Error("Cannot go to next question with empty answers");
  }

  const nextIdx = currentIdx + 1;

  console.debug("nextQuestion", {
    indexes: state.finalAnswersByQuestionIdx,
    nextIdx,
  });

  if (nextIdx === state.questionIds.length) {
    console.debug(
      `ending quiz because next index (${nextIdx}) equals total (${state.questionIds.length})`
    );

    if (
      state.finalAnswersByQuestionIdx.find(
        (selectedAnswer) => selectedAnswer === null
      ) !== undefined
    ) {
      // TODO: output to user as can easily forget
      console.warn("cannot end as at least one question has no answer");
      return;
    }

    state.currentAppState = AppState.Ended;
    return;
  }

  state.currentQuestionIdx = nextIdx;
};

const startQuiz = (state: QuizState) => {
  if (!state.questionData || !state.selectedNodeId) {
    throw new Error("Cannot start quiz: missing data");
  }

  const selectedNode = findNodeById(
    state.questionData.children,
    state.selectedNodeId
  );

  if (!selectedNode) {
    throw new Error("Cannot start quiz: no selected node");
  }

  const questions = collectQuestions(selectedNode);

  const limit = state.options.questionLimit;

  let questionsToAsk = state.options.randomizeQuestions
    ? shuffleArray(questions)
    : [...questions];

  questionsToAsk = questionsToAsk.slice(0, limit);

  state.questionIds = questionsToAsk.map((question) =>
    getIdForQuestion(question)
  );

  state.answerIdsByQuestionIdx = questionsToAsk.map((question) =>
    (state.options.randomizeAnswers
      ? shuffleArray(question.answers)
      : [...question.answers]
    ).map((answer) => answer.internalId)
  );

  console.debug(`starting quiz for node "${selectedNode.name}" with questions:
\t${questionsToAsk.map((question) => question.question).join("\n\t")}
answers by idx:
\t${state.answerIdsByQuestionIdx.map((answerIds, questionIdx) => `${questionIdx}: ${answerIds.join(",")}`).join("\n\n\t")}`);

  state.finalAnswersByQuestionIdx = state.questionIds.map((id) => null);
  state.currentQuestionIdx = 0;

  state.currentAppState = AppState.Progress;
};

const addInternalIds = (questionData: QuestionData): QuestionData => {
  return {
    ...questionData,
    children: questionData.children.map(addInternalIdsToNode),
  };
};

const addInternalIdsToNode = (node: LevelNode): LevelNode => {
  const internalId = slugify(node.name);

  return {
    ...node,
    internalId,
    children: node.children
      ? node.children.map(addInternalIdsToNode)
      : undefined,
    questions: node.questions
      ? node.questions.map((q) => ({
          ...q,
          internalId: slugify(q.question),
          answers: q.answers
            ? q.answers.map((a) => ({ ...a, internalId: slugify(a.answer) }))
            : [],
        }))
      : undefined,
  };
};

export const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    storeQuestionData: (state, action: PayloadAction<QuestionData>) => {
      const newQuestionData = addInternalIds(action.payload);

      console.log("storeQuestionData", {
        old: newQuestionData,
      });

      state.questionData = newQuestionData;
    },
    setSelectedNodeId: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;

      if (!state.questionData) {
        throw new Error("Need question data");
      }

      const node = findNodeById(state.questionData.children, nodeId);

      if (!node) {
        throw new Error(`Cannot select node with ID "${nodeId}": not found`);
      }

      const allQuestions = collectQuestions(node);

      state.options.questionLimit =
        allQuestions.length > 10 ? 10 : allQuestions.length;

      state.selectedNodeId = nodeId;
    },

    nextQuestion: (state) => {
      nextQuestion(state);
    },
    prevQuestion: (state) => {
      if (!state.questionIds) {
        throw new Error("Cannot go to prev question without question IDs");
      }
      const currentIdx = state.currentQuestionIdx;

      if (currentIdx === null) {
        throw new Error("Cannot go to prev question without a current idx");
      }

      const prevIdx = currentIdx - 1;

      console.debug("prevQuestion", { prevIdx });

      if (prevIdx < 0) {
        console.debug(`cannot go back as it will be less than 0`);
        return;
      }

      state.currentQuestionIdx = prevIdx;
    },
    toggleFinalAnswerId: (state, action: PayloadAction<string>) => {
      const answerIdToToggle = action.payload;

      const currentQuestionIdx = state.currentQuestionIdx;

      if (currentQuestionIdx === null) {
        throw new Error("Cannot toggle answer without current question idx");
      }
      if (!state.finalAnswersByQuestionIdx) {
        throw new Error("Cannot toggle answer with indexes being empty");
      }

      console.debug(`toggleFinalAnswerId`, {
        questionIdx: currentQuestionIdx,
        answerId: answerIdToToggle,
      });

      state.finalAnswersByQuestionIdx = state.finalAnswersByQuestionIdx.map(
        (finalAnswer, questionIdx) =>
          questionIdx === currentQuestionIdx
            ? finalAnswer &&
              "answerId" in finalAnswer &&
              finalAnswer.answerId === answerIdToToggle
              ? null
              : {
                  answerId: answerIdToToggle,
                }
            : finalAnswer
      );

      if (state.options.autoNextQuestionOnAnswer) {
        nextQuestion(state);
      }
    },
    goToSelectNode: (state) => {
      console.log("goToSelectNode");
      state.currentAppState = AppState.SelectNode;
    },
    configureQuiz: (state) => {
      console.log("configureQuiz");
      state.currentAppState = AppState.Configure;
    },
    startQuiz: (state) => {
      console.log("startQuiz");
      startQuiz(state);
    },
    restartQuiz: (state) => {
      console.log("restartQuiz");
      startQuiz(state);
    },
    resetOptions: (state) => {
      console.log("resetOptions");

      const selectedNode = state.selectedNodeId
        ? findNodeById(state.questionData?.children || [], state.selectedNodeId)
        : null;
      const questionLimit = selectedNode
        ? collectQuestions(selectedNode).length
        : defaultOptions.questionLimit;

      state.options = {
        ...defaultOptions,
        questionLimit,
      };
    },
    quitQuiz: (state) => {
      console.log("quitQuiz");

      state.selectedMode = null;
      state.selectedNodeId = null;
      state.questionIds = null;
      state.currentQuestionIdx = null;
      state.answerIdsByQuestionIdx = null;
      state.finalAnswersByQuestionIdx = null;

      state.currentAppState = AppState.SelectNode;
    },
    setOptions: (state, action: PayloadAction<Options>) => {
      const newOptions = action.payload;

      console.debug(`setOptions`, { newOptions });

      state.options = newOptions;
    },
    clear: () => initialState,
    setIsLoadingQuestionData: (state, action: PayloadAction<boolean>) => {
      state.isLoadingQuestionData = action.payload;
    },
    agreeToToS: (state) => {
      state.hasAgreedToToS = true;
    },
    setFinalAnswer: (
      state,
      action: PayloadAction<[number, FinalAnswer | null]>
    ) => {
      const [questionIdx, newFinalAnswer] = action.payload;

      if (!state.finalAnswersByQuestionIdx) {
        throw new Error(
          "Cannot set final answer without something to store into"
        );
      }

      console.debug(`setFinalAnswer`, { questionIdx, newFinalAnswer });

      state.finalAnswersByQuestionIdx[questionIdx] = newFinalAnswer;
    },
  },
});

export const {
  storeQuestionData: storeQuestionDataAction,
  setSelectedNodeId: setSelectedNodeIdAction,
  toggleFinalAnswerId: toggleFinalAnswerIdAction,
  nextQuestion: nextQuestionAction,
  prevQuestion: prevQuestionAction,
  goToSelectNode: goToSelectNodeAction,
  configureQuiz: configureQuizAction,
  startQuiz: startQuizAction,
  restartQuiz: restartQuizAction,
  quitQuiz: quitQuizAction,
  setOptions: setOptionsAction,
  clear: clearAction,
  setIsLoadingQuestionData: setIsLoadingQuestionDataAction,
  agreeToToS: agreeToToSAction,
  setFinalAnswer: setFinalAnswerAction,
  resetOptions: resetOptionsAction,
} = quizSlice.actions;

export const selectQuestionData = (state: RootState) => state.quiz.questionData;
export const selectIsLoadingQuestionData = (state: RootState) =>
  state.quiz.isLoadingQuestionData;
export const selectAppState = (state: RootState) => state.quiz.currentAppState;
export const selectSelectedMode = (state: RootState) => state.quiz.selectedMode;
export const selectSelectedNodeId = (state: RootState) =>
  state.quiz.selectedNodeId;
export const selectCurrentQuestionIdx = (state: RootState) =>
  state.quiz.currentQuestionIdx;
export const selectFinalAnswersByQuestionIdx = (state: RootState) =>
  state.quiz.finalAnswersByQuestionIdx;
export const selectQuestionIds = (state: RootState) => state.quiz.questionIds;
export const selectAnswerIdsByQuestionIdx = (state: RootState) =>
  state.quiz.answerIdsByQuestionIdx;
export const selectOptions = (state: RootState) => state.quiz.options;
export const selectHasAgreedToToS = (state: RootState) =>
  state.quiz.hasAgreedToToS;

export default quizSlice.reducer;
