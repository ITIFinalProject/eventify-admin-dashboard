import { useEffect, useState } from "react";
import { onAuthStateChange } from "../services/authService";
import { checkAdminStatus } from "../services/firestoreService";
import { AuthContext } from "../context/AuthContext";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (user) {
        // Check if user is admin when auth state changes
        const adminCheck = await checkAdminStatus(user.uid);

        if (adminCheck.success && adminCheck.isAdmin) {
          setUser(user);
          setIsAdmin(true);
          setAdminData(adminCheck.adminData);
        } else {
          // If user is not admin, clear all auth state
          setUser(null);
          setIsAdmin(false);
          setAdminData(null);
        }
      } else {
        setUser(null);
        setIsAdmin(false);
        setAdminData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    isAdmin,
    adminData,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
