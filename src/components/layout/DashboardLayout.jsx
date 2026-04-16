// --- src/components/layout/DashboardLayout.jsx ---
import React, { useState } from 'react';
import { 
  LayoutDashboard, Users, Wallet, ShieldAlert, FileText, CheckCircle, LogOut 
} from 'lucide-react';
import Topbar from './Topbar';

const DashboardLayout = ({ user, onLogout, activeView, setActiveView, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getMenuByRole = () => {
    switch(user?.role) {
      case 'brand': return [
        { icon: LayoutDashboard, label: 'Workspace' }, 
        { icon: Users, label: 'Find Creators' }, 
        { icon: Wallet, label: 'Billing' }
      ];
      case 'creator': return [
        { icon: LayoutDashboard, label: 'Workspace' }, 
        { icon: CheckCircle, label: 'Submissions' },
        { icon: Wallet, label: 'My Wallet' }
      ];
      case 'admin': return [
        { icon: LayoutDashboard, label: 'Dashboard' }, 
        { icon: Users, label: 'User Management' }, 
        { icon: ShieldAlert, label: 'Fraud Ops' }
      ];
      case 'finance': return [
        { icon: LayoutDashboard, label: 'Dashboard' }, 
        { icon: Wallet, label: 'Withdrawals' }, 
        { icon: FileText, label: 'Tax & Reports' }
      ];
      default: return [];
    }
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-[#f7f7f7]">
      <Topbar user={user} onLogout={onLogout} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onNavigate={setActiveView} />
      <div className="flex-1 flex overflow-hidden w-full max-w-[1440px] mx-auto relative">
        
        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
        
        {/* Sidebar */}
        <aside className={`absolute lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 flex flex-col h-[calc(100vh-64px)] ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {getMenuByRole().map((item, idx) => (
              <button key={idx} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-semibold ${idx === 0 ? 'bg-[#e8f9f0] text-[#1dbf73]' : 'text-[#7a7d85] hover:bg-gray-50 hover:text-[#404145]'}`}>
                <item.icon size={20} /><span>{item.label}</span>
              </button>
            ))}
          </div>
          <div className="p-4 border-t border-gray-200 bg-white">
            <button onClick={onLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-500 font-semibold hover:bg-red-50 transition-colors">
              <LogOut size={20} /><span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto w-full h-[calc(100vh-64px)]">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;