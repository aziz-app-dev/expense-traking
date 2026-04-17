import BackBtn from "@/components/back_btn_component";
import MyBtn from "@/components/btn_component";
import MyInput from "@/components/input_field_component";
import MySpacer from "@/components/spcer_componet";
import MyTxt from "@/components/txt_components";
import { AppSizes } from "@/constants/sizes";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/auth_context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const footerTxt1 = "Don't have an account?";
  const footerTxt2 = "Sign In";
  const greet1 = "Let's";
  const greet2 = "Get Started";
  const btnTxt = "Sign Up";
  const subTitleTxt =
    "Create an account to track all your expenses and manage your budget effectively.";
  const handleSubmiton = async () => {
    if (
      email == null ||
      email === "" ||
      password == null ||
      password === "" ||
      name == null ||
      name === ""
    ) {
      alert("Please fill all the fields");
      return;
    }
    setIsLoading(true);
    try {
      const res = await register(email, password, name);
      if (!res.success) {
        alert(res.message);
      }
      // if (res.success) {
      //   router.push("/(auth)/login");
      // } else {
      //   alert(res.message);
      // }
    } catch (error: any) {
      console.log("Register error:", error);
      alert(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContianer}>
      <BackBtn onPress={() => router.back()} />
      <MySpacer height={20} />
      <View style={{ gap: 5 }}>
        {/* !Greeting */}
        <MyTxt
          color={Colors.white}
          fontSize={30}
          lineHeight={36}
          fontWeight={"600"}
        >
          {greet1}
        </MyTxt>
        <MyTxt
          color={Colors.white}
          fontSize={30}
          lineHeight={36}
          fontWeight={"600"}
        >
          {greet2}
        </MyTxt>
        <MySpacer height={20} />

        <MyTxt>{subTitleTxt}</MyTxt>

        {/* !Form */}
        <MyInput
          placeholder="Name"
          value={name}
          autoCapitalize="words"
          onChangeText={setName}
          leftIcon={
            <Ionicons
              name="person"
              size={AppSizes.inputIcon}
              color={Colors.white}
            />
          }
        />
        <MyInput
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          leftIcon={
            <Ionicons
              name="at"
              size={AppSizes.inputIcon}
              color={Colors.white}
            />
          }
        />
        <MyInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          rightIcon={
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={AppSizes.inputIcon}
              color="white"
              onPress={() => setShowPassword((prev) => !prev)}
            />
          }
          leftIcon={
            <Ionicons
              name={"lock-closed"}
              size={AppSizes.inputIcon}
              color="white"
            />
          }
        />
        <MyTxt align="right">Forgot Password?</MyTxt>
        <MySpacer height={20} />
        <MyBtn
          title={btnTxt}
          bgColor={Colors.primary}
          loading={isLoading}
          fontSize={18}
          fontWeight="800"
          onPress={() => handleSubmiton()}
        />
        <View style={styles.footerTxt}>
          <MyTxt color={Colors.white}>{footerTxt1}</MyTxt>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <MyTxt color={Colors.primary} fontWeight="700">
              {footerTxt2}
            </MyTxt>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContianer: {
    flex: 1,
    backgroundColor: Colors.black,
   padding: AppSizes.bodyPadding,
  },
  footerTxt: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 25,
  },
});

export default Register;
