import { doc, getDoc, setDoc, updateDoc } from "@firebase/firestore";
import { router } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import React, { createContext, useEffect, useRef, useState } from "react";
import { auth, db } from "../config/firebase";

const AuthContexts = createContext(null);

// Turn raw Firebase auth error codes into user-friendly messages.
const getAuthErrorMessage = (error: any) => {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please sign in instead.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";
    default:
      return error?.message ?? "Something went wrong. Please try again.";
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  // While registering we sign the new user straight back out and route them to
  // the sign-in page ourselves, so suppress the automatic auth-state navigation.
  const isRegisteringRef = useRef(false);

  useEffect(() => {
  const unsubscribeAuth = auth.onAuthStateChanged(async (firebaseUser: any) => {
    if (isRegisteringRef.current) {
      // The sign-out that concludes registration ends the suppression.
      if (!firebaseUser) {
        isRegisteringRef.current = false;
      }
      return;
    }

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
      return { success: false, message: getAuthErrorMessage(error) };
    }
  };
  const register = async (email: string, password: string, name: string) => {
    console.log("Registering user:", email, name);
    // Suppress auth-state navigation so the auto sign-in from account creation
    // doesn't drop the user into the app before we route them to sign-in.
    isRegisteringRef.current = true;
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      try {
        await setDoc(doc(db, "users", response.user.uid), {
          name: name ?? response.user.displayName,
          email,
          uid: response.user.uid,
        });
      } catch (error) {
        console.log("Error setting user document: ", error);
      }
      // Sign the freshly created user out so they log in manually.
      await signOut(auth);
      return { success: true, message: "Registration successful" };
    } catch (error: any) {
      console.log("Auth Context Error: ", error.message);
      isRegisteringRef.current = false;
      return { success: false, message: getAuthErrorMessage(error) };
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