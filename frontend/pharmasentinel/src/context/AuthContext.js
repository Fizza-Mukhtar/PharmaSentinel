import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser as apiLoginUser, logoutUser as apiLogoutUser } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Load initial state from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => user?.access || null);

  // Sync state with localStorage when user changes
  useEffect(() => {
    if (user) {
      setToken(user.access || null);
    } else {
      setToken(null);
    }
  }, [user]);

  // Map roles to dashboard paths
  const rolePaths = {
    drap: "/dashboard/drap",
    manufacturer: "/dashboard/manufacturer",
    distributor: "/dashboard/distributor",
    warehouse: "/dashboard/warehouse",
    wholesaler: "/dashboard/wholesaler",
    shopkeeper: "/dashboard/shopkeeper",
    customer: "/dashboard/customer",
  };

  const login = async (username, password) => {
    try {
      const data = await apiLoginUser(username, password);

      // Merge tokens with user object
      const userData = {
        ...data.user,
        access: data.access,
        refresh: data.refresh,
      };

      // Save in localStorage
      localStorage.setItem("user", JSON.stringify(userData));

      // Update state
      setUser(userData);

      // Navigate based on role
      const role = data.user?.role;
      if (role && rolePaths[role]) {
        navigate(rolePaths[role]);
      } else {
        navigate("/");
      }

      return data;
    } catch (err) {
      console.error("AuthContext.login error:", err);
      throw err;
    }
  };

  const logout = () => {
    apiLogoutUser(); // optional API call
    localStorage.removeItem("user");
    setUser(null);
    setToken(null);
    navigate("/login"); // 🔹 redirect to login page
  };

  const isAuthenticated = () => !!(token && user?.access);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
