// --- src/pages/creator/CreatorDashboard.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';

const CreatorDashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWallet = async () => {
      try {
        const response = await fetchApi('/wallets/me');
        setWallet(response.data);
      } catch (error) {
        console.error("Gagal load dompet creator:", error);
      } finally {
        setLoading(false);
      }
    };
    loadWallet();
  }, []);

  if (loading) return <div className="p-8 text-center text-[#7a7d85]">Memuat data dompet...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-[#404145]">Workspace Creator</h2>
      <Card className="bg-[#404145] text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-gray-300 font-semibold text-sm mb-1">Saldo Tersedia (Balance)</h3>
            <p className="text-4xl font-black text-white">Rp {wallet?.balance?.toLocaleString('id-ID') || 0}</p>
          </div>
          <Button variant="primary" className="bg-[#1dbf73]">Tarik Dana</Button>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><h3 className="text-[#7a7d85] font-semibold text-sm mb-2">Total Pendapatan</h3><p className="font-bold text-[#404145] text-xl">Rp {wallet?.total_earned?.toLocaleString('id-ID') || 0}</p></Card>
        <Card><h3 className="text-[#7a7d85] font-semibold text-sm mb-2">Saldo Tertahan (Pending)</h3><p className="font-bold text-orange-500 text-xl">Rp {wallet?.pending_balance?.toLocaleString('id-ID') || 0}</p></Card>
      </div>
    </div>
  );
};

export default CreatorDashboard;