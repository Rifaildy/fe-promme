import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { fetchApi } from '../../utils/api';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, TrendingUp,
  DollarSign, Clock, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp
} from 'lucide-react';
import Swal from 'sweetalert2';

const PaymentBadge = ({ status }) => {
  const map = {
    DIBAYAR: 'bg-green-100 text-green-700',
    MENUNGGU_PEMBAYARAN: 'bg-amber-100 text-amber-700',
    DITOLAK: 'bg-red-100 text-red-700',
    BELUM_SELESAI: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const SummaryCard = ({ icon: Icon, label, value, color, sub }) => (
  <Card className="flex items-center gap-4 py-4">
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <Icon size={20} className={color.replace('bg-', 'text-')} />
    </div>
    <div>
      <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
      <p className="text-xl font-black text-[#404145]">{value}</p>
      {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </Card>
);

const CreatorWallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [earningData, setEarningData] = useState(null);
  const [txs, setTxs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCampaign, setExpandedCampaign] = useState(null);
  const [activeTab, setActiveTab] = useState('breakdown'); // 'breakdown' | 'ledger'
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, earningRes, txRes] = await Promise.all([
        fetchApi('/wallets/me'),
        fetchApi('/wallets/earnings'),
        fetchApi('/wallets/transactions')
      ]);
      setWalletData(walletRes.data);
      setEarningData(earningRes.data);
      setTxs(txRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 50000) {
      return Swal.fire('Error', 'Minimal penarikan adalah Rp 50.000', 'error');
    }
    if (walletData && amount > walletData.balance) {
      return Swal.fire('Error', 'Saldo tidak mencukupi', 'error');
    }
    setWithdrawing(true);
    try {
      await fetchApi('/wallets/withdraw', {
        method: 'POST',
        body: JSON.stringify({ amount, idempotency_key: `WD-${Date.now()}` })
      });
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Penarikan masuk antrian. Diproses maks 1x24 jam kerja.', confirmButtonColor: '#1dbf73' });
      setWithdrawAmount('');
      loadAll();
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#1dbf73]" size={40}/>
    </div>
  );

  const wallet = walletData || {};
  const earnings = earningData || { summary: {}, per_campaign: [], earnings: [] };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145] flex items-center gap-2">
        <WalletIcon className="text-[#1dbf73]" size={24}/> Dompet Saya
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          icon={TrendingUp}
          label="Total Pendapatan"
          value={`Rp ${(earnings.summary?.total_earned || 0).toLocaleString('id-ID')}`}
          color="bg-green-500"
          sub="Sudah dibayar"
        />
        <SummaryCard
          icon={DollarSign}
          label="Saldo Aktif"
          value={`Rp ${(wallet.balance || 0).toLocaleString('id-ID')}`}
          color="bg-blue-500"
          sub="Siap ditarik"
        />
        <SummaryCard
          icon={Clock}
          label="Menunggu Pembayaran"
          value={`Rp ${(earnings.summary?.total_pending || 0).toLocaleString('id-ID')}`}
          color="bg-amber-500"
          sub="Sedang diproses"
        />
        <SummaryCard
          icon={ArrowUpRight}
          label="Total Ditarik"
          value={`Rp ${(wallet.total_withdrawn || 0).toLocaleString('id-ID')}`}
          color="bg-purple-500"
          sub="Sepanjang waktu"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Withdraw */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
              <ArrowUpRight size={18} className="text-[#1dbf73]"/> Tarik Dana
            </h3>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Saldo Tersedia</p>
              <p className="text-2xl font-black text-[#1dbf73]">Rp {(wallet.balance || 0).toLocaleString('id-ID')}</p>
              {(wallet.hold_balance || 0) > 0 && (
                <p className="text-[10px] text-red-500 font-bold mt-1">Hold: Rp {(wallet.hold_balance || 0).toLocaleString('id-ID')}</p>
              )}
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#404145] mb-2">Jumlah Penarikan (Rp)</label>
                <input
                  type="number"
                  placeholder="Min. Rp 50.000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm"
                  value={withdrawAmount}
                  onChange={e => setWithdrawAmount(e.target.value)}
                  min="50000"
                />
              </div>
              <Button type="submit" disabled={withdrawing || !withdrawAmount} className="w-full bg-[#1dbf73] hover:bg-[#19a463]">
                {withdrawing ? 'Memproses...' : 'Ajukan Penarikan'}
              </Button>
              <p className="text-[10px] text-gray-400 text-center italic">Diproses maks 1x24 jam kerja.</p>
            </form>
          </Card>

          {/* Per Campaign Summary */}
          {earnings.per_campaign?.length > 0 && (
            <Card className="p-0 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b font-bold text-sm text-[#404145] flex items-center gap-2">
                <TrendingUp size={16} className="text-[#1dbf73]"/> Pendapatan per Campaign
              </div>
              <div className="divide-y divide-gray-100">
                {earnings.per_campaign.map(camp => (
                  <div key={camp.campaign_id} className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-sm text-[#404145] leading-tight">{camp.nama_campaign}</p>
                        <p className="text-[10px] text-gray-400 uppercase">{camp.platform}</p>
                      </div>
                      <span className="text-sm font-black text-[#1dbf73]">Rp {camp.total_earning.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex gap-3 text-[10px] text-gray-400">
                      <span>{camp.submission_count} submission</span>
                      <span>·</span>
                      <span>{camp.total_views.toLocaleString('id-ID')} views</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Right: Tabs */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              {[
                { key: 'breakdown', label: 'Breakdown Pendapatan per Konten' },
                { key: 'ledger', label: 'Riwayat Transaksi' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3.5 text-xs font-bold border-b-2 transition-colors ${activeTab === tab.key ? 'border-[#1dbf73] text-[#1dbf73]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content: Breakdown */}
            {activeTab === 'breakdown' && (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                {earnings.earnings?.length === 0 ? (
                  <p className="p-10 text-center text-gray-400 italic text-sm">Belum ada data pendapatan.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="text-[10px] uppercase text-gray-500 border-b bg-gray-50 sticky top-0">
                      <tr>
                        <th className="p-3">Campaign & Konten</th>
                        <th className="p-3 text-center">Views</th>
                        <th className="p-3 text-center">Pendapatan</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(earnings.earnings || []).map(row => (
                        <tr key={row.submission_id} className="hover:bg-gray-50/50">
                          <td className="p-3">
                            <p className="font-bold text-xs text-[#404145]">{row.nama_campaign}</p>
                            <a href={row.content_url} target="_blank" rel="noreferrer"
                              className="text-[10px] text-blue-500 hover:underline truncate block max-w-[160px]">
                              {row.content_url}
                            </a>
                            <span className="text-[9px] text-gray-400">
                              {new Date(row.submitted_at).toLocaleDateString('id-ID')}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold text-[#404145] text-xs">{(row.views || 0).toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center">
                            <span className={`font-black text-sm ${row.net_earning > 0 ? 'text-[#1dbf73]' : 'text-gray-400'}`}>
                              Rp {(row.net_earning || 0).toLocaleString('id-ID')}
                            </span>
                            {row.status === 'PENDING' && (
                              <span className="block text-[9px] text-amber-500">
                                ~Rp {(row.estimasi_komisi || 0).toLocaleString('id-ID')}
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center"><PaymentBadge status={row.payment_status}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Tab Content: Ledger */}
            {activeTab === 'ledger' && (
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {txs.length === 0 ? (
                  <p className="p-10 text-center text-gray-400 italic text-sm">Belum ada riwayat transaksi.</p>
                ) : (
                  txs.map(t => (
                    <div key={t.id || t.created_at} className="p-4 flex justify-between items-center hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${['EARNING', 'DISPUTE_RELEASE'].includes(t.type) ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                          {['EARNING', 'DISPUTE_RELEASE'].includes(t.type) ? <ArrowDownLeft size={16}/> : <ArrowUpRight size={16}/>}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#404145]">{t.type?.replace(/_/g, ' ')}</p>
                          <p className="text-[10px] text-gray-400">{new Date(t.created_at).toLocaleString('id-ID')}</p>
                        </div>
                      </div>
                      <p className={`font-bold ${['EARNING', 'DISPUTE_RELEASE'].includes(t.type) ? 'text-green-600' : 'text-red-600'}`}>
                        {['EARNING', 'DISPUTE_RELEASE'].includes(t.type) ? '+' : '-'} Rp {t.amount?.toLocaleString('id-ID')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatorWallet;