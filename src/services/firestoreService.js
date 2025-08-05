import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

// Users Service
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  try {
    const userRef = doc(db, "users", userId);

    // Filter out undefined values to prevent Firestore errors
    const cleanUserData = Object.fromEntries(
      Object.entries(userData).filter(([, value]) => value !== undefined)
    );

    await updateDoc(userRef, {
      ...cleanUserData,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Events Service
export const getAllEvents = async () => {
  try {
    const eventsRef = collection(db, "events");
    const snapshot = await getDocs(eventsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const updateEvent = async (eventId, eventData) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await updateDoc(eventRef, {
      ...eventData,
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating event:", error);
    throw error;
  }
};

export const deleteEvent = async (eventId) => {
  try {
    const eventRef = doc(db, "events", eventId);
    await deleteDoc(eventRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
};

// Reports Service
export const getAllReports = async () => {
  try {
    const reportsRef = collection(db, "reports");
    const snapshot = await getDocs(reportsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

export const updateReportStatus = async (reportId, status, action) => {
  try {
    const reportRef = doc(db, "reports", reportId);
    await updateDoc(reportRef, {
      status,
      action,
      actionTakenAt: new Date(),
      updatedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error updating report:", error);
    throw error;
  }
};

export const banUser = async (userId, banDuration = 30) => {
  try {
    const userRef = doc(db, "users", userId);
    const bannedAt = Timestamp.now();
    const banUntilDate = new Date();
    banUntilDate.setDate(banUntilDate.getDate() + banDuration);
    const banUntil = Timestamp.fromDate(banUntilDate);

    console.log("Banning user with:", {
      userId,
      bannedAt: bannedAt.toDate(),
      banUntil: banUntil.toDate(),
      banDuration,
    });

    await updateDoc(userRef, {
      status: "banned",
      bannedAt: bannedAt,
      banUntil: banUntil,
      updatedAt: Timestamp.now(),
    });
    return { success: true };
  } catch (error) {
    console.error("Error banning user:", error);
    throw error;
  }
};

// Admin Service
export const checkAdminStatus = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      const isAdmin = userData.role === "admin";
      return {
        success: true,
        isAdmin: isAdmin,
        adminData: isAdmin ? userData : null,
      };
    } else {
      return {
        success: true,
        isAdmin: false,
        adminData: null,
      };
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
    return { success: false, isAdmin: false, error: error.message };
  }
};
