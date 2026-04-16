// --- src/components/layout/DashboardLayout.jsx ---
import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Wallet, ShieldAlert, FileText, CheckCircle, LogOut, List, Settings
} from 'lucide-react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Topbar from './Topbar';

const DashboardLayout = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuByRole = () => {
    switch(user?.role) {
      case 'brand': return [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: List, label: 'Campaigns', path: '/dashboard/campaigns' },
        { icon: Settings, label: 'Profil Brand', path: '/dashboard/profile' }
      ];
      case 'creator': return [
        { icon: LayoutDashboard, label: 'Workspace', path: '/dashboard' }, 
        { icon: CheckCircle, label: 'Submissions', path: '/dashboard/submissions' },
        { icon: Wallet, label: 'My Wallet', path: '/dashboard/wallet' }
      ];
      default: return [];
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#f7f7f7]">
      <Topbar user={user} onNavigate={(path) => navigate(`/${path}`)} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex overflow-hidden w-full max-w-[1440px] mx-auto relative">
        {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
        
        <aside className={`absolute lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 flex flex-col h-[calc(100vh-64px)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {getMenuByRole().map((item, idx) => {
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
              return (
                <button 
                  key={idx} 
                  onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-semibold transition-colors ${isActive ? 'bg-[#e8f9f0] text-[#1dbf73]' : 'text-[#7a7d85] hover:bg-gray-50 hover:text-[#404145]'}`}
                >
                  <item.icon size={20} /><span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="p-4 border-t border-gray-200 bg-white">
            <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-500 font-semibold hover:bg-red-50 transition-colors">
              <LogOut size={20} /><span>Log Out</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-y-auto w-full h-[calc(100vh-64px)]">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;