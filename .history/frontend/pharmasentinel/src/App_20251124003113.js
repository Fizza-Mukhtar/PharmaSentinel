// src/App.js
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// --- Public Layout Components ---
import Navbar from "./components/NavbarComp";
import Footer from "./components/Footer";

// --- Dashboard Layout (ONLY ONE MAIN WRAPPER) ---
import DashboardLayout from "./components/DashboardLayout";

// --- Public Pages ---
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import Traceability from "./pages/Traceability";
import AntiCounterfeit from "./pages/AntiCounterfeit";
import SupplyChain from "./pages/SupplyChain";
import PharmaIndustry from "./pages/PharmaIndustry";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// --- Manufacturer Pages ---
import ManufacturerDashboard from "./manufacturer/pages/ManufacturerDashboard";
import CreateBatch from "./manufacturer/pages/CreateBatch";
import CreateShipment from "./manufacturer/pages/CreateShipment";
import ViewBatches from "./manufacturer/pages/ViewBatches";
import TransferHistory from "./manufacturer/pages/TransferHistory";
import VerifyBlockchain from "./manufacturer/pages/VerifyBlockchain";
import Analytics from "./manufacturer/pages/Analytics";
import Profile from "./manufacturer/pages/Profile";

// --- DRAP Pages ---
import DRAPDashboard from "./pages/dashboard/DRAPDashboard";
import RegisterUser from "./pages/dashboard/RegisterUser";
import AllUsers from "./pages/dashboard/AllUsers";

// --- Other Dashboards ---
import DistributorDashboard from "./pages/dashboard/DistributorDashboard";
import WarehouseDashboard from "./pages/dashboard/WarehouseDashboard";
import WholesalerDashboard from "./pages/dashboard/WholesalerDashboard";
import ShopkeeperDashboard from "./pages/dashboard/ShopkeeperDashboard";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";

// ================================================================
// PUBLIC LAYOUT (Navbar + Footer)
// ================================================================
const PublicLayout = () => (
  <>
    <Navbar />
    <main style={{ minHeight: "80vh" }}>
      <Outlet />
    </main>
    <Footer />
  </>
);

// ================================================================
// DASHBOARD LAYOUT (Sidebar + Topbar)
// ================================================================
const DashboardWrapper = () => (
  <DashboardLayout>
    <Outlet />
  </DashboardLayout>
);

// ================================================================
// REDIRECTION BASED ON ROLE
// ================================================================
function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  const redirectToDashboard = () => {
    if (!user) return "/login";

    switch (user.role) {
      case "drap": return "/dashboard/drap";
      case "manufacturer": return "/dashboard/manufacturer";
      case "distributor": return "/dashboard/distributor";
      case "warehouse": return "/dashboard/warehouse";
      case "wholesaler": return "/dashboard/wholesaler";
      case "shopkeeper": return "/dashboard/shopkeeper";
      case "customer": return "/dashboard/customer";
      default: return "/login";
    }
  };

  return (
    <Routes>
      {/* ---------------- PUBLIC ROUTES ---------------- */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="howitworks" element={<HowItWorks />} />
        <Route path="traceability" element={<Traceability />} />
        <Route path="anticounterfeit" element={<AntiCounterfeit />} />
        <Route path="supplychain" element={<SupplyChain />} />
        <Route path="pharmaindustry" element={<PharmaIndustry />} />
        <Route path="login" element={<Login />} />
      </Route>

      {/* ---------------- DASHBOARD ROUTES ---------------- */}
      <Route path="dashboard" element={<DashboardWrapper />}>
        {/* Default redirect to correct dashboard based on role */}
        <Route index element={<Navigate to={redirectToDashboard()} />} />

        {/* DRAP ROUTES */}
        <Route path="drap" element={<DRAPDashboard />} />
        <Route path="register-user" element={<RegisterUser />} />
        <Route path="all-users" element={<AllUsers />} />

        {/* MANUFACTURER ROUTES */}
        <Route path="manufacturer" element={<ManufacturerDashboard />} />
        <Route path="manufacturer/create-batch" element={<CreateBatch />} />
        <Route path="manufacturer/create-shipment" element={<CreateShipment />} />
        <Route path="manufacturer/view-batches" element={<ViewBatches />} />
        <Route path="manufacturer/transfer-history" element={<TransferHistory />} />
        <Route path="manufacturer/verify-blockchain" element={<VerifyBlockchain />} />
        <Route path="manufacturer/analytics" element={<Analytics />} />
        <Route path="manufacturer/profile" element={<Profile />} />

        {/* OTHER USER ROLES */}
        <Route path="distributor" element={<DistributorDashboard />} />
        <Route path="warehouse" element={<WarehouseDashboard />} />
        <Route path="wholesaler" element={<WholesalerDashboard />} />
        <Route path="shopkeeper" element={<ShopkeeperDashboard />} />
        <Route path="customer" element={<CustomerDashboard />} />
      </Route>

      {/* ---------------- 404 ROUTE ---------------- */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
