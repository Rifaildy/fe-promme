// --- src/pages/finance/FinanceWithdrawals.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { DollarSign, CheckCircle, XCircle } from 'lucide-react';

const FinanceWithdrawals = () => {
  const [pending, setPending] = useState([]);
  const [failed, setFailed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const loadData = async () => {
    setLoading(true);
    try {
      const [pendingRes, failedRes] = await Promise.all([
        fetchApi('/finance/withdrawals/pending'),
        fetchApi('/finance/withdrawals/failed')
      ]);
      setPending(pendingRes.data || []);
      setFailed(failedRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleApprove = async (id) => {
    if(!window.confirm('Setujui pencairan dana ini ke rekening Creator? (Tindakan ini tidak dapat dibatalkan)')) return;
    try {
      await fetchApi(`/finance/withdrawals/${id}/approve`, { method: 'POST' });
      alert('Pencairan disetujui. Midtrans Iris sedang memproses transfer.');
      loadData();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Operasional Pencairan Dana</h2>
      
      <div className="flex space-x-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-bold relative ${activeTab === 'pending' ? 'text-[#1dbf73]' : 'text-[#7a7d85] hover:text-[#404145]'}`}
        >
          Review Manual (&gt; Rp10M) {pending.length > 0 && <span className="ml-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">{pending.length}</span>}
          {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1dbf73] rounded-t-md" />}
        </button>
        <button 
          onClick={() => setActiveTab('failed')}
          className={`pb-3 text-sm font-bold relative ${activeTab === 'failed' ? 'text-red-500' : 'text-[#7a7d85] hover:text-[#404145]'}`}
        >
          Transaksi Bouncing/Gagal
          {activeTab === 'failed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-md" />}
        </button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm flex items-center gap-2">
          {activeTab === 'pending' ? <><DollarSign size={16}/> Antrean Review Pencairan Besar</> : <><XCircle size={16} className="text-red-500"/> Daftar Pencairan Gagal</>}
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
             <div className="p-6 text-center text-[#7a7d85]">Memuat data...</div>
          ) : activeTab === 'pending' ? (
            pending.length === 0 ? <div className="p-6 text-center text-[#7a7d85]">Tidak ada antrean review pencairan saat ini.</div> :
            pending.map(w => (
              <div key={w.withdrawal_id || w.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="text-[10px] text-gray-500 font-mono">WD_ID: {w.withdrawal_id || w.id}</p>
                  <p className="font-bold text-lg text-[#404145]">Rp {Number(w.amount).toLocaleString('id-ID')}</p>
                </div>
                <Button onClick={() => handleApprove(w.withdrawal_id || w.id)} className="bg-green-600 gap-2 text-sm"><CheckCircle size={16}/> Setujui & Transfer</Button>
              </div>
            ))
          ) : (
            failed.length === 0 ? <div className="p-6 text-center text-[#7a7d85]">Tidak ada transaksi gagal.</div> :
            failed.map(w => (
              <div key={w.withdrawal_id || w.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="text-[10px] text-gray-500 font-mono">WD_ID: {w.withdrawal_id || w.id}</p>
                  <p className="font-bold text-lg text-red-600">Rp {Number(w.amount).toLocaleString('id-ID')}</p>
                  <p className="text-xs text-[#7a7d85]">Status Bank: Failed / Bounced</p>
                </div>
                <Button variant="outline" className="text-sm">Investigasi</Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default FinanceWithdrawals;