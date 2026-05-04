// --- src/pages/brand/BrandDashboard.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { BarChart2 } from 'lucide-react';

const BrandDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/brand/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-[#7a7d85]">Memuat Ringkasan Dashboard...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Brand Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-[#404145] text-white">
          <h3 className="text-gray-300 font-semibold text-[10px] uppercase tracking-wider">Campaign Aktif</h3>
          <p className="text-2xl font-black mt-1">{data?.active_campaigns || 0} / {data?.total_campaigns || 0}</p>
        </Card>
        <Card>
          <h3 className="text-[#7a7d85] font-semibold text-[10px] uppercase tracking-wider">Total Partisipan</h3>
          <p className="text-2xl font-black text-[#404145] mt-1">{data?.total_participants || 0}</p>
        </Card>
        <Card>
          <h3 className="text-[#7a7d85] font-semibold text-[10px] uppercase tracking-wider">Konten Dikirim</h3>
          <p className="text-2xl font-black text-[#404145] mt-1">{data?.total_submissions || 0}</p>
          <p className="text-[10px] text-orange-500 font-bold mt-1">{data?.pending_submissions || 0} MENUNGGU REVIEW</p>
        </Card>
        <Card>
          <h3 className="text-[#7a7d85] font-semibold text-[10px] uppercase tracking-wider">Total Views Valid</h3>
          <p className="text-2xl font-black text-[#1dbf73] mt-1">{data?.total_views_tervalidasi?.toLocaleString('id-ID') || 0}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-full">
            <h3 className="font-black text-sm text-[#404145] mb-6 flex items-center gap-2 uppercase tracking-tight">
              <BarChart2 size={18} className="text-[#1dbf73]"/> Efisiensi Budgeting
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1">
                    <span>PEMAKAIAN BUDGET</span>
                    <span>{data?.total_budget ? Math.round((data.total_terpakai / data.total_budget) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#1dbf73] h-full" style={{ width: `${data?.total_budget ? Math.min(100, (data.total_terpakai / data.total_budget) * 100) : 0}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Terpakai</p>
                    <p className="text-xl font-black text-[#404145]">Rp {data?.total_terpakai?.toLocaleString('id-ID') || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Sisa Saldo</p>
                    <p className="text-sm font-bold text-gray-600">Rp {(data?.total_budget - data?.total_terpakai)?.toLocaleString('id-ID') || 0}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                 <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Cost Per 1k View (Avg)</p>
                 <p className="text-3xl font-black text-[#404145]">Rp {data?.total_views_tervalidasi > 0 ? Math.round(data.total_terpakai / (data.total_views_tervalidasi / 1000)).toLocaleString('id-ID') : 0}</p>
                 <p className="text-[9px] text-[#7a7d85] mt-1">Efisiensi iklan Anda saat ini sangat optimal</p>
              </div>
            </div>
          </Card>
        </div>
        
        <Card className="h-full">
           <h3 className="font-black text-sm text-[#404145] mb-4 uppercase tracking-tight">Status Campaign</h3>
           <div className="space-y-3">
             {data?.campaign_details?.slice(0, 5).map((camp, idx) => (
               <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs text-[#404145] truncate">{camp.nama_campaign || `Campaign #${idx+1}`}</p>
                    <div className="flex gap-2 items-center mt-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${camp.status === 'AKTIF' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{camp.status}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-black text-[#1dbf73]">{Math.round((camp.budget_terpakai / camp.budget_total) * 100)}%</p>
                  </div>
               </div>
             ))}
             {(!data?.campaign_details || data.campaign_details.length === 0) && (
               <p className="text-center py-10 text-[10px] font-bold text-gray-400 uppercase">Belum ada campaign</p>
             )}
           </div>
        </Card>
      </div>
      <Card>
        <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2"><BarChart2 size={18}/> Statistik Performa</h3>
        <p className="text-[#7a7d85] text-sm mb-4">Saat ini terdapat {data?.total_submissions || 0} konten yang telah dikirimkan oleh para kreator.</p>
        
        <div className="space-y-4 border-t border-gray-100 pt-4 mt-4">
          <h4 className="font-semibold text-sm text-[#404145]">Aktivitas Creator Terbaru</h4>
          {[
            { name: 'Siska Edit', action: 'Submit Konten (TikTok)', status: 'Menunggu Review', color: 'text-orange-500' },
            { name: 'Bagas Review', action: 'Submit Konten (Instagram)', status: 'Disetujui', color: 'text-green-500' }
          ].map((log, idx) => (
            <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
              <div>
                <p className="font-semibold text-sm text-[#404145]">{log.name}</p>
                <p className="text-xs text-gray-500">{log.action}</p>
              </div>
              <span className={`text-[10px] font-bold uppercase ${log.color}`}>{log.status}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default BrandDashboard;