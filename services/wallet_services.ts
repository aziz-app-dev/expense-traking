import { ResposeType, WalletType } from "@/constants/model";
import { collection, deleteDoc, doc, setDoc } from "@firebase/firestore";
import { showAlert } from "@/components/custom_alert";
import { uploadImageToCloudinary } from "./cloudinary_services";

import { db } from "../config/firebase";

export const createAndUpdateWallet = async (
  walletData: Partial<WalletType>
): Promise<ResposeType> => {
  try {
    let newWalletData = { ...walletData };
    if (walletData.image && walletData.image.startsWith("file://")) {
      const uploadedUrl = await uploadImageToCloudinary(walletData.image);

      if (!uploadedUrl) {
        showAlert("Error", "Image upload failed");
        return {
          success: false,
          msg: "Image upload failed",
        };
      }
      newWalletData.image = uploadedUrl;
    }
    if (!walletData?.id) {
      newWalletData.amount = 0;
      newWalletData.total = 0;
      newWalletData.totalExpances = 0;
      newWalletData.create = new Date();
    }
    const walletRef = walletData?.id
      ? doc(db, "wallets", walletData?.id)
      : doc(collection(db, "wallets"));
    await setDoc(walletRef, newWalletData, { merge: true });

    return {
      success: true,
      data: { ...newWalletData, id: walletRef.id },
    };
  } catch (error: any) {
    console.log("Error creating or updateing:$", error);
    return {
      success: false,
      msg: error,
    };
  }
};

export const deleteWalete=async(
    walletId:string
):Promise<ResposeType>=>{
    try {
        const walletRef = doc(db, "wallets", walletId);
        await deleteDoc(walletRef);
        return {
            msg:"Wallet delete successfully",
            success:true
        }
    } catch (error:any) {
        console.log("Error", error);
        return {
            success:false,
            msg:error
        }
    }
}