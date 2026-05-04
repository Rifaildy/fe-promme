import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, TrendingUp,
  DollarSign, Clock, CheckCircle2, XCircle, Loader2,
  Building, User, CreditCard, Plus, Landmark, Edit2, Trash2, AlertTriangle, Filter, Search
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/ui/Pagination';

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

const SummaryCard = ({ icon: Icon, label, value, color, sub }) => {
  // Extract the color name (e.g., 'green' from 'bg-green-500')
  const colorName = color.split('-')[1] || 'gray';
  const textColor = `text-${colorName}-600`;
  
  return (
    <Card className="flex items-center gap-4 py-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={20} className={textColor} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
        <p className="text-xl font-black text-[#404145]">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </Card>
  );
};

const CreatorWallet = () => {
  const [walletData, setWalletData] = useState(null);
  const [earningData, setEarningData] = useState(null);
  const [txs, setTxs] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('breakdown');
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: ''
  });
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankId, setSelectedBankId] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [editBank, setEditBank] = useState(null);
  const [newBank, setNewBank] = useState({ bank_code: '', account_number: '', account_name: '' });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // Wallet data and banks are usually small, but tx and earnings need pagination
      const [walletRes, earningRes, txRes, bankRes] = await Promise.all([
        fetchApi('/wallets/me'),
        fetchApi('/wallets/earnings', { params: activeTab === 'breakdown' ? filters : {} }),
        fetchApi('/wallets/transactions', { params: activeTab === 'ledger' ? filters : {} }),
        fetchApi('/creators/bank-accounts')
      ]);
      setWalletData(walletRes.data);
      setEarningData(earningRes.data);
      setTxs(txRes.data || []);
      setBanks(bankRes.data || []);
      
      const currentRes = activeTab === 'breakdown' ? earningRes : txRes;
      if (currentRes.pagination) {
        setPagination(currentRes.pagination);
      } else {
        setPagination({ current_page: 1, total_pages: 1, total_items: (currentRes.data || []).length });
      }

      if (bankRes.data?.length > 0) {
          setSelectedBankId(bankRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters({ page: 1, limit: 10, search: '' });
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    try {
      if (editBank) {
        await fetchApi(`/creators/bank-accounts/${editBank.id}`, {
          method: 'PATCH',
          body: JSON.stringify(newBank)
        });
        Swal.fire('Berhasil', 'Rekening bank diperbarui', 'success');
      } else {
        await fetchApi('/creators/bank-accounts', {
          method: 'POST',
          body: JSON.stringify(newBank)
        });
        Swal.fire('Berhasil', 'Rekening bank didaftarkan', 'success');
      }
      setShowAddBank(false);
      setEditBank(null);
      setNewBank({ bank_code: '', account_number: '', account_name: '' });
      loadAll();
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    }
  };

  const handleDeleteBank = async (id) => {
    const confirm = await Swal.fire({
      title: 'Hapus Rekening?',
      text: "Anda tidak dapat membatalkan aksi ini!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus!'
    });

    if (!confirm.isConfirmed) return;

    try {
      await fetchApi(`/creators/bank-accounts/${id}`, { method: 'DELETE' });
      Swal.fire('Terhapus!', 'Rekening telah dihapus.', 'success');
      loadAll();
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    }
  };

  const startEdit = (bank) => {
      setEditBank(bank);
      setNewBank({ bank_code: bank.bank_code, account_number: bank.account_number, account_name: bank.account_name });
      setShowAddBank(true);
      window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!selectedBankId) return Swal.fire('Error', 'Pilih rekening bank tujuan', 'error');
    const amount = parseInt(withdrawAmount);
    if (!amount || amount < 50000) return Swal.fire('Error', 'Minimal penarikan Rp 50.000', 'error');
    
    setWithdrawing(true);
    try {
      await fetchApi('/wallets/withdraw', {
        method: 'POST',
        body: JSON.stringify({ 
            amount, 
            bank_account_id: selectedBankId,
            idempotency_key: `WD-${Date.now()}` 
        })
      });
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Penarikan diproses maks 1x24 jam kerja.', confirmButtonColor: '#1dbf73' });
      setWithdrawAmount('');
      loadAll();
    } catch (err) {
      Swal.fire('Gagal', err.message, 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1dbf73]" size={40}/></div>;

  const wallet = walletData || {};
  const earnings = earningData || { summary: {}, per_campaign: [], earnings: [] };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#404145] flex items-center gap-2">
            <WalletIcon className="text-[#1dbf73]" size={24}/> Dompet Saya
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={TrendingUp} label="Total Pendapatan" value={`Rp ${(earnings.summary?.total_earned || 0).toLocaleString('id-ID')}`} color="bg-green-500" sub="Sudah dibayar"/>
        <SummaryCard icon={DollarSign} label="Saldo Aktif" value={`Rp ${(wallet.balance || 0).toLocaleString('id-ID')}`} color="bg-blue-500" sub="Siap ditarik"/>
        <SummaryCard icon={Clock} label="Menunggu Pembayaran" value={`Rp ${(earnings.summary?.total_pending || 0).toLocaleString('id-ID')}`} color="bg-amber-500" sub="Sedang diproses"/>
        <SummaryCard icon={ArrowUpRight} label="Total Ditarik" value={`Rp ${(wallet.total_withdrawn || 0).toLocaleString('id-ID')}`} color="bg-purple-500" sub="Sepanjang waktu"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Actions */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Withdrawal Card */}
          <Card className="shadow-lg border-none ring-1 ring-gray-100">
            <h3 className="font-black text-xs text-[#404145] mb-4 flex items-center gap-2 uppercase tracking-wider">
              <ArrowUpRight size={18} className="text-[#1dbf73]"/> Tarik Dana
            </h3>
            
            {banks.length === 0 ? (
                <div className="bg-amber-50 rounded-2xl p-6 text-center border border-amber-100 mb-2">
                    <AlertTriangle className="text-amber-500 mx-auto mb-2" size={24}/>
                    <p className="text-xs font-bold text-amber-900 leading-tight">Rekening bank belum terdaftar.</p>
                    <p className="text-[10px] text-amber-700 mt-1">Harap tambahkan rekening di bawah sebelum menarik dana.</p>
                </div>
            ) : (
                <form onSubmit={handleWithdraw} className="space-y-4">
                    <div className="bg-[#1dbf73]/5 rounded-2xl p-4 text-center border border-[#1dbf73]/10">
                        <p className="text-[10px] text-gray-400 font-black uppercase mb-0.5">Saldo Tersedia</p>
                        <p className="text-2xl font-black text-[#1dbf73]">Rp {(wallet.balance || 0).toLocaleString('id-ID')}</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Pilih Rekening</label>
                        <select 
                            className="w-full px-3 py-2.5 bg-gray-50 border-none ring-1 ring-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm font-bold"
                            value={selectedBankId}
                            onChange={e => setSelectedBankId(e.target.value)}
                        >
                            {banks.map(b => (
                                <option key={b.id} value={b.id}>{b.bank_code.toUpperCase()} - {b.account_number}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nominal (Min 50rb)</label>
                        <input
                            type="number"
                            placeholder="Rp 50.000"
                            className="w-full px-3 py-2.5 bg-gray-50 border-none ring-1 ring-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm font-black"
                            value={withdrawAmount}
                            onChange={e => setWithdrawAmount(e.target.value)}
                            min="50000"
                        />
                    </div>
                    <Button type="submit" disabled={withdrawing || !withdrawAmount} className="w-full h-11 bg-[#1dbf73] hover:bg-[#19a463] font-black rounded-xl">
                        {withdrawing ? 'MEMPROSES...' : 'TARIK DANA SEKARANG'}
                    </Button>
                </form>
            )}
          </Card>

          {/* Bank Management Card */}
          <Card className="shadow-sm border-none ring-1 ring-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Landmark size={14}/> Manajemen Rekening
                </h3>
                {!showAddBank && (
                    <button onClick={() => setShowAddBank(true)} className="text-[10px] font-black text-blue-600 hover:underline flex items-center gap-1">
                        <Plus size={12}/> TAMBAH
                    </button>
                )}
            </div>

            {showAddBank ? (
                <form onSubmit={handleSaveBank} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3 animate-in fade-in zoom-in duration-200">
                    <p className="text-[10px] font-black text-gray-400 uppercase">{editBank ? 'Edit Rekening' : 'Tambah Rekening Baru'}</p>
                    <input className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Bank (Contoh: BCA)" value={newBank.bank_code} onChange={e => setNewBank({...newBank, bank_code: e.target.value})} required/>
                    <input className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" placeholder="No Rekening" value={newBank.account_number} onChange={e => setNewBank({...newBank, account_number: e.target.value})} required/>
                    <input className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-1 focus:ring-blue-500 outline-none" placeholder="Nama Pemilik" value={newBank.account_name} onChange={e => setNewBank({...newBank, account_name: e.target.value})} required/>
                    <div className="flex gap-2">
                        <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 uppercase">Simpan</button>
                        <button type="button" onClick={() => {setShowAddBank(false); setEditBank(null);}} className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs font-black uppercase">Batal</button>
                    </div>
                </form>
            ) : (
                <div className="space-y-3">
                    {banks.length === 0 ? <p className="text-[10px] text-gray-400 italic text-center py-4">Belum ada rekening terdaftar.</p> : banks.map(b => (
                        <div key={b.id} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center gap-3 group hover:shadow-md transition-shadow">
                            <div className="w-8 h-8 bg-[#1dbf73]/10 rounded-lg flex items-center justify-center text-[#1dbf73]"><Landmark size={16}/></div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-[10px] font-black text-gray-800 uppercase leading-none mb-1">{b.bank_code} <span className="font-mono text-gray-400 ml-1">{b.account_number}</span></p>
                                <p className="text-[9px] text-gray-500 font-bold truncate">{b.account_name}</p>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => startEdit(b)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 size={12}/></button>
                                <button onClick={() => handleDeleteBank(b.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={12}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </Card>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2">
          <Card className="p-0 overflow-hidden shadow-sm border-none ring-1 ring-gray-100 h-full">
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 p-1">
              <div className="flex flex-1 gap-1">
                {['breakdown', 'ledger'].map(tab => (
                  <button key={tab} onClick={() => handleTabChange(tab)} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white text-[#1dbf73] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    {tab === 'breakdown' ? 'Earning Breakdown' : 'Transaction History'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3">
                <span className="text-[9px] font-black text-gray-400 uppercase">Limit:</span>
                <select 
                  className="bg-transparent text-[10px] font-black outline-none cursor-pointer"
                  value={filters.limit}
                  onChange={e => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            <div className="p-0 max-h-[700px] overflow-y-auto">
                {activeTab === 'breakdown' ? (
                  <div className="overflow-x-auto">
                    {earnings.earnings?.length === 0 ? <p className="p-20 text-center text-gray-400 font-bold italic text-sm">No earnings data yet.</p> : (
                      <table className="w-full text-left text-sm border-collapse">
                        <thead className="text-[9px] font-black uppercase text-gray-400 border-b bg-white sticky top-0">
                          <tr><th className="p-4">Submission</th><th className="p-4 text-center">Views</th><th className="p-4 text-center">Earning</th><th className="p-4 text-center">Status</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {earnings.earnings.map(row => (
                            <tr key={row.submission_id} className="hover:bg-gray-50/50">
                              <td className="p-4">
                                <p className="font-black text-xs text-gray-800">{row.nama_campaign}</p>
                                <a href={row.content_url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline truncate block max-w-[200px] mt-0.5">{row.content_url}</a>
                              </td>
                              <td className="p-4 text-center font-black text-gray-700 text-xs">{(row.views || 0).toLocaleString('id-ID')}</td>
                              <td className="p-4 text-center">
                                <span className={`font-black text-sm ${row.net_earning > 0 ? 'text-[#1dbf73]' : 'text-gray-400'}`}>Rp {(row.net_earning || 0).toLocaleString('id-ID')}</span>
                              </td>
                              <td className="p-4 text-center"><PaymentBadge status={row.payment_status}/></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {txs.length === 0 ? <p className="p-20 text-center text-gray-400 font-bold italic text-sm">No transaction history.</p> : txs.map(t => (
                            <div key={t.id || t.created_at} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2.5 rounded-2xl ${['EARNING', 'DISPUTE_RELEASE', 'WITHDRAWAL_SUCCESS', 'ADJUSTMENT_CREDIT'].includes(t.type) ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {['EARNING', 'DISPUTE_RELEASE', 'WITHDRAWAL_FAILED', 'ADJUSTMENT_CREDIT'].includes(t.type) ? <ArrowDownLeft size={20}/> : <ArrowUpRight size={20}/>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-gray-800 uppercase tracking-tight">{t.type?.replace(/_/g, ' ')}</p>
                                        <p className="text-[10px] text-gray-400 font-bold">{new Date(t.created_at).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                                <p className={`font-black text-lg ${['EARNING', 'DISPUTE_RELEASE', 'WITHDRAWAL_SUCCESS', 'ADJUSTMENT_CREDIT'].includes(t.type) ? 'text-[#1dbf73]' : 'text-red-600'}`}>
                                    {['EARNING', 'DISPUTE_RELEASE', 'WITHDRAWAL_FAILED', 'ADJUSTMENT_CREDIT'].includes(t.type) ? '+' : '-'} Rp {t.amount?.toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-white">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                totalItems={pagination.total_items}
                limit={filters.limit}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreatorWallet;
;