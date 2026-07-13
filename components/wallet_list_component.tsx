import { WalletType } from "@/constants/model";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Router } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import MyTxt from "./txt_components";

type Props = {
  item: WalletType;
  index: number;
  router: Router;
};

const WalletList = ({ item, index, router }: Props) => {
  const openWallet=()=>{
    router.push({pathname:"/(modals)/wallet_modal",params:{
      id:item?.id,
      name:item?.name,
      image:item?.image,
    }})
    
  };
  return (
    <Animated.View entering={FadeInDown.delay(index*50).springify().damping(40)}>
     <TouchableOpacity onPress={openWallet} style={styles.container}>
         <View style={styles.imageContianer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={{ flex: 1 }} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="wallet" size={26} color={Colors.neutral400} />
          </View>
        )}
      </View>
      <View style={styles.nameContiner}>
        <MyTxt fontSize={15} fontWeight={"600"}>
          {item.name}
        </MyTxt>
        <MyTxt color={Colors.neutral400}>Rs.{item.amount}</MyTxt>
      </View>
       <Ionicons
              name={"chevron-forward"}
              size={AppSizes.tabIcon}
              color={Colors.white}
            />
     </TouchableOpacity>
    </Animated.View>
  );
};

export default WalletList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    marginBottom: 15,
  },
  imageContianer: {
    height: 50,
    width: 50,
    borderWidth: 1,
    borderColor: Colors.neutral600,
    borderRadius: AppSizes.borderRadius,
    borderCurve: "continuous",
    overflow: "hidden",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral800,
  },
  nameContiner: {
    flex: 1,
    gap: 1,
    marginLeft: 10,
  },
});
