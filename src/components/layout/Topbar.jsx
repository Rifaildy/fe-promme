import React from 'react';
import { Bell, Menu } from 'lucide-react';
import Button from '../ui/Button';

const Topbar = ({ user, toggleSidebar, onNavigate }) => (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          {user && (
            <button onClick={toggleSidebar} className="mr-4 text-[#7a7d85] lg:hidden">
              <Menu size={24} />
            </button>
          )}
          <span 
            onClick={() => onNavigate('landing')}
            className="text-2xl font-black text-[#404145] tracking-tight cursor-pointer"
          >
            Promme<span className="text-[#1dbf73]">.</span>
          </span>
        </div>
        {user ? (
          <div className="flex items-center space-x-4">
            <button className="text-[#7a7d85] hover:text-[#1dbf73]"><Bell size={20} /></button>
            <div className="flex items-center space-x-2 border-l pl-4 border-gray-200">
              <div className="h-9 w-9 rounded-full bg-[#1dbf73] text-white flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-bold text-[#404145] leading-tight">{user.name}</p>
                <p className="text-xs text-[#7a7d85] capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <button onClick={() => onNavigate('login')} className="text-[#7a7d85] font-semibold hover:text-[#1dbf73] text-sm">Sign In</button>
            <Button onClick={() => onNavigate('register')} variant="outline" className="py-2">Join</Button>
          </div>
        )}
      </div>
    </div>
  </nav>
);

export default Topbar;