// --- src/pages/brand/BrandDashboard.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';

const BrandDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetchApi('/brand/dashboard');
        setData(response.data);
      } catch (error) {
        console.error("Gagal load dashboard brand:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center text-[#7a7d85]">Memuat data workspace...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#404145]">Workspace Brand</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Campaign Aktif</h3><p className="text-3xl font-black text-[#404145] mt-2">{data?.total_campaigns || 0}</p></Card>
        <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Total Budget (Keseluruhan)</h3><p className="text-3xl font-black text-[#404145] mt-2">Rp {data?.total_budget?.toLocaleString('id-ID') || 0}</p></Card>
        <Card><h3 className="text-[#7a7d85] font-semibold text-sm">Total Views (Tervalidasi)</h3><p className="text-3xl font-black text-[#1dbf73] mt-2">{data?.total_views_tervalidasi || 0}</p></Card>
      </div>
    </div>
  );
};

export default BrandDashboard;