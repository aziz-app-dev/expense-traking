import HomeCard from "@/components/home_card_component";
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
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const { user } = useAuth();

  const constraints = user?.uid
    ? [where("uid", "==", user.uid), orderBy("date", "desc"),limit(30)]
    : [];
    
  const {
    data: recentTransaction,
    loading,
    error,
  } = useFeatchData<WalletType>("transaction", constraints);
console.log(recentTransaction);

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
        <TouchableOpacity style={styles.searchIcon} onPress={() => router.push("/(modals)/search_modal")}>
          <Ionicons
            name="search"
            size={AppSizes.bodyIcon}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      {/* Body */}
      <ScrollView
        style={styles.scrollViewStyle}
        showsVerticalScrollIndicator={false}
      >
        <HomeCard />
        <MySpacer height={20} />
        <TransactionList
          data={recentTransaction}
          loading={loading}
          emptyListMsg="No Transaction added yet!"
          title="Recent Transactions"
        />
         <MySpacer height={80} />
      </ScrollView>

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
    alignContent: "center",
    marginBottom: 10,
  },
  searchIcon: {
    backgroundColor: Colors.neutral700,
    padding: 10,
    borderRadius: 50,
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
  scrollViewStyle: {
    marginTop: 10,
    paddingBottom: 100, // 👈 avoid FAB overlap
  },
});
