import { Colors } from "@/constants/theme";
import React from "react";
import { StyleProp, StyleSheet, Text, TextStyle } from "react-native";

type MyTxtProps = {
  children: React.ReactNode;
  fontSize?: number;
  fontWeight?: TextStyle["fontWeight"];
  color?: string;
  lineHeight?: number;
  align?: TextStyle["textAlign"];
  style?: StyleProp<TextStyle>; // ✅ FIX
  numberOfLines?: number;
};


const MyTxt = ({
  children,
  fontSize = 14,
  fontWeight = "400",
  lineHeight,
  color = Colors.white,
  align = "left",
  style,
  ...rest
}: MyTxtProps) => {
  // Default the line height to ~1.4x the font size so descenders (g, p, y)
  // are never clipped on larger text. Explicit lineHeight always wins.
  const resolvedLineHeight = lineHeight ?? Math.round(fontSize * 1.4);
  return (
    <Text
      {...rest}
      style={[
        styles.base,
        {
          fontSize,
          fontWeight,
          lineHeight: resolvedLineHeight,
          color,
          textAlign: align,
        },
        style, // ✅ style LAST → always overrides
      ]}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false, // Android fix
    textAlignVertical: "center",
  },
});

export default MyTxt;
