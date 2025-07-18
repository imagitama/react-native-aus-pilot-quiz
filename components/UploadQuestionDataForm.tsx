import { pickJsonFile } from "@/docs";
import useQuestionData from "@/hooks/useQuestionData";
import { LevelNode, QuestionData } from "@/types";
import { collectQuestions } from "@/utils";
import { useState } from "react";
import { Platform } from "react-native";
import Button from "./Button";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";
import WebFilePicker from "./WebFilePicker";

enum ErrorCode {
  NO_LEVELS = "NO_LEVELS",
  NO_AREAS = "NO_AREAS",
  NO_QUESTIONS = "NO_QUESTIONS",
}

const UploadQuestionDataForm = () => {
  const [errorCode, setErrorCode] = useState<null | ErrorCode>(null);
  const [newQuestionData, setNewQuestionData] = useState<null | QuestionData>(
    null
  );
  const [, storeQuestionData] = useQuestionData();

  const onImport = () => {
    if (!newQuestionData) {
      return;
    }
    storeQuestionData(newQuestionData);
    setNewQuestionData(null);
  };

  const onNewJson = (json: any) => {
    if (!json.children) {
      setErrorCode(ErrorCode.NO_LEVELS);
      return;
    }

    // TODO: More verification

    setNewQuestionData(json);
  };

  const onSelect = async () => {
    try {
      console.log("Picking a JSON file...");

      const newData = await pickJsonFile<QuestionData>();

      if (!newData) {
        console.log("User cancelled");
        return;
      }

      console.log("Pick success");

      onNewJson(newData);
    } catch (err) {
      console.error(err);
    }
  };

  if (errorCode !== null) {
    return (
      <ThemedView>
        <ThemedText style={{ color: "red" }}>
          Failed to import: {errorCode}
        </ThemedText>
        <Button title="Restart" onPress={() => setErrorCode(null)} />
      </ThemedView>
    );
  }

  if (newQuestionData) {
    return (
      <ThemedView>
        <ThemedText>
          Detected {collectQuestions(newQuestionData as LevelNode).length}{" "}
          questions
        </ThemedText>
        <Button title="Import Quiz" onPress={onImport} />
      </ThemedView>
    );
  }

  return (
    <ThemedView>
      <ThemedText style={{ marginTop: 25, marginBottom: 25 }}>
        Select a new JSON file:
      </ThemedText>
      {Platform.OS === "web" ? (
        <WebFilePicker<QuestionData> onData={onNewJson} />
      ) : (
        <Button title="Select" onPress={onSelect} />
      )}
    </ThemedView>
  );
};

export default UploadQuestionDataForm;
