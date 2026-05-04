import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { Users, ShieldAlert, Activity, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/admin/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-20"><Loader2 className="animate-spin text-[#1dbf73] mx-auto" size={40}/></div>;

  const stats = data?.counts || {};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#404145]">Platform Overview</h2>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
           <Activity className="text-green-500 animate-pulse" size={14}/>
           <span className="text-[10px] font-black text-[#404145] uppercase tracking-wider">Live System Monitor</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#404145] text-white">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"><Users size={14}/> Total Pengguna</h3>
          <p className="text-3xl font-black mt-2">{stats.total_users || 0}</p>
          <div className="flex gap-4 mt-2 text-[10px] font-bold text-gray-400">
            <span>{stats.total_brands || 0} Brands</span>
            <span>{stats.total_creators || 0} Creators</span>
          </div>
        </Card>
        
        <Card>
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"><Activity size={14}/> Campaign & Views</h3>
          <p className="text-2xl font-black text-[#404145] mt-1">{stats.total_campaigns || 0}</p>
          <p className="text-[10px] text-[#1dbf73] font-black mt-1 uppercase tracking-tight">{data.total_views?.toLocaleString('id-ID') || 0} TOTAL VIEWS VALID</p>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"><ShieldAlert size={14}/> Pending Review</h3>
          <p className="text-2xl font-black text-orange-600 mt-1">{stats.pending_kyc || 0}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">VERIFIKASI KYC ANTRI</p>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-2"><ShieldAlert size={14}/> Pending Payout</h3>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.pending_withdrawals || 0}</p>
          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">ANTRIAN PENARIKAN DANA</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-black text-xs text-[#404145] mb-4 flex items-center gap-2 uppercase tracking-widest"><Activity size={14} className="text-[#1dbf73]"/> Aktivitas Sistem Terbaru</h3>
        <div className="space-y-4">
          {(data?.recent_logs || []).map((log, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-bold text-xs text-[#404145] uppercase tracking-tighter">{log.action?.replace(/_/g, ' ')}</p>
                <p className="text-[10px] text-gray-500 font-medium">Actor ID: {log.actor_id || 'SYSTEM'}</p>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase">{new Date(log.created_at).toLocaleString('id-ID')}</span>
            </div>
          ))}
          {(!data?.recent_logs || data.recent_logs.length === 0) && (
            <p className="text-center py-10 text-[10px] font-bold text-gray-400 uppercase">Belum ada aktivitas tercatat</p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;