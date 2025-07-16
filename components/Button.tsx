import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  ViewStyle,
} from "react-native";

function Button({
  title,
  onPress,
  type = "normal",
  disabled = false,
  style,
  textStyle,
}: {
  title: string;
  onPress: () => void;
  type?: "normal" | "ghost";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        type === "ghost" ? styles.ghost : styles.filled,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          type === "ghost" ? styles.ghostText : styles.filledText,
          disabled && styles.disabledText,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export default Button;

const styles = StyleSheet.create({
  base: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
  },
  filled: {
    backgroundColor: "#007bff",
  },
  ghost: {
    borderWidth: 1,
    borderColor: "#007bff",
    backgroundColor: "transparent",
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  text: {
    fontWeight: "500",
  },
  filledText: {
    color: "#fff",
  },
  ghostText: {
    color: "#007bff",
  },
  disabledText: {
    color: "#aaa",
  },
});
