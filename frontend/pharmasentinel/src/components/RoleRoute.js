// C:\Users\nimra\Desktop\PharmaSentinel\frontend\pharmasentinel\src\components\RoleRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const RoleRoute = ({ children, roles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleRoute;
