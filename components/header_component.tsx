import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type TitleAlign = "left" | "center";

type HeaderProps = {
  title: string;
  backgroundColor?: string;
  titleAlign?: TitleAlign;

  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;

  onLeftPress?: () => void;
  onRightPress?: () => void;
};

export const AppHeader: React.FC<HeaderProps> = ({
  title,
  backgroundColor = Colors.black,
  titleAlign = "center",
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
}) => {
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Left Icon */}
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={onLeftPress ?? router.back}
      >
        {leftIcon && (
          <Ionicons
            name={leftIcon}
            size={AppSizes.headerIcon}
            color={Colors.neutral100}
          />
        )}
      </TouchableOpacity>

      {/* Title */}
      <View
        style={[
          styles.titleContainer,
          titleAlign === "left" && styles.titleLeft,
        ]}
      >
        <Text
          style={[styles.title, titleAlign === "left" && styles.titleLeftText]}
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>

      {/* Right Icon */}
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={onRightPress}
        disabled={!rightIcon}
      >
        {rightIcon && (
          <Ionicons
            name={rightIcon}
            size={AppSizes.headerIcon}
            color={Colors.neutral100}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  iconWrapper: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  titleContainer: {
    flex: 1,
    alignItems: "center",
  },

  titleLeft: {
    alignItems: "flex-start",
    paddingLeft: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.neutral100,
  },

  titleLeftText: {
    textAlign: "left",
  },
});

{
  /* <AppHeader
        title="Home"
        titleAlign='left'
        leftIcon='chevron-back-outline'
      /> */
}
