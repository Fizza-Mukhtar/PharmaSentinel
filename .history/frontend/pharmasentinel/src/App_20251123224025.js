// src/App.js
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Components
import Navbar from "./components/NavbarComp";
import Footer from "./components/Footer";

// Public pages
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
import AllUsers from "./pages/dashboard/AllUsers";


// Dashboards
import DRAPDashboard from "./pages/dashboard/DRAPDashboard";
import ManufacturerDashboard from "./pages/dashboard/ManufacturerDashboard";
import DistributorDashboard from "./pages/dashboard/DistributorDashboard";
import WarehouseDashboard from "./pages/dashboard/WarehouseDashboard";
import WholesalerDashboard from "./pages/dashboard/WholesalerDashboard";
import ShopkeeperDashboard from "./pages/dashboard/ShopkeeperDashboard";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";

// DRAP - Register User Page
import RegisterUser from "./pages/dashboard/RegisterUser";

// Layout component (Navbar + Page + Footer)
const Layout = () => (
  <>
    <Navbar />
    <main style={{ minHeight: "80vh" }}>
      <Outlet />
    </main>
    <Footer />
  </>
);

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
      {/* Wrap all routes with Layout */}
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="howitworks" element={<HowItWorks />} />
        <Route path="traceability" element={<Traceability />} />
        <Route path="anticounterfeit" element={<AntiCounterfeit />} />
        <Route path="supplychain" element={<SupplyChain />} />
        <Route path="pharmaindustry" element={<PharmaIndustry />} />
        <Route path="login" element={<Login />} />

        {/* Dashboards */}
        <Route path="dashboard/drap" element={<DRAPDashboard />} />
        <Route path="dashboard/manufacturer" element={<ManufacturerDashboard />} />
        <Route path="dashboard/distributor" element={<DistributorDashboard />} />
        <Route path="dashboard/warehouse" element={<WarehouseDashboard />} />
        <Route path="dashboard/wholesaler" element={<WholesalerDashboard />} />
        <Route path="dashboard/shopkeeper" element={<ShopkeeperDashboard />} />
        <Route path="dashboard/customer" element={<CustomerDashboard />} />

        {/* DRAP: Register New User */}
        <Route path="dashboard/register-user" element={<RegisterUser />} />

        <Route path="/dashboard/all-users" element={<AllUsers />} />


        {/* Default dashboard redirect */}
        <Route path="dashboard" element={<Navigate to={redirectToDashboard()} />} />

        {/* 404 page */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
