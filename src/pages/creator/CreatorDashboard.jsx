import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { Wallet, ShieldCheck, Clock, Loader2 } from 'lucide-react';

const CreatorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/creators/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20"><Loader2 className="animate-spin text-[#1dbf73] mx-auto" size={40}/></div>;

  const stats = data || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#404145]">Workspace Creator</h2>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
           <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
           <span className="text-[10px] font-black text-[#404145] uppercase">Live Overview</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#404145] text-white">
          <h3 className="text-gray-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"><Wallet size={14}/> Saldo Aktif</h3>
          <p className="text-2xl font-black mt-1">Rp {stats.active_balance?.toLocaleString('id-ID') || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"><Clock size={14}/> Pendapatan Pending</h3>
          <p className="text-2xl font-black text-[#404145] mt-1">Rp {stats.pending_payout?.toLocaleString('id-ID') || 0}</p>
        </Card>
        <Card>
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"><ShieldCheck size={14}/> Total Konten</h3>
          <p className="text-2xl font-black text-[#404145] mt-1">{stats.total_submissions || 0}</p>
          <div className="flex gap-2 mt-1 text-[9px] font-black uppercase">
            <span className="text-green-500">{stats.approved_submissions || 0} OK</span>
            <span className="text-orange-500">{stats.pending_submissions || 0} WAIT</span>
          </div>
        </Card>
        <Card>
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">Total Views</h3>
          <p className="text-2xl font-black text-[#1dbf73] mt-1">{stats.total_views?.toLocaleString('id-ID') || 0}</p>
          <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase">{stats.total_joined_campaigns || 0} CAMPAIGN DIIKUTI</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-[#404145] mb-2">Tips Hari Ini</h3>
          <p className="text-[#7a7d85] text-sm">Pastikan akun sosial media Anda sudah tertaut dan status KYC 'VERIFIED' agar bisa menarik dana tanpa kendala.</p>
        </Card>
        
        <Card>
          <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">Peluang Campaign Terpopuler</h3>
          <div className="space-y-3">
            {[
              { brand: 'Skincare Glow', platform: 'TikTok', budget: 'Rp 2.000 / 1k view' },
              { brand: 'Tech Gadget', platform: 'YouTube', budget: 'Rp 5.000 / 1k view' }
            ].map((camp, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-semibold text-sm text-[#404145]">{camp.brand}</p>
                  <p className="text-xs text-blue-500 font-medium">{camp.platform}</p>
                </div>
                <span className="text-xs font-bold text-[#1dbf73]">{camp.budget}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreatorDashboard;