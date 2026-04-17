import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons"; // or react-native-vector-icons
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

type BackBtnProps = {
  onPress?: () => void;
  color?: string; // icon and text color
  text?: string; // optional text next to arrow
  size?: number; // icon size
};

const BackBtn = ({
  onPress,
  color = Colors.white,
  text,
  size = 24,
}: BackBtnProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back-outline" size={size} color={color} />
      {text && <Text style={[styles.txt, { color }]}>{text}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral600,
    alignSelf:"flex-start",
    padding: 8,
    borderRadius:8

  },
  txt: {
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 6,
  },
});

export default BackBtn;
