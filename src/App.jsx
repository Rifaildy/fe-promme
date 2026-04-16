// --- src/App.jsx ---
import React, { useState, useEffect } from 'react';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardLayout from './components/layout/DashboardLayout'; 
import BrandDashboard from './pages/brand/BrandDashboard'; 
import CreatorDashboard from './pages/creator/CreatorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import FinanceDashboard from './pages/finance/FinanceDashboard';

export default function App() {
  const [activeView, setActiveView] = useState('landing');
  const [user, setUser] = useState(null);

  // Cek apakah user sudah login sebelumnya saat aplikasi dimuat
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const role = localStorage.getItem('user_role');
    if (token && role) {
      setUser({ role: role.toLowerCase(), name: "User" });
      setActiveView('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_role');
    setUser(null);
    setActiveView('landing');
  };

  const renderView = () => {
    switch (activeView) {
      case 'landing': return <LandingPage onNavigate={setActiveView} />;
      case 'login': return <LoginPage onNavigate={setActiveView} onLogin={handleLogin} />;
      case 'register': return <RegisterPage onNavigate={setActiveView} />;
      case 'dashboard':
        return (
          <DashboardLayout user={user} onLogout={handleLogout} activeView={activeView} setActiveView={setActiveView}>
            {user?.role === 'brand' && <BrandDashboard />}
            {user?.role === 'creator' && <CreatorDashboard />}
            {user?.role === 'admin' && <AdminDashboard />}
            {user?.role === 'finance' && <FinanceDashboard />}
          </DashboardLayout>
        );
      default: return <LandingPage onNavigate={setActiveView} />;
    }
  };

  return (
    <>
      {renderView()}
    </>
  );
}