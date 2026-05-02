import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import {
  ShieldAlert, AlertOctagon, Lock, Unlock,
  FileX, Search, Wallet, FileText, Megaphone,
  Zap, RefreshCw, UserX, UserCheck, CheckCircle,
  Users, User, Eye, X
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/ui/Pagination';

const AdminFraudOps = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    anomalies: [],
    lists: { wallets: [], submissions: [], campaigns: [], brands: [] }
  });
  const [activeTab, setActiveTab] = useState('alerts');
  const [subTab, setSubTab] = useState('all');
  const [campaignSubTab, setCampaignSubTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [anomalyTypeFilter, setAnomalyTypeFilter] = useState('all');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/fraud/anomalies', {
        params: { ...filters, search: searchTerm }
      });
      setData({
        anomalies: res.data?.anomalies || [],
        lists: res.data?.lists || { wallets: [], submissions: [], campaigns: [], brands: [] }
      });
      if (res.pagination) {
        setPagination(res.pagination);
      } else {
        // Fallback for non-paginated response
        const total = res.data?.anomalies?.length || 0;
        setPagination({ current_page: 1, total_pages: 1, total_items: total });
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'Gagal memuat data fraud ops', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filters, searchTerm]);

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const executeAction = async (endpoint, method = 'POST', successMsg, actionType) => {
    const safeActions = ['release', 'status-active', 'activate-campaign'];
    const isDangerous = !safeActions.includes(actionType);

    const result = await Swal.fire({
      title: isDangerous ? 'Peringatan: Force Action' : 'Konfirmasi Aksi',
      text: isDangerous
        ? 'Tindakan ini (God Mode) akan memodifikasi data secara paksa. Lanjutkan?'
        : 'Lanjutkan aksi ini?',
      icon: isDangerous ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: isDangerous ? '#ef4444' : '#1dbf73',
      confirmButtonText: 'Ya, Eksekusi',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
      Swal.showLoading();

      // Build body based on actionType
      let bodyData = undefined;
      if (actionType === 'status-suspended') {
        bodyData = { status: 'SUSPENDED' };
      } else if (actionType === 'status-active') {
        bodyData = { status: 'ACTIVE' };
      } else if (actionType === 'activate-campaign') {
        bodyData = { status: 'AKTIF' };
      } else if (actionType === 'cancel-campaign') {
        bodyData = { status: 'DIBATALKAN' };
      } else if (actionType === 'reject') {
        bodyData = { status: 'DITOLAK' };
      }

      // fetchApi expects body to be serialized as JSON string when not FormData
      const fetchOptions = { method };
      if (bodyData !== undefined) {
        fetchOptions.body = JSON.stringify(bodyData);
      }

      await fetchApi(endpoint, fetchOptions);
      await Swal.fire('Berhasil!', successMsg, 'success');
      loadData();
    } catch (err) {
      const errMsg = err.message || 'Terjadi kesalahan sistem internal.';
      Swal.fire('Gagal!', errMsg, 'error');
    }
  };

  // Safe getter for nested/related objects from Supabase joins
  const getSafeRel = (obj, key) => {
    if (!obj) return '-';
    const target = Array.isArray(obj) ? obj[0] : obj;
    if (!target) return '-';
    if (key.includes('.')) {
      const keys = key.split('.');
      let current = target;
      for (const k of keys) {
        if (current == null) return '-';
        current = current[k];
      }
      return current ?? '-';
    }
    return target[key] ?? '-';
  };

  // --- FILTERING ---
  let filteredAnomalies = (data.anomalies || []).filter(a =>
    a.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (subTab === 'creator') {
    filteredAnomalies = filteredAnomalies.filter(a => !a.type.includes('BRAND'));
  } else if (subTab === 'brand') {
    filteredAnomalies = filteredAnomalies.filter(a => a.type.includes('BRAND'));
  }

  if (anomalyTypeFilter !== 'all') {
    filteredAnomalies = filteredAnomalies.filter(a => a.type === anomalyTypeFilter);
  }

  const filteredWallets = (data.lists.wallets || []).filter(w =>
    getSafeRel(w.creators, 'users.email').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSafeRel(w.creators, 'nama_lengkap').toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(w.wallet_id).includes(searchTerm)
  );

  const filteredSubmissions = (data.lists.submissions || []).filter(s =>
    getSafeRel(s.campaigns, 'nama_campaign').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSafeRel(s.creators, 'nama_lengkap').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCampaigns = (data.lists.campaigns || []).filter(c =>
    (c.nama_campaign || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSafeRel(c.brands, 'nama_perusahaan').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBrands = (data.lists.brands || []).filter(b =>
    (b.nama_perusahaan || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSafeRel(b.users, 'email').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const anomalyTypes = [...new Set((data.anomalies || []).map(a => a.type).filter(Boolean))];

  const RiskBadge = ({ risk }) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${risk === 'HIGH' ? 'bg-red-500 text-white' : 'bg-amber-400 text-white'}`}>
      {risk}
    </span>
  );

  const TypeBadge = ({ type }) => (
    <span className={`px-2 py-1 rounded text-[9px] font-black tracking-tighter shadow-sm border ${
      type.includes('BRAND') ? 'bg-purple-50 border-purple-200 text-purple-700' :
      type.includes('CONTENT') ? 'bg-blue-50 border-blue-200 text-blue-700' :
      'bg-amber-50 border-amber-200 text-amber-700'
    }`}>
      {type}
    </span>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-700',
      SUSPENDED: 'bg-red-100 text-red-700',
      AKTIF: 'bg-green-100 text-green-700',
      DIBATALKAN: 'bg-red-100 text-red-700',
      SELESAI: 'bg-blue-100 text-blue-700',
      MENUNGGU: 'bg-yellow-100 text-yellow-700',
      DITOLAK: 'bg-gray-100 text-gray-500',
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${colors[status] || 'bg-gray-100 text-gray-500'}`}>
        {status || '-'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-red-600 flex items-center gap-2">
          <ShieldAlert size={28} /> Fraud Operations (God Mode)
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-full md:w-64">
            <Search size={16} className="text-[#7a7d85]" />
            <input
              type="text"
              placeholder="Cari..."
              className="bg-transparent text-sm font-medium outline-none w-full text-[#404145]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={loadData} variant="outline" className="p-2" disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-6 border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { key: 'alerts', label: 'Auto-Detection Alerts', icon: <Zap size={16} />, color: 'amber' },
          { key: 'wallets', label: 'Wallets & Creators', icon: <Wallet size={16} />, color: 'red' },
          { key: 'submissions', label: 'Submissions', icon: <FileText size={16} />, color: 'orange' },
          { key: 'campaigns', label: 'Brand & Campaigns', icon: <Megaphone size={16} />, color: 'purple' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === tab.key
                ? `border-${tab.color}-500 text-${tab.color}-500`
                : 'border-transparent text-[#7a7d85] hover:text-[#404145]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Alerts Sub-filters */}
      {activeTab === 'alerts' && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200">
            {['all', 'creator', 'brand'].map(t => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${
                  subTab === t ? 'bg-white text-gray-900 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t === 'all' ? 'Semua' : t === 'creator' ? 'Resiko Creator' : 'Resiko Brand'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-black uppercase text-gray-400">
            <span>Filter Tipe:</span>
            <select
              value={anomalyTypeFilter}
              onChange={(e) => setAnomalyTypeFilter(e.target.value)}
              className="bg-transparent outline-none text-gray-900 cursor-pointer"
            >
              <option value="all">SEMUA TIPE</option>
              {anomalyTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Campaign Sub-tabs */}
      {activeTab === 'campaigns' && (
        <div className="flex gap-1 p-1 bg-purple-50 rounded-lg w-fit border border-purple-100">
          <button onClick={() => setCampaignSubTab('active')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${campaignSubTab === 'active' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-600 hover:bg-purple-100'}`}>
            Monitoring Campaigns
          </button>
          <button onClick={() => setCampaignSubTab('brands')} className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${campaignSubTab === 'brands' ? 'bg-purple-600 text-white shadow-md' : 'text-purple-600 hover:bg-purple-100'}`}>
            Registered Brands
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <Card className={`p-0 overflow-hidden shadow-md border-t-4 ${
        activeTab === 'alerts' ? 'border-t-amber-500' :
        activeTab === 'wallets' ? 'border-t-red-500' :
        activeTab === 'submissions' ? 'border-t-orange-500' : 'border-t-purple-500'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            {/* === TAB: ALERTS === */}
            {activeTab === 'alerts' && (
              <>
                <thead className="bg-amber-50 text-amber-800 text-[11px] uppercase border-b">
                  <tr>
                    <th className="p-4">Tipe Anomali</th>
                    <th className="p-4">Target Entitas</th>
                    <th className="p-4">Analisa & Akun Terlibat</th>
                    <th className="p-4 text-center">Risiko</th>
                    <th className="p-4 text-center">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100 text-sm">
                  {loading
                    ? <tr><td colSpan="5" className="p-12 text-center text-[#7a7d85]">Menganalisa performa...</td></tr>
                    : filteredAnomalies.length === 0
                    ? <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic">Bersih! Tidak ada fraud yang terdeteksi.</td></tr>
                    : filteredAnomalies.map((anomali, i) => (
                      <tr key={i} className="hover:bg-amber-50/50">
                        <td className="p-4"><TypeBadge type={anomali.type} /></td>
                        <td className="p-4">
                          <div className="font-bold text-[#404145]">{anomali.name || '-'}</div>
                          <div className="text-[10px] text-gray-400 font-mono truncate w-36">{anomali.entity_id}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-[#7a7d85] text-[12px] mb-2">{anomali.description}</div>
                          {anomali.involved_actors?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="text-[10px] font-bold text-gray-400 mr-1 flex items-center gap-1">
                                <Users size={10} /> Aktor:
                              </span>
                              {anomali.involved_actors.map((actor, idx) => (
                                <span key={idx} className="bg-white border border-gray-200 text-[9px] px-1.5 py-0.5 rounded text-gray-600 font-bold flex items-center gap-1 shadow-sm">
                                  <User size={8} className="text-blue-500" /> {actor}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-center"><RiskBadge risk={anomali.risk} /></td>
                        <td className="p-4 text-center">
                          <div className="flex gap-2 justify-center flex-wrap">
                            {/* Hold Wallet: for creator-side fraud */}
                            {['GHOST_REVENUE', 'VELOCITY', 'IP_CLUSTER', 'SPAM'].includes(anomali.type) && (
                              <Button
                                onClick={() => executeAction(
                                  `/admin/wallets/${anomali.entity_id}/hold`,
                                  'POST',
                                  'Saldo berhasil dibekukan!',
                                  'hold'
                                )}
                                className="bg-gradient-to-r from-red-600 to-red-500 !py-1.5 !px-3 text-[10px] font-bold shadow-lg shadow-red-200 hover:translate-y-[-1px] transition-all rounded-full text-white"
                              >
                                {anomali.type === 'IP_CLUSTER' ? 'Freeze Cluster' : 'Hold Wallet'}
                              </Button>
                            )}
                            {/* Suspend Brand: for brand-side fraud */}
                            {anomali.type === 'BRAND_BURN' && (
                              <Button
                                onClick={() => executeAction(
                                  `/admin/users/${anomali.entity_id}/status`,
                                  'PATCH',
                                  'Akun Brand berhasil disuspend!',
                                  'status-suspended'
                                )}
                                className="bg-gradient-to-r from-purple-700 to-purple-600 !py-1.5 !px-3 text-[10px] font-bold shadow-lg shadow-purple-200 hover:translate-y-[-1px] transition-all rounded-full text-white"
                              >
                                Suspend Brand
                              </Button>
                            )}
                            {/* Detail button always available when there are actors */}
                            {(anomali.involved_actors?.length > 0 || anomali.description) && (
                              <Button
                                onClick={() => setSelectedAnomaly(anomali)}
                                variant="outline"
                                className="!py-1.5 !px-3 text-[10px] font-bold border-gray-300 hover:bg-gray-100 rounded-full flex items-center gap-1"
                              >
                                <Eye size={12} className="text-blue-500" /> Detail
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </>
            )}

            {/* === TAB: WALLETS === */}
            {activeTab === 'wallets' && (
              <>
                <thead className="bg-gray-50 text-[#7a7d85] text-[11px] uppercase border-b">
                  <tr>
                    <th className="p-4">Creator / User</th>
                    <th className="p-4 text-center">Status Akun</th>
                    <th className="p-4 text-center">Saldo (Aktif / Hold)</th>
                    <th className="p-4 text-center">Force God Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading
                    ? <tr><td colSpan="4" className="p-12 text-center text-[#7a7d85]">Memuat data...</td></tr>
                    : filteredWallets.length === 0
                    ? <tr><td colSpan="4" className="p-12 text-center text-gray-400 italic">Data tidak ditemukan.</td></tr>
                    : filteredWallets.map(w => {
                        const creatorData = Array.isArray(w.creators) ? w.creators[0] : w.creators;
                        const userData = creatorData?.users ? (Array.isArray(creatorData.users) ? creatorData.users[0] : creatorData.users) : null;
                        const userName = creatorData?.nama_lengkap || '-';
                        const userEmail = userData?.email || '-';
                        const userStatus = userData?.status || '-';
                        const userId = userData?.id || '-';
                        return (
                          <tr key={w.wallet_id} className="hover:bg-gray-50/50">
                            <td className="p-4">
                              <div className="font-bold text-[#404145]">{userName}</div>
                              <div className="text-[10px] text-blue-600 font-medium">{userEmail}</div>
                            </td>
                            <td className="p-4 text-center"><StatusBadge status={userStatus} /></td>
                            <td className="p-4 text-center">
                              <div className="font-bold text-[#1dbf73]">Rp {(w.balance || 0).toLocaleString('id-ID')}</div>
                              <div className="text-[10px] text-red-500 font-bold">Hold: Rp {(w.hold_balance || 0).toLocaleString('id-ID')}</div>
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1 flex-wrap">
                                <Button
                                  onClick={() => setSelectedWallet(w)}
                                  variant="outline"
                                  className="text-[9px] py-1 px-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                                  title="Detail Wallet & Creator"
                                >
                                  <Eye size={12} /> Detail
                                </Button>
                                <Button
                                  onClick={() => executeAction(`/admin/wallets/${w.wallet_id}/hold`, 'POST', 'Saldo dibekukan!', 'hold')}
                                  variant="outline"
                                  className="text-[9px] py-1 px-2 border-red-500 text-red-500 hover:bg-red-50"
                                  disabled={!w.balance || w.balance <= 0}
                                  title="Hold Wallet"
                                >
                                  <Lock size={12} />
                                </Button>
                                <Button
                                  onClick={() => executeAction(`/admin/wallets/${w.wallet_id}/release`, 'POST', 'Saldo dibebaskan!', 'release')}
                                  variant="outline"
                                  className="text-[9px] py-1 px-2 border-green-500 text-green-500 hover:bg-green-50"
                                  disabled={!w.hold_balance || w.hold_balance <= 0}
                                  title="Release Hold"
                                >
                                  <Unlock size={12} />
                                </Button>
                                {userId !== '-' && (
                                  userStatus === 'ACTIVE'
                                    ? <Button onClick={() => executeAction(`/admin/users/${userId}/status`, 'PATCH', 'Akun CREATOR disuspended!', 'status-suspended')} variant="outline" className="text-[9px] py-1 px-2 border-gray-400 text-gray-500 hover:bg-gray-50">
                                        <UserX size={12} /> <span className="ml-1">Suspend</span>
                                      </Button>
                                    : <Button onClick={() => executeAction(`/admin/users/${userId}/status`, 'PATCH', 'Akun CREATOR diaktifkan!', 'status-active')} variant="outline" className="text-[9px] py-1 px-2 border-blue-500 text-blue-500 hover:bg-blue-50">
                                        <UserCheck size={12} /> <span className="ml-1">Activate</span>
                                      </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </>
            )}

            {/* === TAB: SUBMISSIONS === */}
            {activeTab === 'submissions' && (
              <>
                <thead className="bg-gray-50 text-[#7a7d85] text-[11px] uppercase border-b">
                  <tr>
                    <th className="p-4">Submission & Link</th>
                    <th className="p-4 text-center">Views</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Intervensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading
                    ? <tr><td colSpan="4" className="p-12 text-center text-[#7a7d85]">Memuat data...</td></tr>
                    : filteredSubmissions.length === 0
                    ? <tr><td colSpan="4" className="p-12 text-center text-gray-400 italic">Tidak ada submission.</td></tr>
                    : filteredSubmissions.map(s => {
                        const campaignName = getSafeRel(s.campaigns, 'nama_campaign');
                        const creatorName = getSafeRel(s.creators, 'nama_lengkap');
                        const isFinalized = s.status === 'SELESAI' || s.status === 'SIAP_BAYAR' || s.status === 'DITOLAK';
                        return (
                          <tr key={s.submission_id} className="hover:bg-gray-50/50">
                            <td className="p-4">
                              <div className="font-bold text-[#404145] text-[12px]">{campaignName}</div>
                              <div className="text-[10px] text-blue-600 truncate w-48" title={s.content_url}>
                                {s.content_url || '-'}
                              </div>
                              <div className="text-[10px] text-gray-400">By: {creatorName}</div>
                            </td>
                            <td className="p-4 text-center font-bold text-[#404145]">
                              {(s.views_tervalidasi || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-4 text-center"><StatusBadge status={s.status} /></td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  onClick={() => setSelectedSubmission(s)}
                                  variant="outline"
                                  className="text-[9px] py-1 px-2 border-blue-500 text-blue-500 hover:bg-blue-50"
                                >
                                  <Eye size={12} /> Detail
                                </Button>
                                <Button
                                  onClick={() => executeAction(`/admin/submissions/${s.submission_id}/approve`, 'PATCH', 'Submission disetujui & saldo dikirim!', 'approve')}
                                  variant="outline"
                                  className="text-[9px] py-1 px-2 border-green-600 text-green-600 hover:bg-green-50"
                                  disabled={isFinalized}
                                  title={isFinalized ? `Status "${s.status}" tidak dapat diubah.` : 'Setujui & Bayar ke Creator'}
                                >
                                  <CheckCircle size={12} className="mr-1" /> Approve
                                </Button>
                                <Button
                                  onClick={() => executeAction(`/admin/submissions/${s.submission_id}/invalidate`, 'PATCH', 'Submission ditolak!', 'reject')}
                                  variant="outline"
                                  className="text-[9px] py-1 px-2 border-orange-500 text-orange-500 hover:bg-orange-50"
                                  disabled={isFinalized}
                                  title={isFinalized ? `Status "${s.status}" tidak dapat diubah. Gunakan Hold Wallet.` : 'Invalidate Submission'}
                                >
                                  <FileX size={12} className="mr-1" /> Reject
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </>
            )}

            {/* === TAB: CAMPAIGNS - Monitoring === */}
            {activeTab === 'campaigns' && campaignSubTab === 'active' && (
              <>
                <thead className="bg-[#f3f0ff] text-purple-900 text-[11px] uppercase border-b">
                  <tr>
                    <th className="p-4">Campaign & Brand</th>
                    <th className="p-4 text-center">Budget Sisa</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Force Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 text-sm">
                  {loading
                    ? <tr><td colSpan="4" className="p-12 text-center text-[#7a7d85]">Memuat data...</td></tr>
                    : filteredCampaigns.length === 0
                    ? <tr><td colSpan="4" className="p-12 text-center text-gray-400 italic">Data tidak ditemukan.</td></tr>
                    : filteredCampaigns.map(c => {
                        const brandName = getSafeRel(c.brands, 'nama_perusahaan');
                        return (
                          <tr key={c.campaign_id} className="hover:bg-purple-50/30">
                            <td className="p-4">
                              <div className="font-black text-gray-900">{c.nama_campaign}</div>
                              <div className="text-[11px] text-purple-600 font-bold uppercase tracking-tight">{brandName}</div>
                            </td>
                            <td className="p-4 text-center font-bold text-green-600 bg-green-50/50">
                              Rp {(c.budget_tersisa || 0).toLocaleString('id-ID')}
                            </td>
                            <td className="p-4 text-center"><StatusBadge status={c.status} /></td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  onClick={() => navigate(`/dashboard/fraud-ops/campaigns/${c.campaign_id}`)}
                                  variant="outline"
                                  className="text-[10px] py-1.5 px-4 font-black border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full"
                                >
                                  <Eye size={12} className="inline mr-1" /> Detail
                                </Button>
                                {c.status === 'AKTIF'
                                  ? <Button
                                      onClick={() => executeAction(`/admin/campaigns/${c.campaign_id}/status`, 'PATCH', 'Campaign dihentikan!', 'cancel-campaign')}
                                      className="bg-gradient-to-r from-red-600 to-red-500 text-white text-[10px] font-black uppercase py-2 px-4 shadow-md rounded-full hover:scale-105 transition-transform"
                                    >
                                      <AlertOctagon size={12} className="mr-1 inline" /> Stop Campaign
                                    </Button>
                                  : <Button
                                      onClick={() => executeAction(`/admin/campaigns/${c.campaign_id}/status`, 'PATCH', 'Campaign diaktifkan kembali!', 'activate-campaign')}
                                      className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] font-black uppercase py-2 px-4 shadow-md rounded-full hover:scale-105 transition-transform"
                                    >
                                      <RefreshCw size={12} className="mr-1 inline" /> Activate Campaign
                                    </Button>
                                }
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </>
            )}

            {/* === TAB: CAMPAIGNS - Registered Brands === */}
            {activeTab === 'campaigns' && campaignSubTab === 'brands' && (
              <>
                <thead className="bg-[#f3f0ff] text-purple-900 text-[11px] uppercase border-b">
                  <tr>
                    <th className="p-4">Brand / Perusahaan</th>
                    <th className="p-4">PIC / Kontak</th>
                    <th className="p-4 text-center">User Status</th>
                    <th className="p-4 text-center">Global God Mode Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100 text-sm">
                  {loading
                    ? <tr><td colSpan="4" className="p-12 text-center text-[#7a7d85]">Memuat data...</td></tr>
                    : filteredBrands.length === 0
                    ? <tr><td colSpan="4" className="p-12 text-center text-gray-400 italic">Data brand tidak ditemukan.</td></tr>
                    : filteredBrands.map(b => {
                        const userData = Array.isArray(b.users) ? b.users[0] : b.users;
                        const userStatus = userData?.status || '-';
                        // user_id is a direct field on brands table
                        const userId = b.user_id || '-';
                        return (
                          <tr key={b.id} className="hover:bg-purple-50/30">
                            <td className="p-4">
                              <div className="font-black text-gray-900">{b.nama_perusahaan}</div>
                              <div className="text-[10px] text-blue-600 font-bold">{userData?.email || '-'}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-gray-700">{b.pic_name || '-'}</div>
                            </td>
                            <td className="p-4 text-center"><StatusBadge status={userStatus} /></td>
                            <td className="p-4 text-center">
                              {userStatus === 'ACTIVE'
                                ? <Button
                                    onClick={() => executeAction(`/admin/users/${userId}/status`, 'PATCH', 'Akun BRAND disuspended!', 'status-suspended')}
                                    variant="outline"
                                    className="text-[10px] py-1.5 px-4 font-black border-red-500 text-red-600 hover:bg-red-50 rounded-full"
                                    disabled={userId === '-'}
                                  >
                                    <UserX size={12} className="inline mr-1" /> Suspend Account
                                  </Button>
                                : <Button
                                    onClick={() => executeAction(`/admin/users/${userId}/status`, 'PATCH', 'Akun BRAND diaktifkan!', 'status-active')}
                                    variant="outline"
                                    className="text-[10px] py-1.5 px-4 font-black border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full"
                                    disabled={userId === '-'}
                                  >
                                    <UserCheck size={12} className="inline mr-1" /> Activate Account
                                  </Button>
                              }
                            </td>
                          </tr>
                        );
                      })
                  }
                </tbody>
              </>
            )}

          </table>
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

      {/* === DETAIL MODAL: ANOMALY === */}
      {selectedAnomaly && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedAnomaly(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
            <div className={`p-5 flex justify-between items-center ${selectedAnomaly.risk === 'HIGH' ? 'bg-red-50' : 'bg-amber-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedAnomaly.risk === 'HIGH' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-black text-lg text-gray-900 tracking-tight">{selectedAnomaly.type}</h3>
                  <RiskBadge risk={selectedAnomaly.risk} />
                </div>
              </div>
              <button
                onClick={() => setSelectedAnomaly(null)}
                className="p-1 hover:bg-gray-200/50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Analisa Masalah</div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedAnomaly.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Target Entitas</div>
                  <div className="font-bold text-gray-900 text-sm">{selectedAnomaly.name || '-'}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">ID Referensi</div>
                  <div className="font-mono text-[11px] text-blue-600 bg-blue-50 px-2 py-1 rounded break-all">
                    {selectedAnomaly.entity_id}
                  </div>
                </div>
              </div>

              {selectedAnomaly.involved_actors?.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users size={12} />
                    <label className="text-[10px] font-black uppercase tracking-wider">
                      Aktor Terlibat ({selectedAnomaly.involved_actors.length})
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto py-1">
                    {selectedAnomaly.involved_actors.map((actor, idx) => (
                      <div key={idx} className="bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-xs font-bold text-gray-700">
                        {actor}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-gray-50 border-t flex gap-3">
              <Button onClick={() => setSelectedAnomaly(null)} variant="outline" className="flex-1 font-bold text-xs py-2.5 rounded-xl border-gray-300">
                Tutup
              </Button>
              {['IP_CLUSTER', 'VELOCITY', 'GHOST_REVENUE', 'SPAM'].includes(selectedAnomaly.type) && (
                <Button
                  onClick={() => {
                    setSelectedAnomaly(null);
                    executeAction(`/admin/wallets/${selectedAnomaly.entity_id}/hold`, 'POST', 'Berhasil dibekukan!', 'hold');
                  }}
                  className="flex-1 bg-red-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700"
                >
                  Eksekusi Hold
                </Button>
              )}
              {selectedAnomaly.type === 'BRAND_BURN' && (
                <Button
                  onClick={() => {
                    setSelectedAnomaly(null);
                    executeAction(`/admin/users/${selectedAnomaly.entity_id}/status`, 'PATCH', 'Akun Brand berhasil disuspend!', 'status-suspended');
                  }}
                  className="flex-1 bg-red-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-red-200 hover:bg-red-700"
                >
                  Suspend Brand
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === DETAIL MODAL: WALLET & CREATOR === */}
      {selectedWallet && (() => {
        const creatorData = Array.isArray(selectedWallet.creators) ? selectedWallet.creators[0] : selectedWallet.creators;
        const userData = creatorData?.users ? (Array.isArray(creatorData.users) ? creatorData.users[0] : creatorData.users) : null;
        return (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedWallet(null); }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="p-5 flex justify-between items-center bg-red-50 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-600 text-white">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900">Detail Wallet & Creator</h3>
                    <p className="text-xs text-gray-500">{creatorData?.nama_lengkap || 'Unknown Creator'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedWallet(null)} className="p-1 hover:bg-gray-200/50 rounded-full text-gray-400 hover:text-gray-900">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-green-50 rounded-xl text-center">
                    <div className="text-[10px] font-black uppercase text-green-600">Saldo Aktif</div>
                    <div className="font-black text-green-700 text-sm mt-1">Rp {(selectedWallet.balance || 0).toLocaleString('id-ID')}</div>
                  </div>
                  <div className="p-4 bg-red-50 rounded-xl text-center">
                    <div className="text-[10px] font-black uppercase text-red-600">Hold</div>
                    <div className="font-black text-red-700 text-sm mt-1">Rp {(selectedWallet.hold_balance || 0).toLocaleString('id-ID')}</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl text-center">
                    <div className="text-[10px] font-black uppercase text-blue-600">Total Earned</div>
                    <div className="font-black text-blue-700 text-sm mt-1">Rp {(selectedWallet.total_earned || 0).toLocaleString('id-ID')}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider border-b pb-2">Informasi Creator</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] font-black text-gray-400 uppercase">Nama Lengkap</div>
                      <div className="font-bold text-gray-900 text-sm">{creatorData?.nama_lengkap || '-'}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] font-black text-gray-400 uppercase">Status Akun</div>
                      <StatusBadge status={userData?.status || '-'} />
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] font-black text-gray-400 uppercase">Email</div>
                      <div className="font-bold text-gray-900 text-sm">{userData?.email || '-'}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] font-black text-gray-400 uppercase">KYC Status</div>
                      <div className="font-bold text-gray-900 text-sm">{creatorData?.kyc_status || '-'}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] font-black text-gray-400 uppercase">NIK</div>
                      <div className="font-mono text-xs text-gray-700">{creatorData?.nik || '-'}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] font-black text-gray-400 uppercase">NPWP</div>
                      <div className="font-mono text-xs text-gray-700">{creatorData?.npwp || '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Wallet ID</div>
                  <div className="font-mono text-[11px] text-blue-600 bg-blue-50 px-3 py-2 rounded break-all">{selectedWallet.wallet_id}</div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t flex gap-3">
                <Button onClick={() => setSelectedWallet(null)} variant="outline" className="flex-1 font-bold text-xs py-2.5 rounded-xl">
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* === DETAIL MODAL: SUBMISSION === */}
      {selectedSubmission && (() => {
        const campaignName = getSafeRel(selectedSubmission.campaigns, 'nama_campaign');
        const creatorName = getSafeRel(selectedSubmission.creators, 'nama_lengkap');
        const isFinalized = selectedSubmission.status === 'SELESAI' || selectedSubmission.status === 'SIAP_BAYAR' || selectedSubmission.status === 'DITOLAK';
        return (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setSelectedSubmission(null); }}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="p-5 flex justify-between items-center bg-orange-50 border-b border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-600 text-white">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900">Detail Submission</h3>
                    <p className="text-xs text-gray-500">{campaignName}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedSubmission(null)} className="p-1 hover:bg-gray-200/50 rounded-full text-gray-400 hover:text-gray-900">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase">Status</div>
                    <StatusBadge status={selectedSubmission.status} />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-gray-400 uppercase">Views Tervalidasi</div>
                    <div className="font-black text-orange-600 text-lg">{(selectedSubmission.views_tervalidasi || 0).toLocaleString('id-ID')}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-black text-sm text-gray-900 uppercase tracking-wider border-b pb-2">Informasi Submission</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                      <div className="text-[10px] font-black text-gray-400 uppercase">Campaign</div>
                      <div className="font-bold text-gray-900 text-sm">{campaignName}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] font-black text-gray-400 uppercase">Creator</div>
                      <div className="font-bold text-gray-900 text-sm">{creatorName}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-[10px] font-black text-gray-400 uppercase">Tanggal Submit</div>
                      <div className="font-bold text-gray-900 text-sm">{selectedSubmission.submitted_at ? new Date(selectedSubmission.submitted_at).toLocaleDateString('id-ID') : '-'}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Content URL</div>
                  <div className="p-3 bg-gray-50 rounded-lg break-all">
                    {selectedSubmission.content_url ? (
                      <a href={selectedSubmission.content_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline text-sm font-medium">
                        {selectedSubmission.content_url}
                      </a>
                    ) : '-'}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Submission ID</div>
                  <div className="font-mono text-[11px] text-blue-600 bg-blue-50 px-3 py-2 rounded break-all">{selectedSubmission.submission_id}</div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 border-t flex gap-3">
                <Button onClick={() => setSelectedSubmission(null)} variant="outline" className="flex-1 font-bold text-xs py-2.5 rounded-xl">
                  Tutup
                </Button>
                {!isFinalized && (
                  <>
                    <Button
                      onClick={() => {
                        setSelectedSubmission(null);
                        executeAction(`/admin/submissions/${selectedSubmission.submission_id}/invalidate`, 'PATCH', 'Submission ditolak!', 'reject');
                      }}
                      className="bg-orange-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-orange-700"
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedSubmission(null);
                        executeAction(`/admin/submissions/${selectedSubmission.submission_id}/approve`, 'PATCH', 'Submission disetujui!', 'approve');
                      }}
                      className="bg-green-600 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default AdminFraudOps;