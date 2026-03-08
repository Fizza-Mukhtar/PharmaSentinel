// ============================================
// FILE: src/components/drap/DrapLayout.js
// ============================================
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { 
  FaHome,
  FaUserPlus,
  FaIndustry,
  FaBoxes,
  FaNetworkWired,
  FaExclamationTriangle,
  FaUsers,
  FaWarehouse,
  FaStoreAlt,
  FaChartLine,
  FaBell,
  FaClipboardList,
  FaSearch,
  FaHeartbeat,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";

const DrapLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user")) || {};

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

  useEffect(() => {
    setNotifications(12);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard/drap", icon: <FaHome />, label: "Dashboard", exact: true },
    { path: "/dashboard/drap/register-users", icon: <FaUserPlus />, label: "Register Users" },
    { path: "/dashboard/drap/manufacturers", icon: <FaIndustry />, label: "Manufacturers" },
    { path: "/dashboard/drap/batches", icon: <FaBoxes />, label: "Batches" },
    { path: "/dashboard/drap/supply-chain", icon: <FaNetworkWired />, label: "Supply Chain" },
    { path: "/dashboard/drap/reports", icon: <FaExclamationTriangle />, label: "Suspicious Reports" },
    { path: "/dashboard/drap/distributors", icon: <FaUsers />, label: "Distributors" },
    { path: "/dashboard/drap/warehouses", icon: <FaWarehouse />, label: "Warehouses" },
    { path: "/dashboard/drap/wholesalers", icon: <FaStoreAlt />, label: "Wholesalers" },
    { path: "/dashboard/drap/shopkeepers", icon: <FaStoreAlt />, label: "Shopkeepers" },
    { path: "/dashboard/drap/analytics", icon: <FaChartLine />, label: "Analytics" },
    { path: "/dashboard/drap/notifications", icon: <FaBell />, label: "Notifications" },
    { path: "/dashboard/drap/audit-logs", icon: <FaClipboardList />, label: "Audit Logs" },
    { path: "/dashboard/drap/search", icon: <FaSearch />, label: "Search Batches" },
    { path: "/dashboard/drap/system-health", icon: <FaHeartbeat />, label: "System Health" }
  ];

  const isActive = (path, exact) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div style={{ color: "#3b82f6", fontSize: "2rem" }}>Loading...</div>
        </div>
      )}

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
              color: "#3b82f6",
              fontWeight: "600",
              fontSize: "1.25rem"
            }}>
              DRAP Admin
            </h5>
            <small style={{ color: "#6b7280", fontSize: "0.875rem" }}>
              Control Panel
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
                  backgroundColor: isActive(item.path, item.exact) ? "#3b82f6" : "transparent",
                  color: isActive(item.path, item.exact) ? "#ffffff" : "#374151",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  fontWeight: isActive(item.path, item.exact) ? "600" : "500",
                  fontSize: "0.875rem"
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path, item.exact)) {
                    e.currentTarget.style.backgroundColor = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path, item.exact)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "1.1rem", display: "flex", alignItems: "center" }}>
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
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
        transition: "margin-left 0.3s ease, width 0.3s ease",
        display: "flex",
        flexDirection: "column"
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
              onClick={() => navigate("/dashboard/drap/notifications")}
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
                backgroundColor: "#3b82f6",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "600",
                fontSize: "1rem"
              }}>
                {(user.username || "Admin").charAt(0).toUpperCase()}
              </div>
              <div style={{ display: isMobile ? "none" : "block" }}>
                <div style={{ fontWeight: "500", color: "#374151", fontSize: "0.875rem" }}>
                  {user.username || "Admin"}
                </div>
                <div style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                  DRAP Administrator
                </div>
              </div>
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
        <main style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          <Outlet context={{ setLoading }} />
        </main>
      </div>
    </div>
  );
};

export default DrapLayout;