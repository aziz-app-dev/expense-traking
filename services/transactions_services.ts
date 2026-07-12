import { ResposeType, TransactionType, WalletType } from "@/constants/model";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "@firebase/firestore";
import { showAlert } from "@/components/custom_alert";
import { uploadImageToCloudinary } from "./cloudinary_services";

import { db } from "../config/firebase";

export const createAndUpdateTransactions = async (
  transactionData: Partial<TransactionType>
): Promise<ResposeType> => {
  try {
    const { id, type, amount, image, walletId } = transactionData;
    if (!transactionData.image) {
      transactionData.image =
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFL7FzcxN7XMRjk0YOQ9br_bt_kLNYg0ZP8g&s";
    }
    if (transactionData.image && transactionData.image.startsWith("file://")) {
      const uploadedUrl = await uploadImageToCloudinary(transactionData.image);

      if (!uploadedUrl) {
        showAlert("Error", "Image upload failed");
        return {
          success: false,
          msg: "Image upload failed",
        };
      }
      transactionData.image = uploadedUrl;
    }

    if (!amount || amount <= 0 || !walletId || !type) {
      return { success: false, msg: "Invalid tranactions data" };
    }

    if (id) {
      // UPDATE existing transaction
      const transactionRef = doc(db, "transaction", id);
      const oldTransactionSnap = await getDoc(transactionRef);

      if (!oldTransactionSnap.exists()) {
        return { success: false, msg: "Transaction not found" };
      }

      const oldTransaction = oldTransactionSnap.data() as TransactionType;
      const oldAmount = oldTransaction.amount ?? 0;
      const oldType = oldTransaction.type;
      const oldWalletId = oldTransaction.walletId;

      // Get current wallet
      const walletRef = doc(db, "wallets", walletId);
      const walletSnap = await getDoc(walletRef);

      if (!walletSnap.exists()) {
        return { success: false, msg: "Wallet not found" };
      }

      const walletData = walletSnap.data() as WalletType;
      let walletAmount = Number(walletData.amount) ?? 0;
      let totalIncome = Number(walletData.total) ?? 0;
      let totalExpenses = Number(walletData.totalExpances) ?? 0;

      // If wallet changed, reverse from old wallet first
      if (oldWalletId !== walletId) {
        const oldWalletRef = doc(db, "wallets", oldWalletId!);
        const oldWalletSnap = await getDoc(oldWalletRef);

        if (oldWalletSnap.exists()) {
          const oldWalletData = oldWalletSnap.data() as WalletType;
          let oldWalletAmount = Number(oldWalletData.amount) ?? 0;
          let oldWalletTotal = Number(oldWalletData.total) ?? 0;
          let oldWalletExpenses = Number(oldWalletData.totalExpances) ?? 0;

          // Reverse old transaction from old wallet
          if (oldType === "income") {
            oldWalletAmount -= oldAmount;
            oldWalletTotal -= oldAmount;
          } else {
            oldWalletAmount += oldAmount;
            oldWalletExpenses -= oldAmount;
          }

          await updateDoc(oldWalletRef, {
            amount: oldWalletAmount,
            total: Math.max(0, oldWalletTotal),
            totalExpances: Math.max(0, oldWalletExpenses),
          });
        }

        // Apply new transaction to new wallet
        if (type === "expense" && walletAmount - amount < 0) {
          return { success: false, msg: "Selected wallet does not have enough balance" };
        }

        if (type === "income") {
          walletAmount += amount;
          totalIncome += amount;
        } else {
          walletAmount -= amount;
          totalExpenses += amount;
        }
      } else {
        // Same wallet - calculate the difference
        // First reverse old transaction
        if (oldType === "income") {
          walletAmount -= oldAmount;
          totalIncome -= oldAmount;
        } else {
          walletAmount += oldAmount;
          totalExpenses -= oldAmount;
        }

        // Check if new expense is valid
        if (type === "expense" && walletAmount - amount < 0) {
          return { success: false, msg: "Selected wallet does not have enough balance" };
        }

        // Apply new transaction
        if (type === "income") {
          walletAmount += amount;
          totalIncome += amount;
        } else {
          walletAmount -= amount;
          totalExpenses += amount;
        }
      }

      // Update wallet
      await updateDoc(walletRef, {
        amount: walletAmount,
        total: Math.max(0, totalIncome),
        totalExpances: Math.max(0, totalExpenses),
      });

      // Update transaction
      await setDoc(transactionRef, transactionData, { merge: true });

      return {
        success: true,
        data: { ...transactionData, id },
      };
    } else {
      // ADD new transaction
      const walletRef = doc(db, "wallets", walletId);
      const walletSnaphot = await getDoc(walletRef);

      if (!walletSnaphot.exists()) {
        return { success: false, msg: "Wallet not found" };
      }
      const walletData = walletSnaphot.data() as WalletType;

      if (type === "expense" && walletData.amount! - amount < 0) {
        return {
          success: false,
          msg: "Selected wallet does not have enough balance",
        };
      }

      const totalWalletAmount =
        type === "income"
          ? Number(walletData.amount) + amount
          : Number(walletData.amount) - amount;
      const updatedType = type === "income" ? "total" : "totalExpances";
      const updateTotals =
        type === "income"
          ? Number(walletData.total) + amount
          : Number(walletData.totalExpances) + amount;

      await updateDoc(walletRef, {
        amount: totalWalletAmount,
        [updatedType]: updateTotals,
      });

      const transactionRef = doc(collection(db, "transaction"));
      await setDoc(transactionRef, transactionData, { merge: true });

      return {
        success: true,
        data: { ...transactionData, id: transactionRef.id },
      };
    }
  } catch (error: any) {
    console.log("Error creating or updateing:$", error);
    return {
      success: false,
      msg: error,
    };
  }
};

export const deleteTransaction = async (
  transactionId: string
): Promise<ResposeType> => {
  try {
    // 1️⃣ Get transaction
    const transactionRef = doc(db, "transaction", transactionId);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      return { success: false, msg: "Transaction not found" };
    }

    const transaction = transactionSnap.data() as TransactionType;

    const { amount, type, walletId } = transaction;

    if (!amount || !walletId || !type) {
      return { success: false, msg: "Invalid transaction data" };
    }

    // 2️⃣ Get wallet
    const walletRef = doc(db, "wallets", walletId);
    const walletSnap = await getDoc(walletRef);

    if (!walletSnap.exists()) {
      return { success: false, msg: "Wallet not found" };
    }

    const wallet = walletSnap.data() as WalletType;

    // 3️⃣ Reverse wallet changes
    let updatedWalletAmount = wallet.amount ?? 0;
    let updatedTotal = wallet.total ?? 0;
    let updatedTotalExpenses = wallet.totalExpances ?? 0;

    if (type === "expense") {
      // Expense was deducted → add it back
      updatedWalletAmount += amount;
      updatedTotalExpenses -= amount;
    } else if (type === "income") {
      // Income was added → subtract it
      updatedWalletAmount -= amount;
      updatedTotal -= amount;
    }

    // Prevent negative totals
    updatedTotal = Math.max(0, updatedTotal);
    updatedTotalExpenses = Math.max(0, updatedTotalExpenses);

    // 4️⃣ Update wallet
    await updateDoc(walletRef, {
      amount: updatedWalletAmount,
      total: updatedTotal,
      totalExpances: updatedTotalExpenses,
    });

    // 5️⃣ Delete transaction
    await deleteDoc(transactionRef);

    return {
      success: true,
      msg: "Transaction deleted and wallet updated",
    };
  } catch (error: any) {
    console.log("Delete transaction error:", error);
    return {
      success: false,
      msg: error.message || "Something went wrong",
    };
  }
};
