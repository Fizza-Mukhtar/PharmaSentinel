// src/components/ProtectedRoute.js
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated() || !user) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but role not allowed
    return <Navigate to="/" replace />;
  }

  // Logged in and role allowed
  return children;
};

export default ProtectedRoute;
