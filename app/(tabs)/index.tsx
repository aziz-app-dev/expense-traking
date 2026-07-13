import HomeCard from "@/components/home_card_component";
import IncomeIdeas from "@/components/income_ideas";
import MySpacer from "@/components/spcer_componet";
import TransactionList from "@/components/transaction_list_component";
import MyTxt from "@/components/txt_components";
import { WalletType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import useFeatchData from "@/hooks/use_featch_data";
import { Ionicons } from "@expo/vector-icons";
import { limit, orderBy, where } from "@firebase/firestore";
import { router } from "expo-router";
import { StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();

  const constraints = user?.uid
    ? [where("uid", "==", user.uid), orderBy("date", "desc"),limit(30)]
    : [];
    
  const {
    data: recentTransaction,
    loading,
  } = useFeatchData<WalletType>("transaction", constraints);

  // Home only previews the 7 most recent; full history lives on the
  // "All Transactions" screen (with search + filter).
  const latestSeven = recentTransaction?.slice(0, 7) ?? [];

  // Recorded income used as loose context for AI income suggestions.
  const homeIncome =
    recentTransaction?.reduce(
      (sum: number, t: any) =>
        t.type === "income" ? sum + (Number(t.amount) || 0) : sum,
      0
    ) ?? 0;

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ gap: 2 }}>
          <MyTxt color={Colors.neutral400}>hello,</MyTxt>
          <MyTxt fontSize={20} fontWeight="600">
            {user?.name}
          </MyTxt>
        </View>
        <TouchableOpacity style={styles.searchIcon} onPress={() => router.push("/all_transactions?title=Search&focus=1")}>
          <Ionicons
            name="search"
            size={AppSizes.bodyIcon}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Body — header/card stay fixed; only the transaction list scrolls */}
      <View style={styles.body}>
        <HomeCard />
        <MySpacer height={20} />
        <IncomeIdeas totalIncome={homeIncome} />
        <MySpacer height={20} />
        <TransactionList
          fill
          titleSize={16}
          data={latestSeven}
          loading={loading}
          emptyListMsg="No Transaction added yet!"
          title="Recent Transactions"
          onViewAll={
            recentTransaction && recentTransaction.length > 0
              ? () => router.push("/all_transactions")
              : undefined
          }
        />
      </View>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.floatingBtn}
        onPress={()=>router.push("/(modals)/transaction_modal")}
      >
        <Ionicons name="add" size={28} color={Colors.black} />
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    padding: AppSizes.bodyPadding,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  body: {
    flex: 1,
    marginTop: 10,
  },
  searchIcon: {
    backgroundColor: Colors.neutral700,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  floatingBtn: {
    height: 50,
    width: 50,
    borderRadius: 15,
    position: "absolute",
    bottom: 30,
    right: 30,

    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Android shadow
  },
});
