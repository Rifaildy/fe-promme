import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { fetchApi } from '../../utils/api';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const CreatorWallet = () => {
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/wallets/transactions')
      .then(res => setTxs(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Dompet Creator</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <h3 className="font-bold text-[#404145] mb-4">Tarik Dana</h3>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <Input label="Jumlah Penarikan (Rp)" type="number" placeholder="Min. Rp 50.000" />
            <Button className="w-full">Ajukan Penarikan</Button>
            <p className="text-[10px] text-[#7a7d85] text-center italic">Penarikan akan diproses maksimal 1x24 jam kerja.</p>
          </form>
        </Card>

        <Card className="md:col-span-2 p-0 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm flex items-center gap-2">
            <WalletIcon size={16}/> Riwayat Transaksi
          </div>
          <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
            {loading ? (
              <p className="p-6 text-[#7a7d85] text-center">Memuat mutasi...</p>
            ) : txs.length === 0 ? (
              <p className="p-6 text-[#7a7d85] text-center">Belum ada riwayat transaksi.</p>
            ) : (
              txs.map(t => (
                <div key={t.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${t.type === 'EARNING' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {t.type === 'EARNING' ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#404145]">{t.description}</p>
                      <p className="text-[10px] text-[#7a7d85]">{new Date(t.created_at).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                  <p className={`font-bold ${t.type === 'EARNING' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.type === 'EARNING' ? '+' : '-'} Rp {t.amount?.toLocaleString('id-ID')}
                  </p>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreatorWallet;