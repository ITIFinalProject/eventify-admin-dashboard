import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { checkAdminStatus } from "./firestoreService";

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Check if user is admin
    const adminCheck = await checkAdminStatus(userCredential.user.uid);

    if (!adminCheck.success || !adminCheck.isAdmin) {
      // Sign out the user if they're not an admin
      await signOut(auth);
      return {
        success: false,
        error: "Access denied. Only administrators can access this dashboard.",
      };
    }

    return {
      success: true,
      user: userCredential.user,
      adminData: adminCheck.adminData,
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
