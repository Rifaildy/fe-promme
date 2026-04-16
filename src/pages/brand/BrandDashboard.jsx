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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Campaign Aktif</h3><p className="text-3xl font-black text-[#404145] mt-2">{data?.total_campaigns || 0}</p></Card>
        <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Total Budget</h3><p className="text-3xl font-black text-[#404145] mt-2">Rp {data?.total_budget?.toLocaleString('id-ID') || 0}</p></Card>
        <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Budget Terpakai</h3><p className="text-3xl font-black text-[#1dbf73] mt-2">Rp {data?.total_terpakai?.toLocaleString('id-ID') || 0}</p></Card>
        <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Total Views (Valid)</h3><p className="text-3xl font-black text-[#404145] mt-2">{data?.total_views_tervalidasi || 0}</p></Card>
      </div>
      <Card>
        <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2"><BarChart2 size={18}/> Statistik Performa</h3>
        <p className="text-[#7a7d85] text-sm">Saat ini terdapat {data?.total_submissions || 0} konten yang telah dikirimkan oleh para kreator.</p>
      </Card>
    </div>
  );
};

export default BrandDashboard;