import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

type MyInputProps = TextInputProps & {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  bgColor?: string;
  textColor?: string;
  autoCapitalize?: string;
  fontSize?: number;
  marginVertical?: number;
  fontWeight?: "400" | "500" | "600" | "700";
  secureTextEntry?: boolean;

  // Icon props
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const MyInput = ({
  placeholder,
  value,
  onChangeText,
  bgColor = "transparent",
  textColor = Colors.white,
  fontSize = 16,
  marginVertical = 8,
  fontWeight = "500",
  autoCapitalize = "none",
  secureTextEntry = false,
  leftIcon,
  rightIcon,
  children: _children, // Extract to prevent passing to TextInput
  ...props
}: MyInputProps) => {
  return (
    <View style={[styles.container, { backgroundColor: bgColor ,marginVertical}]}>
      <View style={styles.inputWrapper}>
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
        cursorColor={Colors.primary}
          placeholder={placeholder}
          autoCapitalize={autoCapitalize}
          placeholderTextColor={Colors.neutral400}
          value={value}
          onChangeText={onChangeText}
          style={[
            styles.input,
            { color: textColor, fontSize, fontWeight },
            leftIcon ? { paddingLeft: 44 } : {},
            rightIcon ? { paddingRight: 44 } : {},
          ]}
          secureTextEntry={secureTextEntry}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderRadius: AppSizes.borderRadius,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.neutral500,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 48,
    paddingVertical: 0,
    textAlignVertical: "center",
  },
  leftIcon: {
    position: "absolute",
    left: 10,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: 40,
  },
  rightIcon: {
    position: "absolute",
    right: 10,
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    width: 40,
  },
});

export default MyInput;
