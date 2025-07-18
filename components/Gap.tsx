import { View } from "react-native";

const Gap = ({
  tiny,
  small,
  normal,
  large,
}: {
  tiny?: boolean;
  small?: boolean;
  normal?: boolean;
  large?: boolean;
}) => (
  <View
    style={{
      borderBottomColor: "transparent",
      borderBottomWidth: tiny ? 10 : small ? 25 : large ? 100 : 50,
    }}
  />
);

export default Gap;
