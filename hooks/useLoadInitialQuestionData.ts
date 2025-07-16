import { JSON_FILE_NAME, ensureDefaultJsonExists } from "@/docs";
import { storeQuestionDataAction } from "@/features/quiz/quizSlice";
import { QuestionData } from "@/types";
import { useEffect } from "react";
import { Platform } from "react-native";
import { useAppDispatch } from "./state";

const useLoadInitialQuestionData = () => {
  const dispatch = useAppDispatch();
  const storeQuestionData = (newData: QuestionData) =>
    dispatch(storeQuestionDataAction(newData));

  useEffect(() => {
    console.debug("useLoadInitialQuestionData");

    (async () => {
      try {
        console.debug("Loading question data...");

        let newData;

        if (Platform.OS === "web") {
          newData = require("@/assets/questions/" + JSON_FILE_NAME);
        } else {
          newData = await ensureDefaultJsonExists<QuestionData>();
        }

        console.log("Got new question data, storing...");

        storeQuestionData(newData);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);
};

export default useLoadInitialQuestionData;
