import { Alert, Platform } from "react-native";

const alertPolyfill = (
  title: string,
  description?: string,
  options?: Array<{
    text: string;
    onPress?: () => void;
    style?: "default" | "cancel" | "destructive";
  }>
) => {
  const message = [title, description].filter(Boolean).join("\n");
  const result = window.confirm(message);

  if (options && options.length > 0) {
    const confirmOption =
      options.find(({ style }) => style !== "cancel") || options[0];
    const cancelOption = options.find(({ style }) => style === "cancel");

    if (result) {
      (confirmOption?.onPress ?? (() => {}))();
    } else {
      (cancelOption?.onPress ?? (() => {}))();
    }
  }
};

const alert = Platform.OS === "web" ? alertPolyfill : Alert.alert;

export default alert;
