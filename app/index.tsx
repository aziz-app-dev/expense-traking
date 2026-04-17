import { Colors } from "@/constants/theme";
import { Image, StyleSheet, View } from "react-native";

const Index = () => {
  
  return (
    <View style={styles.mainContiner}>
      <Image
        resizeMode="contain"
        source={require("@/assets/images/money_bag.png")}
        style={styles.img}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContiner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.neutral900,
  },
  img: { width: 200, height: 200 },
});

export default Index;
