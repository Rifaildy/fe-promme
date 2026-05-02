import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { Wallet, ShieldCheck, Clock } from 'lucide-react';

const CreatorDashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/wallets/me')
      .then(res => setWallet(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-10 text-[#7a7d85]">Memuat Workspace...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Workspace Creator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#404145] text-white">
          <h3 className="text-gray-300 font-semibold text-sm flex items-center gap-2"><Wallet size={16}/> Saldo Aktif</h3>
          <p className="text-3xl font-black mt-2">Rp {wallet?.balance?.toLocaleString('id-ID') || 0}</p>
        </Card>
        <Card>
          <h3 className="text-[#7a7d85] font-semibold text-sm flex items-center gap-2"><Clock size={16}/> Dana Tertahan</h3>
          <p className="text-3xl font-black text-[#404145] mt-2">Rp {wallet?.pending_balance?.toLocaleString('id-ID') || 0}</p>
        </Card>
        <Card>
          <h3 className="text-[#7a7d85] font-semibold text-sm flex items-center gap-2"><ShieldCheck size={16}/> Total Pendapatan</h3>
          <p className="text-3xl font-black text-[#1dbf73] mt-2">Rp {wallet?.total_earned?.toLocaleString('id-ID') || 0}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-[#404145] mb-2">Tips Hari Ini</h3>
        <p className="text-[#7a7d85] text-sm">Pastikan akun sosial media Anda sudah tertaut dan status KYC 'VERIFIED' agar bisa menarik dana tanpa kendala.</p>
      </Card>
    </div>
  );
};

export default CreatorDashboard;