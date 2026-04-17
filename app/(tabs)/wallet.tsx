import Currency from "@/components/currency_components";
import Loading from "@/components/loader_component";
import MySpacer from "@/components/spcer_componet";
import MyTxt from "@/components/txt_components";
import WalletList from "@/components/wallet_list_component";
import { WalletType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import useFeatchData from "@/hooks/use_featch_data";
import { Ionicons } from "@expo/vector-icons";
import { orderBy, where } from "@firebase/firestore";
import { router } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

const Wallet = () => {
  const { user } = useAuth();

  const constraints = user?.uid
    ? [where("uid", "==", user.uid), orderBy("create", "desc")]
    : [];

  const {
    data: wallets,
    loading,
    error,
  } = useFeatchData<WalletType>("wallets", constraints);

  if (!user) {
    return (
      <View style={styles.mainContainer}>
        <MyTxt color={Colors.white}>Loading...</MyTxt>
      </View>
    );
  }

  console.log("Wallets", wallets);
const totalBalance = () =>
  wallets.reduce((total, item) => total + (item.amount || 0), 0);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.mainTxt}>
        {/* <MyTxt color={Colors.white} fontSize={30} fontWeight="600" lineHeight={25}>
          
          Rs.{totalBalance()?.toFixed(2)}
        </MyTxt> */}
        <Currency amount={totalBalance()} currColor={Colors.white} fractionDigits={2} lineHeight={35}/>
        <MyTxt color={Colors.neutral400} align="center">Total Balance</MyTxt>
      </View>

      <MySpacer height={20} />

      <View style={styles.wallet}>
        <View style={styles.walletHeder}>
          <MyTxt fontSize={20} fontWeight="500">
            My Wallets
          </MyTxt>

          <TouchableOpacity
            onPress={() => router.push("/(modals)/wallet_modal")}
          >
            <Ionicons name="add-circle" size={30} color={Colors.primary} />
          </TouchableOpacity>
        </View>
        {loading && <Loading />}

        <FlatList
          data={wallets}
          renderItem={({ item, index }) => {
            return <WalletList item={item} index={index} router={router} />;
          }}
          contentContainerStyle={styles.listStyle}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.black,
    // padding:AppSizes.bodyPadding,
    alignItems: "center",
  },
  mainTxt: {
    marginTop: 60,
    gap: 5,
  },
  wallet: {
    flex: 1,
    marginTop: 10,
    backgroundColor: Colors.neutral900,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    padding: AppSizes.bodyPadding,
    paddingTop: 25,
    width: "100%",
  },
  walletHeder: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listStyle: {
    paddingVertical: 25,
    paddingTop: 15,
  },
});
export default Wallet;
