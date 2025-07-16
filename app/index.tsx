import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import Button from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import UploadQuestionDataForm from "@/components/UploadQuestionDataForm";
import { clearAction } from "@/features/quiz/quizSlice";
import { useDispatch } from "react-redux";

export default function MainMenu() {
  const router = useRouter();
  const dispatch = useDispatch();
  const clear = () => dispatch(clearAction());

  return (
    <>
      <Stack.Screen
        options={{
          title: `Main Menu`,
        }}
      />
      <ThemedView style={styles.container}>
        <ThemedText type="title">Main Menu</ThemedText>
        <View style={{ height: 50 }} />
        <Button title="Enter Quiz" onPress={() => router.push("/quiz")} />
        <View style={{ height: 100 }} />
        <ThemedText type="subtitle">Upload custom questions</ThemedText>
        <UploadQuestionDataForm />
        <View style={{ height: 100 }} />
        <ThemedText type="subtitle">Advanced</ThemedText>
        <View style={{ height: 25 }} />
        <Button onPress={clear} title="Clear Data" type="ghost" />
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
