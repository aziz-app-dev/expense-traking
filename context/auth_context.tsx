import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";

const AuthContexts = createContext(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
  const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      router.replace("/(auth)/welcom");
      return;
    }

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...snap.data(), // 👈 includes `name`
        });
      } else {
        // fallback if Firestore doc missing
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
        });
      }

      router.replace("/(tabs)");
    } catch (error) {
      console.log("Error fetching user profile:", error);
    }
  });

  return () => unsubscribeAuth();
}, []);


  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true, message: "Login successful" };
    } catch (error: any) {
      console.log("Auth Context Error: ", error.message);
      return { success: false, message: error.message };
    }
  };
  const register = async (email: string, password: string, name: string) => {
    console.log("Registering user:", email, name);
    try {
      await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      ).then(async (reponse) => {
       try {
         await setDoc(doc(db, "users", reponse?.user?.uid), {
          name: name ?? reponse?.user?.displayName,
          email,
          uid: reponse?.user?.uid,
        });
       } catch (error) {
        console.log("Error setting user document: ", error);
       }
      });
      return { success: true, message: "Registration successful" };
    } catch (error: any) {
      console.log("Auth Context Error: ", error.message);
      return { success: false, message: error.message };
    }
  };

  const updateData = async (uid: string, data: { name?: string; image?: string | null }) => {
    try {
      const docRef = doc(db, "users", uid);

      // Update the data in Firestore
      await updateDoc(docRef, data);

      // Update local user state
      setUser((prevUser: any) => ({
        ...prevUser,
        ...data,
      }));

      return { success: true, message: "Profile updated successfully" };
    } catch (error: any) {
      console.log("Auth Context Error: ", error.message);
      return { success: false, message: error.message };
    }
  };

  const contextValue: any = {
    user,
    setUser,
    updateData,
    login,
    register,
  };
  return (
    <AuthContexts.Provider value={contextValue}>
      {children}
    </AuthContexts.Provider>
  );
};

export const useAuth = (): any => {
  const context = React.useContext(AuthContexts);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};