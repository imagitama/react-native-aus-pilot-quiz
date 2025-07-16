import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { Provider } from "react-redux";
import { store } from "../store";

import Button from "@/components/Button";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import useLoadInitialQuestionData from "@/hooks/useLoadInitialQuestionData";
import useToS from "@/hooks/useToS";
import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";

const Content = () => {
  useLoadInitialQuestionData();
  const [hasAgreedToToS, agreeToToS] = useToS();

  if (!hasAgreedToToS) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>
          By pressing the button below you understand this app is a guide only.
          It may be wrong. Use at your own risk. Always refer to current
          documentation.
        </ThemedText>
        <Button title="I understand" onPress={agreeToToS} />
      </ThemedView>
    );
  }
  return (
    <>
      <Stack>
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return <Text>Loading...</Text>;
  }

  return (
    <Provider store={store}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Content />
      </ThemeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
