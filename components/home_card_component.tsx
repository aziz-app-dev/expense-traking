import { WalletType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import useFeatchData from "@/hooks/use_featch_data";
import { Ionicons } from "@expo/vector-icons";
import { orderBy, where } from "@firebase/firestore";
import React from "react";
import {
  ActivityIndicator,
  ImageBackground,
  StyleSheet,
  View,
} from "react-native";
import Currency from "./currency_components";
import MyTxt from "./txt_components";

const HomeCard = () => {
  const { user } = useAuth();

  const constraints = user?.uid
    ? [where("uid", "==", user.uid), orderBy("create", "desc")]
    : [];
  const {
    data: wallets,
    loading,
    error,
  } = useFeatchData<WalletType>("wallets", constraints);

  const totalBalance = () => {
    return wallets.reduce(
      (total: any, item: WalletType) => {
        total.blance = total.blance + Number(item.amount);
        total.income = total.income + Number(item.total);
        total.expances = total.expances + Number(item.totalExpances);
        return total;
      },
      { blance: 0, income: 0, expances: 0 }
    );
  };

  return (
    <ImageBackground
      source={require("../assets/images/card.png")}
      resizeMode="stretch"
      style={styles.cardBg}
    >
      <View style={styles.container}>
        {/* Top Section */}
        <View>
          <View style={styles.totalBalance}>
            <MyTxt fontSize={17} fontWeight="500" color={Colors.neutral800}>
              Total Balance
            </MyTxt>
            <Ionicons
              name="ellipsis-horizontal"
              size={AppSizes.tabIcon}
              color={Colors.black}
            />
          </View>
          {loading ? (
            <ActivityIndicator
              size="small"
              color={Colors.black}
              style={{ marginTop: 4 }}
            />
          ) : (
            <Currency
              size={30}
              amount={totalBalance()?.blance}
              lineHeight={32}
              fractionDigits={2}
            />
          )}
        </View>

        {/* Income & Expense */}
        <View style={styles.stats}>
          {/* Income */}
          <View style={styles.incomeExpense}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="arrow-down"
                size={AppSizes.tabIcon}
                color={Colors.black}
              />
            </View>
            <View>
              <MyTxt fontWeight="500" fontSize={14} color={Colors.black}>
                Income
              </MyTxt>
              <Currency
                type="income"
                size={15}
                amount={totalBalance()?.income}
                showSign={false}
              />
              {/* <MyTxt  fontWeight="700" color={Colors.green}>Rs. 8,784</MyTxt> */}
            </View>
          </View>

          {/* Expense */}
          <View style={styles.incomeExpense}>
            <View style={styles.iconWrapper}>
              <Ionicons
                name="arrow-up"
                size={AppSizes.tabIcon}
                color={Colors.black}
              />
            </View>
            <View>
              <MyTxt fontWeight="500" fontSize={14} color={Colors.black}>
                Expense
              </MyTxt>
              <Currency
                type="expense"
                size={15}
                amount={totalBalance()?.expances}
                showSign={false}
              />
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

export default HomeCard;

const styles = StyleSheet.create({
  cardBg: {
    height: 200,
    width: "100%",
    borderRadius: 2,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    paddingBottom: 45,
  },
  totalBalance: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  incomeExpense: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    backgroundColor: Colors.neutral350,
    padding: 6,
    borderRadius: 8,
  },
});

// const styles = StyleSheet.create({
//   bgImage: {
//     height: 200,
//     width: "100%",
//   },
//   container: {
//     padding: 20,
//     paddingHorizontal: 23,
//     height: "87%",
//     width: "100%",
//     justifyContent: "space-between",
//   },
//   totalBalnce: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 5,
//   },
//   total: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 5,
//   },
//   stats: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   statsIcon: {
//     backgroundColor: Colors.neutral350,
//     padding: 5,
//     borderRadius: 50,
//   },
//   incomeExpense: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 7,
//   },
// });
