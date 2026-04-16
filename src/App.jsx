import React, { useState } from 'react';
import { 
  Home, Briefcase, Wallet, Users, LogOut, Menu, 
  Search, LayoutDashboard, Settings, Bell, Plus, 
  MapPin, Clock, DollarSign, ChevronRight
} from 'lucide-react';

// --- GLOBAL RESET UNTUK OVERRIDE VITE DEFAULT CSS ---
// Ini akan memastikan tampilan full width menutupi seluruh layar browser
const GlobalReset = () => (
  <style>
    {`
      #root {
        max-width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        text-align: left !important;
        width: 100%;
      }
      body {
        margin: 0;
        padding: 0;
        width: 100%;
        overflow-x: hidden;
      }
    `}
  </style>
);

// --- MOCK DATA ---
const INITIAL_CAMPAIGNS = [
  { id: 1, title: 'Review Skincare Organik', brand: 'GlowNature', budget: 1500000, platform: 'TikTok', deadline: '2023-11-30', status: 'Active' },
  { id: 2, title: 'Unboxing Gadget Tech', brand: 'TechNova', budget: 3000000, platform: 'YouTube', deadline: '2023-12-05', status: 'Active' },
  { id: 3, title: 'Promosi Kafe Kekinian', brand: 'KopiSenja', budget: 500000, platform: 'Instagram', deadline: '2023-11-25', status: 'Draft' },
];

// --- REUSABLE COMPONENTS ---
const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "font-semibold rounded-md px-5 py-2.5 transition-all duration-200 flex items-center justify-center text-sm";
  const variants = {
    primary: "bg-[#1dbf73] text-white hover:bg-[#19a463]",
    outline: "border-2 border-[#1dbf73] text-[#1dbf73] hover:bg-[#1dbf73] hover:text-white",
    ghost: "text-[#7a7d85] hover:text-[#404145] hover:bg-gray-100",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
    {children}
  </div>
);

// --- DASHBOARD LAYOUT ---
const Topbar = ({ user, onLogout, toggleSidebar }) => (
  <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          {user && (
            <button onClick={toggleSidebar} className="mr-4 text-[#7a7d85] lg:hidden">
              <Menu size={24} />
            </button>
          )}
          <span className="text-2xl font-black text-[#404145] tracking-tight cursor-pointer">
            Promme<span className="text-[#1dbf73]">.</span>
          </span>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <button className="text-[#7a7d85] hover:text-[#1dbf73]"><Bell size={20} /></button>
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="h-9 w-9 rounded-full bg-[#1dbf73] text-white flex items-center justify-center font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-bold text-[#404145] leading-tight">{user.name}</p>
                <p className="text-xs text-[#7a7d85] capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </nav>
);

// --- BRAND VIEWS ---
const BrandDashboard = ({ campaigns }) => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[#404145]">Workspace Brand</h2>
        <Button onClick={() => setActiveTab('create')} className="gap-2"><Plus size={18}/> Buat Campaign</Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200">
        {['overview', 'campaigns', 'create'].map((tab) => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize ${activeTab === tab ? 'border-b-2 border-[#1dbf73] text-[#1dbf73]' : 'text-[#7a7d85]'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* View: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Campaign Aktif</h3><p className="text-3xl font-black text-[#404145] mt-2">{campaigns.filter(c => c.status === 'Active').length}</p></Card>
          <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Total Budget</h3><p className="text-3xl font-black text-[#404145] mt-2">Rp 4.5M</p></Card>
          <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Total Submission</h3><p className="text-3xl font-black text-[#1dbf73] mt-2">24</p></Card>
        </div>
      )}

      {/* View: Campaigns List */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50"><h3 className="font-bold text-[#404145]">Daftar Campaign</h3></div>
          <div className="divide-y divide-gray-200">
            {campaigns.map(c => (
              <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-[#404145] text-lg">{c.title}</h4>
                  <div className="flex space-x-4 text-sm text-[#7a7d85] mt-1">
                    <span className="flex items-center gap-1"><MapPin size={14}/> {c.platform}</span>
                    <span className="flex items-center gap-1"><DollarSign size={14}/> Rp {c.budget.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View: Create Campaign */}
      {activeTab === 'create' && (
        <Card className="max-w-2xl">
          <h3 className="text-lg font-bold text-[#404145] mb-4">Buat Campaign Baru</h3>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Fitur simulasi pembuatan campaign berhasil!"); setActiveTab('campaigns'); }}>
            <div><label className="block text-sm font-semibold text-[#404145] mb-1">Judul Campaign</label><input type="text" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none" placeholder="Cth: Review Produk Lipcream" required/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-[#404145] mb-1">Budget (Rp)</label><input type="number" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none" placeholder="1000000" required/></div>
              <div>
                <label className="block text-sm font-semibold text-[#404145] mb-1">Platform Utama</label>
                <select className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none">
                  <option>TikTok</option><option>Instagram</option><option>YouTube</option>
                </select>
              </div>
            </div>
            <div><label className="block text-sm font-semibold text-[#404145] mb-1">Deskripsi & Syarat</label><textarea rows="4" className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none" placeholder="Jelaskan detail yang harus dilakukan creator..."></textarea></div>
            <Button type="submit">Terbitkan Campaign</Button>
          </form>
        </Card>
      )}
    </div>
  );
};

// --- CREATOR VIEWS ---
const CreatorDashboard = ({ campaigns }) => {
  const [activeTab, setActiveTab] = useState('explore');

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-2xl font-bold text-[#404145]">Workspace Creator</h2>
      
      {/* Tabs */}
      <div className="flex space-x-6 border-b border-gray-200">
        {['explore', 'my_submissions', 'wallet'].map((tab) => (
          <button 
            key={tab} onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold capitalize ${activeTab === tab ? 'border-b-2 border-[#1dbf73] text-[#1dbf73]' : 'text-[#7a7d85]'}`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* View: Explore */}
      {activeTab === 'explore' && (
        <div>
          <div className="mb-6 flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
              <input type="text" placeholder="Cari brand atau jenis campaign..." className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.filter(c => c.status === 'Active').map(c => (
              <Card key={c.id} className="flex flex-col h-full hover:shadow-md transition-shadow group cursor-pointer">
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#1dbf73] mb-2">{c.platform}</div>
                  <h4 className="font-bold text-[#404145] text-lg leading-tight mb-1 group-hover:text-[#1dbf73] transition-colors">{c.title}</h4>
                  <p className="text-[#7a7d85] text-sm">by {c.brand}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#7a7d85]">Budget</p>
                    <p className="font-bold text-[#404145]">Rp {c.budget.toLocaleString('id-ID')}</p>
                  </div>
                  <Button onClick={() => alert(`Mengirimkan portofolio ke ${c.brand}`)}>Apply</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* View: Wallet */}
      {activeTab === 'wallet' && (
        <Card className="max-w-md mx-auto text-center py-10">
          <Wallet size={48} className="mx-auto text-[#1dbf73] mb-4" />
          <h3 className="text-[#7a7d85] font-semibold">Saldo Tersedia</h3>
          <p className="text-4xl font-black text-[#404145] mt-2 mb-6">Rp 4.250.000</p>
          <Button className="w-full justify-center">Tarik Saldo</Button>
        </Card>
      )}
    </div>
  );
};

// --- AUTH & LANDING ---
const LandingPage = ({ onNavigate }) => (
  <div className="min-h-screen bg-white flex flex-col w-full">
    <Topbar />
    <main className="flex-grow flex items-center bg-white w-full">
      <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-20 flex flex-col md:flex-row items-center justify-between">
        <div className="md:w-1/2 pr-0 md:pr-16 text-center md:text-left mb-12 md:mb-0">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-[#404145] leading-[1.1] mb-6">
            Kolaborasi <span className="text-[#1dbf73]">Cerdas</span>,<br/> Hasil <span className="text-[#1dbf73]">Maksimal</span>.
          </h1>
          <p className="text-lg md:text-xl text-[#7a7d85] mb-8 max-w-xl">
            Platform marketplace yang mempertemukan Brand dengan Content Creator profesional secara transparan dan aman.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
            <Button onClick={() => onNavigate('login')} className="text-lg px-8 py-3 w-full sm:w-auto">Login ke Promme</Button>
          </div>
        </div>
        <div className="md:w-1/2 w-full flex justify-center md:justify-end">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-lg">
            <div className="bg-[#1dbf73] p-8 rounded-3xl text-white transform md:-rotate-3 hover:rotate-0 transition-transform duration-300 shadow-xl">
              <Users size={40} className="mb-6 opacity-90" />
              <h3 className="font-bold text-2xl mb-2">10k+ Creators</h3>
              <p className="text-sm opacity-90 leading-relaxed">Siap mempromosikan produk Anda ke audiens yang tepat dan luas.</p>
            </div>
            <div className="bg-[#404145] p-8 rounded-3xl text-white transform md:translate-y-12 md:rotate-3 hover:rotate-0 transition-transform duration-300 shadow-xl mt-6 sm:mt-0">
              <Briefcase size={40} className="mb-6 opacity-90" />
              <h3 className="font-bold text-2xl mb-2">Aman & Jelas</h3>
              <p className="text-sm opacity-90 leading-relaxed">Sistem pembayaran Escrow terpercaya. Bebas penipuan.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

const LoginPage = ({ onNavigate, onLogin }) => {
  const [role, setRole] = useState('brand');

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col w-full">
      <Topbar />
      <div className="flex-1 flex items-center justify-center p-4 w-full">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#404145]">Welcome back</h2>
            <p className="text-[#7a7d85] mt-2">Pilih role untuk simulasi masuk</p>
          </div>
          <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
            {['brand', 'creator', 'admin'].map((r) => (
              <button
                key={r} onClick={() => setRole(r)}
                className={`flex-1 py-2 text-sm font-bold rounded-md capitalize transition-all ${role === r ? 'bg-white text-[#1dbf73] shadow-sm' : 'text-[#7a7d85]'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onLogin({ name: `Demo ${role}`, role }); }} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-[#404145] mb-2">Email</label>
              <input type="email" defaultValue={`hello@${role}.com`} className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none transition-shadow"/>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#404145] mb-2">Password</label>
              <input type="password" defaultValue="password123" className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none transition-shadow"/>
            </div>
            <Button type="submit" className="w-full py-3 text-lg">Sign In as {role}</Button>
            <div className="text-center text-sm text-[#7a7d85] cursor-pointer hover:underline hover:text-[#1dbf73] mt-4 transition-colors" onClick={() => onNavigate('landing')}>
              Kembali ke Halaman Utama
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [activeView, setActiveView] = useState('landing');
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);

  const handleLogin = (userData) => {
    setUser(userData);
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveView('landing');
    setIsSidebarOpen(false);
  };

  const getMenuByRole = () => {
    if(!user) return [];
    if (user.role === 'brand') return [{ icon: LayoutDashboard, label: 'Workspace' }, { icon: Users, label: 'Find Creators' }, { icon: Wallet, label: 'Billing' }];
    if (user.role === 'creator') return [{ icon: LayoutDashboard, label: 'Workspace' }, { icon: Wallet, label: 'My Wallet' }];
    return [{ icon: LayoutDashboard, label: 'Admin Panel' }];
  };

  if (activeView === 'landing') return <><GlobalReset /><LandingPage onNavigate={setActiveView} /></>;
  if (activeView === 'login') return <><GlobalReset /><LoginPage onNavigate={setActiveView} onLogin={handleLogin} /></>;

  return (
    <>
      <GlobalReset />
      <div className="min-h-screen bg-[#f7f7f7] flex flex-col font-sans w-full">
        <Topbar user={user} onLogout={handleLogout} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <div className="flex-1 flex overflow-hidden w-full max-w-[1440px] mx-auto">
          
          {/* Sidebar */}
          {isSidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static flex flex-col ${isSidebarOpen ? 'translate-x-0 pt-16 lg:pt-0' : '-translate-x-full'}`}>
            <div className="flex-1 px-4 py-6 space-y-2">
              {getMenuByRole().map((item, idx) => (
                <button key={idx} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-semibold ${idx === 0 ? 'bg-[#e8f9f0] text-[#1dbf73]' : 'text-[#7a7d85] hover:bg-gray-50 hover:text-[#404145]'}`}>
                  <item.icon size={20} /><span>{item.label}</span>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-gray-200">
              <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-red-500 font-semibold hover:bg-red-50 transition-colors">
                <LogOut size={20} /><span>Log Out</span>
              </button>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-y-auto w-full">
            {user?.role === 'brand' && <BrandDashboard campaigns={campaigns} />}
            {user?.role === 'creator' && <CreatorDashboard campaigns={campaigns} />}
            {user?.role === 'admin' && (
              <div className="text-center py-20 text-[#7a7d85]"><Settings size={48} className="mx-auto mb-4 opacity-50"/>Admin Panel dalam tahap pengembangan.</div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}