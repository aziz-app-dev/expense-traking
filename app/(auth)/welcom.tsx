import MyBtn from "@/components/btn_component";
import MyTxt from "@/components/txt_components";
import { Colors } from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const Welcom = () => {
  return (
    <View style={styles.mainContianer}>
      <View>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <Text style={styles.heading}>Sign In</Text>
        </TouchableOpacity>
        <Image
          source={require("@/assets/images/accounting-concept.png")}
          style={styles.img}
        />
      </View>
      <View style={styles.footer}>
        <MyTxt style={styles.welTxt}>Always take control</MyTxt>
        <MyTxt style={styles.welTxt}>of your finances</MyTxt>
        <MyTxt style={styles.welSubTxt}>
          Finances must be arrange to set a batter lifestyle in future
        </MyTxt>

        <View style={{ height: 20 }} />
        <MyBtn
          title="Get Started"
          bgColor={Colors.primary}
          // textColor={Colors.white}
          fontSize={18}
          fontWeight="800"
          onPress={() => router.push("/(auth)/login")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContianer: {
    flex: 1,
    justifyContent: "space-between",
    backgroundColor: Colors.black,
    // marginBottom: "11%",
  },

  heading: {
    fontSize: 18,
    fontWeight: "500",
    alignSelf: "flex-end",
    color: Colors.white,
    marginTop: 10,
    marginRight: 15,
    alignItems: "flex-end",
  },
  welTxt: {
    fontSize: 26,
    fontWeight: "800",
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",
    textAlign: "center",
    color: Colors.white,
    lineHeight: 25,
    marginTop: 5,
  },
  welSubTxt: {
    fontSize: 18,
    fontWeight: "400",
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",
    textAlign: "center",
    color: Colors.white,
    marginTop: 15,
    marginHorizontal: 20,
  },
  img: {
    width: 300,
    height: 300,
    alignSelf: "center",
    marginTop: 80,
  },
  footer: {
    backgroundColor: Colors.neutral900,
    width: "100%",
    paddingTop: 25,
    paddingBottom: 50,
    paddingHorizontal: 20,

    // iOS shadow
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,

    // Android (won't show top shadow)
    elevation: 10,
  },
});

export default Welcom;
