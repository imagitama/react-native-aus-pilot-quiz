import { ensureDefaultJsonExists } from "@/docs";
import { storeQuestionDataAction } from "@/features/quiz/quizSlice";
import { QuestionData } from "@/types";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useAppDispatch } from "./state";

const useLoadInitialQuestionData = (autoload = true) => {
  const dispatch = useAppDispatch();
  const storeQuestionData = (newData: QuestionData) =>
    dispatch(storeQuestionDataAction(newData));

  const loadInitialQuestionData = async () => {
    try {
      console.debug("Loading question data...");

      let newData;

      if (Platform.OS === "web") {
        newData = require("@/assets/questions/empty-questions.json");
      } else {
        newData = await ensureDefaultJsonExists<QuestionData>();
      }

      console.log("Got new question data, storing...");

      storeQuestionData(newData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (autoload) {
      loadInitialQuestionData();
    }
  }, [autoload]);

  return loadInitialQuestionData;
};

export default useLoadInitialQuestionData;
