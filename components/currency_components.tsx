import MyTxt from "@/components/txt_components";
import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

type CurrencyProps = {
  amount: number;
  type?: "income" | "expense";
  size?: number;
  signSize?: number;
  lineHeight?: number;
  fractionDigits?: number;
  showSign?: boolean; // 👈 new
  currColor?: string; // 👈 new
};

const formatPKR = (amount: number, fractionDigits: number) =>
  amount.toLocaleString("en-PK", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
const Currency = ({
  amount,
  type,
  size = 34,
  signSize = 1,
  lineHeight = 15,
  fractionDigits = 1,
  currColor = Colors.black,
  showSign = true, // 👈 default behavior
}: CurrencyProps) => {
  const isIncome = type === "income";
  const isExpense = type === "expense";

  const sign = showSign ? (isIncome ? "+" : isExpense ? "−" : "") : "";

  const color = isIncome ? Colors.green : isExpense ? Colors.rose : currColor;

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {/* Sign */}
        {sign !== "" && (
          <MyTxt
            fontSize={size * signSize}
            fontWeight="600"
            color={color}
            style={styles.sign}
          >
            {sign}
          </MyTxt>
        )}

        {/* Currency */}
        <MyTxt
          fontSize={size * 0.75}
          fontWeight="700"
          lineHeight={lineHeight}
          color={color}
          style={styles.currency}
        >
          Rs.
        </MyTxt>

        {/* Amount */}
        <MyTxt
          fontSize={size}
          fontWeight="600"
          color={color}
          align="center"
          lineHeight={lineHeight}
        >
          {formatPKR(amount, fractionDigits)}
        </MyTxt>
      </View>
    </View>
  );
};

export default Currency;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-start",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  sign: {
    marginRight: 2,
  },
  currency: {
    marginTop: 4,
  },
});
