import { Colors } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

// Screen-local overlay (NOT a Modal) so a screen's loader stays within that
// screen and never floats over other screens like the splash.
const Loading = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
};

export default Loading;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
