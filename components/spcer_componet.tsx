import React from "react";
import { View, ViewStyle } from "react-native";

type SpacerProps = {
  height?: number; // vertical spacing
  width?: number;  // horizontal spacing
  style?: ViewStyle; // optional additional styles
};

const MySpacer = ({ height = 10, width = 0, style }: SpacerProps) => {
  return <View style={[{ height, width }, style]} />;
};

export default MySpacer;
