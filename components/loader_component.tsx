import { Colors } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

const Loading = ({ visible = true }) => {
  if (!visible) return null;

  return (
    <Modal transparent>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    </Modal>
  );
};

export default Loading;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
});
