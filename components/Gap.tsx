import { View } from "react-native";

const Gap = ({
  small,
  normal,
  large,
}: {
  small?: boolean;
  normal?: boolean;
  large?: boolean;
}) => (
  <View
    style={{
      borderBottomColor: "transparent",
      borderBottomWidth: small ? 25 : large ? 100 : 50,
    }}
  />
);

export default Gap;
