import { Asset } from "expo-asset";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

export async function pickJsonFile<T>(): Promise<T | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return null;
  }

  if (!result.assets.length) {
    throw new Error(`Assets length ${result.assets.length}`);
  }

  const content = await FileSystem.readAsStringAsync(result.assets[0].uri);
  return JSON.parse(content);
}

export const JSON_FILE_NAME = "empty-questions.json";
const DEFAULT_JSON_PATH = FileSystem.documentDirectory + JSON_FILE_NAME;

export async function ensureDefaultJsonExists<T>(): Promise<T> {
  const fileInfo = await FileSystem.getInfoAsync(DEFAULT_JSON_PATH);

  if (!fileInfo.exists) {
    await FileSystem.copyAsync({
      from: Asset.fromModule(require("./assets/questions/empty-questions.json"))
        .uri,
      to: DEFAULT_JSON_PATH,
    });
  }

  const content = await FileSystem.readAsStringAsync(DEFAULT_JSON_PATH);
  return JSON.parse(content);
}
