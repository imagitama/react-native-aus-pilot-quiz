import useFinalAnswer from "@/hooks/useFinalAnswer";
import { useState } from "react";
import { TextInput } from "react-native-paper";
import Button from "./Button";

const FreeTextInput = ({ questionIdx }: { questionIdx: number }) => {
  const [textValue, setTextValue] = useState("");
  const [finalAnswer, storeFinalAnswer] = useFinalAnswer(questionIdx);

  const onPressShowAnswer = () =>
    storeFinalAnswer({
      text: textValue,
    });

  return (
    <>
      <TextInput
        value={textValue}
        onChangeText={setTextValue}
        placeholder="Your guess"
      />
      <Button
        title={finalAnswer ? "Update Answer" : "Show Answer"}
        onPress={onPressShowAnswer}
        disabled={textValue === ""}
      />
    </>
  );
};

export default FreeTextInput;
