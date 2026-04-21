// --- src/pages/admin/AdminFraudOps.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { ShieldAlert, AlertOctagon, Lock, Unlock, FileX, Search, Wallet, FileText, Megaphone } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminFraudOps = () => {
  const [loading, setLoading] = useState(true);
  const [anomalies, setAnomalies] = useState({ wallets: [], submissions: [], campaigns: [] });
  const [activeTab, setActiveTab] = useState('wallets');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      // Pastikan endpoint ini sesuai dengan rute di backend Anda (misal: /admin/anomalies)
      const res = await fetchApi('/admin/anomalies'); 
      setAnomalies(res.data || { wallets: [], submissions: [], campaigns: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // Handler Aksi Paksa (God Mode)
  const executeAction = async (endpoint, method = 'POST', successMsg, actionType) => {
    const confirm = await Swal.fire({
      title: 'Peringatan: Force Action',
      text: 'Tindakan ini (God Mode) akan memodifikasi data secara paksa. Lanjutkan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: actionType === 'release' ? '#1dbf73' : '#ef4444',
      confirmButtonText: 'Ya, Eksekusi',
      cancelButtonText: 'Batal'
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.showLoading();
      await fetchApi(endpoint, { method });
      Swal.fire('Berhasil!', successMsg, 'success');
      loadData(); // Refresh list otomatis
    } catch (err) { 
      Swal.fire('Gagal!', err.message, 'error'); 
    }
  };

  // Helper untuk membaca relasi data object Supabase yang kadang berupa array
  const getSafeRel = (obj, key) => {
    if (!obj) return '-';
    return Array.isArray(obj) ? obj[0]?.[key] || '-' : obj[key] || '-';
  };

  // --- FILTERING DATA ---
  const filteredWallets = anomalies.wallets.filter(w => 
    getSafeRel(w.users, 'email').toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.wallet_id.includes(searchTerm)
  );

  const filteredSubmissions = anomalies.submissions.filter(s => 
    getSafeRel(s.campaigns, 'nama_campaign').toLowerCase().includes(searchTerm.toLowerCase()) || 
    getSafeRel(s.creators, 'nama_lengkap').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = anomalies.campaigns.filter(c => 
    c.nama_campaign.toLowerCase().includes(searchTerm.toLowerCase()) || 
    getSafeRel(c.brands, 'nama_perusahaan').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-red-600 flex items-center gap-2">
          <ShieldAlert size={28}/> Fraud Operations
        </h2>
        
        {/* Search Bar */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-full md:w-64">
          <Search size={16} className="text-[#7a7d85]" />
          <input 
            type="text"
            placeholder="Cari data fraud..."
            className="bg-transparent text-sm font-medium outline-none w-full text-[#404145]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABS Navigation */}
      <div className="flex space-x-6 border-b border-gray-200">
        <button onClick={() => setActiveTab('wallets')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'wallets' ? 'border-red-500 text-red-500' : 'border-transparent text-[#7a7d85] hover:text-[#404145]'}`}>
          <Wallet size={16}/> Dompet Creator
        </button>
        <button onClick={() => setActiveTab('submissions')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'submissions' ? 'border-orange-500 text-orange-500' : 'border-transparent text-[#7a7d85] hover:text-[#404145]'}`}>
          <FileText size={16}/> Submissions
        </button>
        <button onClick={() => setActiveTab('campaigns')} className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'campaigns' ? 'border-purple-500 text-purple-500' : 'border-transparent text-[#7a7d85] hover:text-[#404145]'}`}>
          <Megaphone size={16}/> Campaigns
        </button>
      </div>

      <Card className="p-0 overflow-hidden shadow-md border-t-4 border-t-red-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            
            {/* Tampilan Tabel Wallets */}
            {activeTab === 'wallets' && (
              <>
                <thead>
                  <tr className="bg-gray-50 text-[#7a7d85] text-xs uppercase border-b">
                    <th className="p-4">Info Pemilik (Email)</th>
                    <th className="p-4 text-center">Saldo Aktif</th>
                    <th className="p-4 text-center">Saldo Ditahan (Hold)</th>
                    <th className="p-4 text-center">Force Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? <tr><td colSpan="4" className="p-6 text-center text-[#7a7d85]">Memuat data...</td></tr> : 
                   filteredWallets.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-[#7a7d85]">Tidak ada data dompet ditemukan.</td></tr> :
                   filteredWallets.map(w => (
                     <tr key={w.wallet_id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-bold text-[#404145]">{getSafeRel(w.users, 'email')}</div>
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {w.wallet_id.substring(0, 13)}...</div>
                        </td>
                        <td className="p-4 text-center font-bold text-[#1dbf73]">Rp {w.balance?.toLocaleString('id-ID')}</td>
                        <td className="p-4 text-center font-bold text-red-500">Rp {w.held_balance?.toLocaleString('id-ID')}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button onClick={() => executeAction(`/admin/wallets/${w.wallet_id}/hold`, 'POST', 'Saldo berhasil dibekukan!', 'hold')} variant="outline" className="text-[10px] py-1 px-2 h-7 border-red-500 text-red-500 hover:bg-red-50">
                              <Lock size={12} className="mr-1"/> Hold Saldo
                            </Button>
                            <Button onClick={() => executeAction(`/admin/wallets/${w.wallet_id}/release`, 'POST', 'Saldo dibebaskan!', 'release')} className="text-[10px] py-1 px-2 h-7 bg-green-600 hover:bg-green-700" disabled={w.held_balance <= 0}>
                              <Unlock size={12} className="mr-1"/> Release
                            </Button>
                          </div>
                        </td>
                     </tr>
                   ))
                  }
                </tbody>
              </>
            )}

            {/* Tampilan Tabel Submissions */}
            {activeTab === 'submissions' && (
              <>
                <thead>
                  <tr className="bg-gray-50 text-[#7a7d85] text-xs uppercase border-b">
                    <th className="p-4">Campaign & Creator</th>
                    <th className="p-4 text-center">Views Valid</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Force Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? <tr><td colSpan="4" className="p-6 text-center text-[#7a7d85]">Memuat data...</td></tr> : 
                   filteredSubmissions.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-[#7a7d85]">Tidak ada submission mencurigakan ditemukan.</td></tr> :
                   filteredSubmissions.map(s => (
                     <tr key={s.submission_id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-bold text-[#404145]">{getSafeRel(s.campaigns, 'nama_campaign')}</div>
                          <div className="text-[11px] text-[#7a7d85] mt-0.5">By: <span className="font-medium text-blue-600">{getSafeRel(s.creators, 'nama_lengkap')}</span></div>
                        </td>
                        <td className="p-4 text-center font-bold text-[#404145]">{s.views_tervalidasi?.toLocaleString('id-ID')}</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-1 rounded text-[10px] font-bold bg-gray-100 text-gray-700 uppercase">{s.status}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            <Button onClick={() => executeAction(`/admin/submissions/${s.submission_id}/invalidate`, 'PATCH', 'Submission ditolak paksa!', 'reject')} variant="outline" className="text-[10px] py-1 px-2 h-7 border-orange-500 text-orange-500 hover:bg-orange-50">
                              <FileX size={12} className="mr-1"/> Force Reject
                            </Button>
                          </div>
                        </td>
                     </tr>
                   ))
                  }
                </tbody>
              </>
            )}

            {/* Tampilan Tabel Campaigns */}
            {activeTab === 'campaigns' && (
              <>
                <thead>
                  <tr className="bg-gray-50 text-[#7a7d85] text-xs uppercase border-b">
                    <th className="p-4">Nama Campaign & Brand</th>
                    <th className="p-4 text-center">Sisa Budget</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Force Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? <tr><td colSpan="4" className="p-6 text-center text-[#7a7d85]">Memuat data...</td></tr> : 
                   filteredCampaigns.length === 0 ? <tr><td colSpan="4" className="p-6 text-center text-[#7a7d85]">Tidak ada campaign aktif ditemukan.</td></tr> :
                   filteredCampaigns.map(c => (
                     <tr key={c.campaign_id} className="hover:bg-gray-50">
                        <td className="p-4">
                          <div className="font-bold text-[#404145]">{c.nama_campaign}</div>
                          <div className="text-[11px] text-[#7a7d85] mt-0.5">Brand: <span className="font-medium text-purple-600">{getSafeRel(c.brands, 'nama_perusahaan')}</span></div>
                        </td>
                        <td className="p-4 text-center font-bold text-[#1dbf73]">Rp {c.budget_tersisa?.toLocaleString('id-ID')}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${c.status === 'AKTIF' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center">
                            <Button onClick={() => executeAction(`/admin/campaigns/${c.campaign_id}/force-cancel`, 'POST', 'Campaign berhasil dihentikan paksa!', 'cancel')} className="text-[10px] py-1 px-3 h-7 bg-purple-600 hover:bg-purple-700 border-none">
                              <AlertOctagon size={12} className="mr-1"/> Force Cancel
                            </Button>
                          </div>
                        </td>
                     </tr>
                   ))
                  }
                </tbody>
              </>
            )}

          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminFraudOps;