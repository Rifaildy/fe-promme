// --- src/pages/finance/FinanceDashboard.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { DollarSign, AlertCircle, BarChart2 } from 'lucide-react';

const FinanceDashboard = () => {
  const [metrics, setMetrics] = useState({ gmv: 0, revenue: 0, pendingWd: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [gmvRes, revRes, wdRes] = await Promise.all([
          fetchApi('/finance/reports/gmv'),
          fetchApi('/finance/reports/revenue'),
          fetchApi('/finance/withdrawals/pending')
        ]);
        
        setMetrics({
          gmv: gmvRes.data?.total_gmv || 0,
          revenue: revRes.data?.platform_revenue || 0,
          pendingWd: wdRes.data?.length || 0
        });
      } catch (err) {
        console.error("Gagal memuat data finance:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

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
            <AlertCircle size={16} className={metrics.pendingWd > 0 ? "text-orange-500" : ""}/> Review Penarikan &gt; Rp10M
          </h3>
          <p className="text-3xl font-black text-[#404145] mt-2">{metrics.pendingWd} Antrean</p>
          <p className="text-xs text-[#7a7d85] mt-1">Menunggu persetujuan manual</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2"><DollarSign size={18}/> Status Penarikan Terakhir</h3>
        <div className="space-y-4">
          {[
            { trxId: 'WD-202605-001', amount: 'Rp 5.000.000', status: 'Selesai', color: 'text-green-500' },
            { trxId: 'WD-202605-002', amount: 'Rp 1.250.000', status: 'Selesai', color: 'text-green-500' },
            { trxId: 'WD-202605-003', amount: 'Rp 12.000.000', status: 'Pending Review', color: 'text-orange-500' }
          ].map((log, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-semibold text-sm text-[#404145]">{log.trxId}</p>
                <p className="text-xs text-gray-500">Bank Transfer</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#404145]">{log.amount}</p>
                <p className={`text-[10px] font-bold uppercase ${log.color}`}>{log.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default FinanceDashboard;