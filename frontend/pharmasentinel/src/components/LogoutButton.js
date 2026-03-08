// C:\Users\nimra\Desktop\PharmaSentinel\frontend\pharmasentinel\src\components\LogoutButton.js
import React, { useContext } from "react";
import { Button } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";

export default function LogoutButton({ className }) {
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout(); // ✅ this clears user, token, localStorage and navigates to /login
  };

  return (
    <Button variant="danger" className={className} onClick={handleLogout}>
      Logout
    </Button>
  );
}