// src/App.js - UPDATED WITH MANUFACTURER NOTIFICATIONS ROUTE
import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";

// Layout components
import Navbar from "./components/NavbarComp";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

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

// Dashboards
import ManufacturerDashboard from "./pages/dashboard/manufacturer/ManufacturerDashboard";
import DistributorDashboard from "./pages/dashboard/distributor/DistributorDashboard";
import WarehouseDashboard from "./pages/dashboard/warehouse/WarehouseDashboard";
import WholesalerDashboard from "./pages/dashboard/wholesaler/WholesalerDashboard";

// DRAP pages
import RegisterUsers from './pages/dashboard/drap/RegisterUsers';
import ReportDetail from "./pages/dashboard/drap/ReportDetail";

// Manufacturer pages
import ViewBatches from "./pages/dashboard/manufacturer/ViewBatches";
import BatchDetails from "./pages/dashboard/manufacturer/BatchDetails";
import TransferBatch from "./pages/dashboard/manufacturer/TransferBatch";
import ViewTransfers from "./pages/dashboard/manufacturer/ViewTransfers";
import ManufacturerNotifications from "./pages/dashboard/manufacturer/ManufacturerNotifications"; // NEW
import VerifyBlockchain from "./pages/dashboard/manufacturer/VerifyBlockchain";
import Analytics from "./pages/dashboard/manufacturer/Analytics";

// DISTRIBUTOR PAGES
import IncomingBatches from "./pages/dashboard/distributor/IncomingBatches";
import DistributorInventory from "./pages/dashboard/distributor/DistributorInventory";
import DistributorNotifications from "./pages/dashboard/distributor/DistributorNotifications";
import DistributorReports from "./pages/dashboard/distributor/DistributorReports";
import DistributorVerifyBatch from "./pages/dashboard/distributor/DistributorVerifyBatch";
import ExpiryManagement from "./pages/dashboard/distributor/ExpiryManagement";
import TransferFromDistributor from "./pages/dashboard/distributor/TransferFromDistributor";
import DistributorTransferHistory from "./pages/dashboard/distributor/DistributorTransferHistory";

// WAREHOUSE PAGES
import WarehouseIncomingBatches from "./pages/dashboard/warehouse/IncomingBatches";
import WarehouseInventory from "./pages/dashboard/warehouse/WarehouseInventory";
import WarehouseNotifications from "./pages/dashboard/warehouse/WarehouseNotifications";
import WarehouseReports from "./pages/dashboard/warehouse/WarehouseReports";
import WarehouseVerifyBatch from "./pages/dashboard/warehouse/VerifyBatch";
import WarehouseExpiryManagement from "./pages/dashboard/warehouse/ExpiryManagement";
import TransferFromWarehouse from "./pages/dashboard/warehouse/TransferToWholesaler";
import WarehouseTransferHistory from "./pages/dashboard/warehouse/WarehouseTransferHistory";

// DRAP Components (ALL PAGES)
import DrapLayout from "./components/drap/DrapLayout";
import DrapDashboard from "./pages/dashboard/drap/Dashboard";
import Manufacturers from "./pages/dashboard/drap/Manufacturers";
import ManufacturerDetail from "./pages/dashboard/drap/ManufacturerDetail";
import Batches from "./pages/dashboard/drap/Batches";
import BatchDetail from "./pages/dashboard/drap/BatchDetail";
import SupplyChainView from "./pages/dashboard/drap/SupplyChain";
import DrapAnalytics from "./pages/dashboard/drap/Analytics";
import DrapNotifications from "./pages/dashboard/drap/Notifications";
import AuditLogs from "./pages/dashboard/drap/AuditLogs";
import Distributors from "./pages/dashboard/drap/Distributors";
import Warehouses from "./pages/dashboard/drap/Warehouses";
import Wholesalers from "./pages/dashboard/drap/Wholesalers";
import Shopkeepers from "./pages/dashboard/drap/Shopkeepers";
import SystemHealth from "./pages/dashboard/drap/SystemHealth";
import SearchBatches from "./pages/dashboard/drap/SearchBatches";
import Reports from "./pages/dashboard/drap/Reports";

// WHOLESALER PAGES
import WholesalerIncomingBatches from "./pages/dashboard/wholesaler/IncomingBatches";
import WholesalerInventory from "./pages/dashboard/wholesaler/WholesalerInventory";
import WholesalerNotifications from "./pages/dashboard/wholesaler/WholesalerNotifications";
import WholesalerReports from "./pages/dashboard/wholesaler/WholesalerReports";
import WholesalerVerifyBatch from "./pages/dashboard/wholesaler/VerifyBatch";
import WholesalerExpiryManagement from "./pages/dashboard/wholesaler/ExpiryManagement";
import TransferFromWholesaler from "./pages/dashboard/wholesaler/TransferToShopkeeper";
import WholesalerTransferHistory from "./pages/dashboard/wholesaler/WholesalerTransferHistory";

// SHOPKEEPER PAGES
import ShopkeeperDashboard from "./pages/dashboard/shopkeeper/ShopkeeperDashboard";
import ShopkeeperInventory from "./pages/dashboard/shopkeeper/ShopkeeperInventory";
import ShopkeeperIncoming from "./pages/dashboard/shopkeeper/ShopkeeperIncoming";
import ShopkeeperSell from "./pages/dashboard/shopkeeper/ShopkeeperSell";
import ShopkeeperSalesHistory from "./pages/dashboard/shopkeeper/ShopkeeperSalesHistory";
import ShopkeeperTransferHistory from "./pages/dashboard/shopkeeper/ShopkeeperTransferHistory";
import ShopkeeperReports from "./pages/dashboard/shopkeeper/ShopkeeperReports";
import ShopkeeperVerification from "./pages/dashboard/shopkeeper/ShopkeeperVerify";
import ShopkeeperNotifications from "./pages/dashboard/shopkeeper/ShopkeeperNotifications";

// Layouts
const Layout = () => (
  <>
    <Navbar />
    <main style={{ minHeight: "80vh" }}>
      <Outlet />
    </main>
    <Footer />
  </>
);

const DashboardLayout = () => <Outlet />;

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  const redirectToDashboard = () => {
    if (!user || !user.role) return "/login";

    switch (user.role.toLowerCase()) {
      case "drap":
      case "drap_admin":
        return "/dashboard/drap";
      case "manufacturer":
        return "/dashboard/manufacturer";
      case "distributor":
        return "/dashboard/distributor";
      case "warehouse":
        return "/dashboard/warehouse";
      case "wholesaler":
        return "/dashboard/wholesaler";
      case "shopkeeper":
        return "/dashboard/shopkeeper";
      case "customer":
        return "/dashboard/customer";
      default:
        return "/login";
    }
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="howitworks" element={<HowItWorks />} />
        <Route path="traceability" element={<Traceability />} />
        <Route path="anticounterfeit" element={<AntiCounterfeit />} />
        <Route path="supplychain" element={<SupplyChain />} />
              <Route path="/login" element={<Login />} />

        <Route path="pharmaindustry" element={<PharmaIndustry />} />
      </Route>

      {/* <Route path="/login" element={<Login />} /> */}

      {/* Dashboard routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route
          index
          element={<Navigate to={redirectToDashboard()} replace />}
        />

        {/* ============================================ */}
        {/* ✅ DRAP ADMIN ROUTES - ALL PROTECTED */}
        {/* ============================================ */}
        <Route
          path="drap"
          element={
            <ProtectedRoute allowedRoles={["drap", "drap_admin"]}>
              <DrapLayout />
            </ProtectedRoute>
          }
        >
          {/* ✅ All nested routes automatically protected */}
          <Route index element={<DrapDashboard />} />
          
          {/* Manufacturers */}
          <Route path="manufacturers" element={<Manufacturers />} />
          <Route path="manufacturers/:id" element={<ManufacturerDetail />} />
          
          {/* Batches */}
          <Route path="batches" element={<Batches />} />
          <Route path="batches/:batchId" element={<BatchDetail />} />
          
          {/* User Management */}
          <Route path="register-users" element={<RegisterUsers />} />
          
          {/* Supply Chain */}
          <Route path="supply-chain" element={<SupplyChainView />} />
          <Route path="distributors" element={<Distributors />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="wholesalers" element={<Wholesalers />} />
          <Route path="shopkeepers" element={<Shopkeepers />} />
          
          {/* Reports & Analytics */}
          <Route path="analytics" element={<DrapAnalytics />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:reportId" element={<ReportDetail />} />
          
          {/* System */}
          <Route path="notifications" element={<DrapNotifications />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="search" element={<SearchBatches />} />
          <Route path="system-health" element={<SystemHealth />} />
        </Route>

        {/* ============================================ */}
        {/* MANUFACTURER ROUTES */}
        {/* ============================================ */}
        <Route
          path="manufacturer"
          element={
            <ProtectedRoute allowedRoles={["manufacturer"]}>
              <ManufacturerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="manufacturer/batches"
          element={
            <ProtectedRoute allowedRoles={["manufacturer"]}>
              <ViewBatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="manufacturer/batch/:batchId"
          element={
            <ProtectedRoute allowedRoles={["manufacturer"]}>
              <BatchDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="manufacturer/transfer"
          element={
            <ProtectedRoute allowedRoles={["manufacturer"]}>
              <TransferBatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="manufacturer/viewTransfers"
          element={
            <ProtectedRoute allowedRoles={["manufacturer"]}>
              <ViewTransfers />
            </ProtectedRoute>
          }
        />
        {/* ✅ NEW NOTIFICATIONS ROUTE */}
        <Route
          path="manufacturer/notifications"
          element={
            <ProtectedRoute allowedRoles={["manufacturer"]}>
              <ManufacturerNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="manufacturer/verify"
          element={
            <ProtectedRoute allowedRoles={["manufacturer"]}>
              <VerifyBlockchain />
            </ProtectedRoute>
          }
        />
        <Route
          path="manufacturer/analytics"
          element={
            <ProtectedRoute allowedRoles={["manufacturer"]}>
              <Analytics />
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* DISTRIBUTOR ROUTES */}
        {/* ============================================ */}
        <Route
          path="distributor"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="distributor/incoming"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <IncomingBatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="distributor/inventory"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="distributor/verify"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorVerifyBatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="distributor/transfer"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <TransferFromDistributor />
            </ProtectedRoute>
          }
        />
        <Route
          path="distributor/expiry"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <ExpiryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="distributor/notifications"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="distributor/reports"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="distributor/history-transfer"
          element={
            <ProtectedRoute allowedRoles={["distributor"]}>
              <DistributorTransferHistory />
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* WAREHOUSE ROUTES */}
        {/* ============================================ */}
        <Route
          path="warehouse"
          element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <WarehouseDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouse/incoming"
          element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <WarehouseIncomingBatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouse/inventory"
          element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <WarehouseInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouse/verify"
          element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <WarehouseVerifyBatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouse/transfer"
          element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <TransferFromWarehouse />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouse/expiry"
          element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <WarehouseExpiryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouse/notifications"
          element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <WarehouseNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouse/reports"
          element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <WarehouseReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="warehouse/history-transfer"
          element={
            <ProtectedRoute allowedRoles={["warehouse"]}>
              <WarehouseTransferHistory />
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* WHOLESALER ROUTES */}
        {/* ============================================ */}
        <Route
          path="wholesaler"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="wholesaler/incoming"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerIncomingBatches />
            </ProtectedRoute>
          }
        />
        <Route
          path="wholesaler/inventory"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="wholesaler/verify"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerVerifyBatch />
            </ProtectedRoute>
          }
        />
        <Route
          path="wholesaler/transfer"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <TransferFromWholesaler />
            </ProtectedRoute>
          }
        />
        <Route
          path="wholesaler/expiry"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerExpiryManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="wholesaler/notifications"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="wholesaler/reports"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="wholesaler/history-transfer"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <WholesalerTransferHistory />
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* SHOPKEEPER ROUTES */}
        {/* ============================================ */}
        <Route
          path="shopkeeper"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <ShopkeeperDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="shopkeeper/inventory"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <ShopkeeperInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="shopkeeper/incoming"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <ShopkeeperIncoming />
            </ProtectedRoute>
          }
        />
        <Route
          path="shopkeeper/sell"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <ShopkeeperSell />
            </ProtectedRoute>
          }
        />
        <Route
          path="shopkeeper/sales-history"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <ShopkeeperSalesHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="shopkeeper/transfer-history"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <ShopkeeperTransferHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="shopkeeper/reports"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <ShopkeeperReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="shopkeeper/notifications"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <ShopkeeperNotifications />
            </ProtectedRoute>
          }
        />
        <Route
          path="shopkeeper/verify"
          element={
            <ProtectedRoute allowedRoles={["shopkeeper"]}>
              <ShopkeeperVerification />
            </ProtectedRoute>
          }
        />

       
      </Route>

      {/* 404 - Must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;