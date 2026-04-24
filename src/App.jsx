// --- src/App.jsx ---
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// --- Pages (Auth & Landing) ---
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import OAuthCallback from './pages/OAuthCallback'; // Import halaman OAuth Callback

// --- Layouts ---
import DashboardLayout from './components/layout/DashboardLayout'; 

// --- Brand Pages ---
import BrandDashboard from './pages/brand/BrandDashboard';
import CampaignList from './pages/brand/CampaignList';
import CreateCampaign from './pages/brand/CreateCampaign';
import EditCampaign from './pages/brand/EditCampaign';
import BrandProfile from './pages/brand/BrandProfile';

//--- Creator Pages ---
import CreatorDashboard from './pages/creator/CreatorDashboard';
import ExploreCampaigns from './pages/creator/ExploreCampaigns';
import MyCampaigns from './pages/creator/MyCampaigns';
import CreatorSubmissions from './pages/creator/CreatorSubmissions';
import CreatorWallet from './pages/creator/CreatorWallet';
import CreatorSettings from './pages/creator/CreatorSettings';

// --- Admin Pages ---
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminKyc from './pages/admin/AdminKyc';
import AdminFraudOps from './pages/admin/AdminFraudOps';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

// --- Finance Pages ---
import FinanceDashboard from './pages/finance/FinanceDashboard';
import FinanceWithdrawals from './pages/finance/FinanceWithdrawals';
import FinanceReports from './pages/finance/FinanceReports';

// --- Komponen Global Reset CSS ---
const GlobalReset = () => (
  <style>
    {`
      #root { max-width: 100% !important; margin: 0 !important; padding: 0 !important; width: 100%; }
      body { margin: 0; padding: 0; width: 100%; overflow-x: hidden; background-color: #f7f7f7; }
    `}
  </style>
);

// --- Router Inti Aplikasi ---
const AppRoutes = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Cek apakah user sudah login sebelumnya (Auto-Login dari LocalStorage)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    const email = localStorage.getItem('user_email') || 'User'; 

    if (token && role) {
      setUser({ role: role.toLowerCase(), name: email.split('@')[0] });
    }
    setIsCheckingAuth(false);
  }, []);

  // Fungsi Handler
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user_email', userData.email); 
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_email');
    setUser(null);
    navigate('/login');
  };

  const handleNavigate = (path) => {
    if (path === 'landing') navigate('/');
    else navigate(`/${path}`);
  };

  if (isCheckingAuth) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7] text-[#7a7d85]">Memuat aplikasi...</div>;
  }

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
      <Route path="/login" element={<LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />} />
      <Route path="/register" element={<RegisterPage onNavigate={handleNavigate} />} />
      
      {/* --- OAuth Callback Route --- */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      
      {/* --- Protected Dashboard Routes --- */}
      <Route 
        path="/dashboard" 
        element={ 
          user ? <DashboardLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace /> 
        }
      >
        
        {/* --- Rute Khusus Role: BRAND --- */}
        {user?.role === 'brand' && (
          <>
            <Route index element={<BrandDashboard />} />
            <Route path="campaigns" element={<CampaignList />} />
            <Route path="campaigns/create" element={<CreateCampaign />} />
            <Route path="campaigns/edit/:id" element={<EditCampaign />} />
            <Route path="profile" element={<BrandProfile />} />
          </>
        )}

        {/* --- Rute Khusus Role: CREATOR  --- */}
        {user?.role === 'creator' && (
          <>
            <Route index element={<CreatorDashboard />} />
            <Route path="explore" element={<ExploreCampaigns />} />
            <Route path="my-campaigns" element={<MyCampaigns />} />
            <Route path="submissions" element={<CreatorSubmissions />} />
            <Route path="wallet" element={<CreatorWallet />} />
            <Route path="settings" element={<CreatorSettings />} />
          </>
        )}

        {/* --- Rute Khusus Role: ADMIN --- */}
        {user?.role === 'admin' && (
          <>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="kyc" element={<AdminKyc />} />
            <Route path="fraud-ops" element={<AdminFraudOps />} />
            <Route path="audit-logs" element={<AdminAuditLogs />} />
            <Route path="admin-settings" element={<AdminSettings />} />
          </>
        )}

        {/* --- Rute Khusus Role: FINANCE --- */}
        {user?.role === 'finance' && (
          <>
            <Route index element={<FinanceDashboard />} />
            <Route path="withdrawals" element={<FinanceWithdrawals />} />
            <Route path="reports" element={<FinanceReports />} />
          </>
        )}

      </Route>

      {/* Rute Catch-all jika URL tidak ditemukan */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// --- Komponen Root Pembungkus ---
export default function App() {
  return (
    <BrowserRouter>
      <GlobalReset />
      <AppRoutes />
    </BrowserRouter>
  );
}