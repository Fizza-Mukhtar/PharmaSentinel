// ============================================
// FILE: src/components/distributor/DistributorLayout.js
// ============================================
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import { getDistributorNotifications } from "../../services/api";
import { 
  FaHome,
  FaInbox,
  FaBoxes,
  FaExchangeAlt,
  FaHistory,
  FaShieldAlt,
  FaClock,
  FaFileAlt,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";

export default function DistributorLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [notificationCount, setNotificationCount] = useState(0);

  const user = JSON.parse(localStorage.getItem("user"));
  const username = user?.username || "Distributor User";

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Fetch notification count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await getDistributorNotifications();
        const count = res.notifications?.length || res.count || 0;
        setNotificationCount(count);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    if (user?.token || user?.access) {
      fetchNotificationCount();
      const interval = setInterval(fetchNotificationCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard/distributor", icon: <FaHome />, label: "Dashboard" },
    { path: "/dashboard/distributor/incoming", icon: <FaInbox />, label: "Incoming Batches" },
    { path: "/dashboard/distributor/inventory", icon: <FaBoxes />, label: "Inventory" },
    { path: "/dashboard/distributor/transfer", icon: <FaExchangeAlt />, label: "Transfer Batch" },
    { path: "/dashboard/distributor/history-transfer", icon: <FaHistory />, label: "Transfer History" },
    { path: "/dashboard/distributor/verify", icon: <FaShieldAlt />, label: "Verify Blockchain" },
    { path: "/dashboard/distributor/expiry", icon: <FaClock />, label: "Expiry Management" },
    { path: "/dashboard/distributor/reports", icon: <FaFileAlt />, label: "Reports" }
  ];

  const isActive = (path) => {
    if (path === "/dashboard/distributor") {
      return location.pathname === "/dashboard/distributor";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? "260px" : "0",
          backgroundColor: "#ffffff",
          borderRight: "1px solid #e5e7eb",
          position: isMobile ? "fixed" : "fixed",
          height: "100vh",
          overflowY: "auto",
          transition: "width 0.3s ease",
          zIndex: isMobile ? 1050 : 1,
          boxShadow: "2px 0 8px rgba(0,0,0,0.05)"
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {/* Sidebar Header */}
          <div style={{ 
            padding: "1.5rem", 
            borderBottom: "1px solid #e5e7eb",
            backgroundColor: "#ffffff"
          }}>
            <h5 style={{ 
              margin: 0, 
              color: "#10b981",
              fontWeight: "600",
              fontSize: "1.25rem"
            }}>
              Distributor
            </h5>
            <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Dashboard
            </small>
          </div>

          {/* Menu Items */}
          <div style={{ padding: "1rem", flex: 1 }}>
            {menuItems.map((item) => (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  padding: "0.75rem 1rem",
                  marginBottom: "0.25rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                  backgroundColor: isActive(item.path) ? "#10b981" : "transparent",
                  color: isActive(item.path) ? "#ffffff" : "#374151",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontWeight: isActive(item.path) ? "600" : "500",
                  fontSize: "0.875rem"
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "1.1rem", display: "flex", alignItems: "center" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1049
          }}
        />
      )}

      {/* Main Content */}
      <div style={{ 
        marginLeft: isMobile ? 0 : (sidebarOpen ? "260px" : 0),
        width: isMobile ? "100%" : (sidebarOpen ? "calc(100% - 260px)" : "100%"),
        transition: "margin-left 0.3s ease, width 0.3s ease"
      }}>
        {/* Top Bar */}
        <header style={{
          backgroundColor: "#ffffff",
          padding: "1rem 1.5rem",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.25rem",
                color: "#374151",
                padding: "0.5rem"
              }}
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <h4 style={{ 
              margin: 0, 
              color: "#111827",
              fontWeight: "700",
              fontSize: "1.5rem",
              display: isMobile ? "none" : "block"
            }}>
              PharmaSentinel
            </h4>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {/* Notification Bell */}
            <button
              onClick={() => navigate("/dashboard/distributor/notifications")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.25rem",
                color: "#374151",
                padding: "0.5rem"
              }}
            >
              <FaBell />
            </button>

            {/* User Profile */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#10b981",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "1rem"
              }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <span style={{ 
                fontWeight: "500",
                color: "#374151",
                display: isMobile ? "none" : "block"
              }}>
                {username}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#ef4444",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}
            >
              <FaSignOutAlt />
              <span style={{ display: isMobile ? "none" : "inline" }}>Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <Container fluid style={{ padding: "2rem" }}>
          {children}
        </Container>
      </div>
    </div>
  );
}