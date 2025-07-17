import { AppState, Area, FinalAnswer, Mode, QuestionData } from "@/types";
import {
  getIdForQuestion,
  purgeDuplicateQuestionData,
  shuffleArray,
} from "@/utils";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../../store";

export interface Options {
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  questionLimit: number;
  immediatelyShowResult: boolean;
  allowHints: boolean;
}

const defaultOptions: Options = {
  randomizeQuestions: true,
  randomizeAnswers: true,
  questionLimit: 0,
  immediatelyShowResult: false,
  allowHints: true,
};

export interface QuizState {
  hasAgreedToToS: boolean;
  questionData: QuestionData | null;
  isLoadingQuestionData: boolean;
  currentAppState: AppState;
  selectedMode: Mode | null;
  selectedLevelId: string | null;
  selectedAreaId: string | null;
  questionIds: string[] | null;
  currentQuestionIdx: number | null;
  answerIdsByQuestionIdx: string[][] | null;
  finalAnswersByQuestionIdx: (FinalAnswer | null)[] | null; // depends on random answers
  options: Options;
}

const initialState: QuizState = {
  hasAgreedToToS: false,
  questionData: null,
  isLoadingQuestionData: false,
  currentAppState: AppState.MainMenu,
  selectedMode: null,
  selectedLevelId: null,
  selectedAreaId: null,
  questionIds: null,
  currentQuestionIdx: null,
  answerIdsByQuestionIdx: null,
  finalAnswersByQuestionIdx: null,
  options: defaultOptions,
};

const startQuiz = (state: QuizState) => {
  if (!state.questionData || !state.selectedLevelId || !state.selectedAreaId) {
    throw new Error("Cannot start quiz: missing data");
  }

  const selectedLevel = state.questionData!.levels.find(
    (level) => level.name === state.selectedLevelId
  );

  const selectedArea = selectedLevel?.areas.find(
    (area) => area.name === state.selectedAreaId
  );

  if (!selectedLevel || !selectedArea) {
    throw new Error("Cannot start quiz: no selected level or area");
  }

  const limit = state.options.questionLimit;

  let questionsToAsk = state.options.randomizeQuestions
    ? shuffleArray(selectedArea.questions)
    : [...selectedArea.questions];

  questionsToAsk = questionsToAsk.slice(0, limit);

  console.debug(`starting quiz for area "${selectedArea.name}" with questions:
  ${questionsToAsk.map((question) => question.question).join("\n")}`);

  state.questionIds = questionsToAsk.map((question) =>
    getIdForQuestion(question)
  );

  state.answerIdsByQuestionIdx = questionsToAsk.map((question) =>
    (state.options.randomizeAnswers
      ? shuffleArray(question.answers)
      : [...question.answers]
    ).map((answer) => answer.internalId)
  );

  state.finalAnswersByQuestionIdx = state.questionIds.map((id) => null);
  state.currentQuestionIdx = 0;

  state.currentAppState = AppState.Progress;
};

export const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    storeQuestionData: (state, action: PayloadAction<QuestionData>) => {
      const purgedData = purgeDuplicateQuestionData(action.payload);

      console.log("storeQuestionData", {
        old: action.payload,
        new: purgedData,
      });

      state.questionData = purgedData;
    },
    setSelectedLevelId: (
      state,
      action: PayloadAction<QuizState["selectedLevelId"]>
    ) => {
      state.selectedLevelId = action.payload;
    },
    setSelectedAreaId: (state, action: PayloadAction<string>) => {
      const areaId = action.payload;

      if (!state.questionData || !state.questionData) {
        throw new Error("Need question data");
      }

      let area;

      for (const level of state.questionData?.levels) {
        area = level.areas.find((area) => area.name === areaId);
      }

      if (!area) {
        throw new Error(`Cannot select area with ID "${areaId}": not found`);
      }

      state.options.questionLimit =
        area.questions.length > 10 ? 10 : area.questions.length;

      state.selectedAreaId = areaId;
    },
    nextQuestion: (state) => {
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
            ? finalAnswer && finalAnswer.answerId === answerIdToToggle
              ? null
              : {
                  answerId: answerIdToToggle,
                }
            : finalAnswer
      );
    },
    startQuiz: (state, action: PayloadAction<Area>) => {
      console.log("startQuiz");
      startQuiz(state);
    },
    restartQuiz: (state) => {
      console.log("restartQuiz");
      startQuiz(state);
    },
    quitQuiz: (state) => {
      console.log("quitQuiz");

      state.selectedMode = null;
      state.selectedLevelId = null;
      state.selectedAreaId = null;
      state.questionIds = null;
      state.currentQuestionIdx = null;
      state.answerIdsByQuestionIdx = null;
      state.finalAnswersByQuestionIdx = null;

      state.currentAppState = AppState.MainMenu;
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
  },
});

export const {
  storeQuestionData: storeQuestionDataAction,
  setSelectedLevelId: setSelectedLevelIdAction,
  setSelectedAreaId: setSelectedAreaIdAction,
  toggleFinalAnswerId: toggleFinalAnswerIdAction,
  nextQuestion: nextQuestionAction,
  prevQuestion: prevQuestionAction,
  startQuiz: startQuizAction,
  restartQuiz: restartQuizAction,
  quitQuiz: quitQuizAction,
  setOptions: setOptionsAction,
  clear: clearAction,
  setIsLoadingQuestionData: setIsLoadingQuestionDataAction,
  agreeToToS: agreeToToSAction,
} = quizSlice.actions;

export const selectQuestionData = (state: RootState) => state.quiz.questionData;
export const selectIsLoadingQuestionData = (state: RootState) =>
  state.quiz.isLoadingQuestionData;
export const selectAppState = (state: RootState) => state.quiz.currentAppState;
export const selectSelectedMode = (state: RootState) => state.quiz.selectedMode;
export const selectSelectedLevelId = (state: RootState) =>
  state.quiz.selectedLevelId;
export const selectSelectedAreaId = (state: RootState) =>
  state.quiz.selectedAreaId;
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
