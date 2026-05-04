// --- src/pages/finance/FinanceDashboard.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { DollarSign, AlertCircle, BarChart2 } from 'lucide-react';

const FinanceDashboard = () => {
  const [metrics, setMetrics] = useState({ gmv: 0, revenue: 0, pendingWd: 0 });
  const [recentWd, setRecentWd] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [gmvRes, revRes, wdRes, recentRes] = await Promise.all([
          fetchApi('/finance/reports/gmv'),
          fetchApi('/finance/reports/revenue'),
          fetchApi('/finance/withdrawals/pending'),
          fetchApi('/finance/withdrawals/recent')
        ]);
        
        setMetrics({
          gmv: gmvRes.data?.total_gmv || 0,
          revenue: revRes.data?.platform_revenue || 0,
          pendingWd: wdRes.data?.length || 0
        });
        setRecentWd(recentRes.data || []);
      } catch (err) {
        console.error("Gagal memuat data finance:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PROCESSED': case 'APPROVED': return 'text-green-500';
      case 'QUEUED': case 'PROCESSING': return 'text-orange-500';
      case 'FAILED': case 'REJECTED': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PROCESSED': return 'Selesai';
      case 'APPROVED': return 'Disetujui';
      case 'QUEUED': return 'Pending Review';
      case 'PROCESSING': return 'Diproses';
      case 'FAILED': return 'Gagal';
      case 'REJECTED': return 'Ditolak';
      default: return status;
    }
  };

  if (loading) return <div className="text-center py-10 text-[#7a7d85]">Memuat Data Keuangan...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Finance Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#404145] text-white">
          <h3 className="text-gray-300 font-semibold text-sm flex items-center gap-2"><BarChart2 size={16}/> Gross Merchandise Value (GMV)</h3>
          <p className="text-3xl font-black mt-2">Rp {metrics.gmv.toLocaleString('id-ID')}</p>
          <p className="text-xs text-gray-400 mt-1">Total perputaran dana sukses</p>
        </Card>
        <Card>
          <h3 className="text-[#7a7d85] font-semibold text-sm flex items-center gap-2"><DollarSign size={16}/> Estimasi Revenue (5%)</h3>
          <p className="text-3xl font-black text-[#1dbf73] mt-2">Rp {metrics.revenue.toLocaleString('id-ID')}</p>
          <p className="text-xs text-[#7a7d85] mt-1">Pendapatan kotor platform</p>
        </Card>
        <Card className={metrics.pendingWd > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <h3 className="text-[#7a7d85] font-semibold text-sm flex items-center gap-2">
            <AlertCircle size={16} className={metrics.pendingWd > 0 ? "text-orange-500" : ""}/> Review Penarikan
          </h3>
          <p className="text-3xl font-black text-[#404145] mt-2">{metrics.pendingWd} Antrean</p>
          <p className="text-xs text-[#7a7d85] mt-1">Menunggu persetujuan manual</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2"><DollarSign size={18}/> Status Penarikan Terakhir</h3>
        <div className="space-y-4">
          {recentWd.length === 0 ? (
            <p className="text-center py-10 text-gray-400 italic text-sm">Belum ada aktivitas penarikan.</p>
          ) : recentWd.map((wd, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-semibold text-sm text-[#404145] truncate max-w-[200px]">
                  {wd.creators?.nama_lengkap || 'Unknown Creator'}
                </p>
                <p className="text-[10px] text-gray-400 font-mono">ID: {wd.withdrawal_id?.substring(0, 8)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#404145]">Rp {Number(wd.amount).toLocaleString('id-ID')}</p>
                <p className={`text-[10px] font-bold uppercase ${getStatusColor(wd.status)}`}>
                  {getStatusLabel(wd.status)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FinanceDashboard;