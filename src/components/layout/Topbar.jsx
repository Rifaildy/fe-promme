import React, { useState, useEffect, useRef } from 'react';
import { Bell, Menu, ChevronDown, Settings, LogOut, User } from 'lucide-react';
import Button from '../ui/Button';
import { fetchApi } from '../../utils/api';

const Topbar = ({ user, toggleSidebar, onNavigate, onLogout }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [profileName, setProfileName] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (!user) return;
      try {
        const res = await fetchApi('/auth/me');
        if (res.data) {
          setProfileImage(res.data.display_picture);
          setProfileName(res.data.display_name);
        }
      } catch (err) {
        console.error('Error fetching profile image:', err);
      }
    };

    fetchProfileImage();

    const handleProfileUpdate = () => {
      fetchProfileImage();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, [user]);

  return (
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
            <div className="flex items-center space-x-2 border-l pl-4 border-gray-200 relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 focus:outline-none hover:bg-gray-50 p-1 pr-2 rounded-full transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-[#1dbf73] text-white flex items-center justify-center font-bold overflow-hidden shadow-sm border border-gray-100">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (profileName || user.name).charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:flex flex-col justify-center text-left mr-1">
                  <p className="font-bold text-[#404145] text-sm leading-none truncate max-w-[150px] mb-1">
                    {profileName || user.name}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-[#7a7d85] leading-none">
                    <span className="truncate max-w-[100px]">@{profileName?.toLowerCase().replace(/\s+/g, '') || user.name}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="capitalize text-[#1dbf73] font-bold">{user.role}</span>
                  </div>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 md:hidden">
                    <p className="font-bold text-[#404145] text-sm truncate">{profileName || user.name}</p>
                    <p className="text-xs text-[#7a7d85]">@{user.name}</p>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      onNavigate(user.role === 'admin' ? 'dashboard/admin-settings' : user.role === 'finance' ? 'dashboard/finance-settings' : 'dashboard/settings');
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#404145] hover:bg-gray-50 font-medium flex items-center gap-3 transition-colors"
                  >
                    <Settings size={16} className="text-gray-400" />
                    Pengaturan Profil
                  </button>
                  
                  <div className="my-1 border-t border-gray-50"></div>
                  
                  <button 
                    onClick={() => {
                      setDropdownOpen(false);
                      if(onLogout) onLogout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-bold flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={16} />
                    Log Out
                  </button>
                </div>
              )}
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
};

export default Topbar;