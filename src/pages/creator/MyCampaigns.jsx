import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import {
  Bookmark, ArrowLeft, Send, Link, ExternalLink,
  Megaphone, DollarSign, Calendar, CheckCircle2,
  Clock, AlertCircle, XCircle, Eye, Loader2, TrendingUp,
  Layout, Download, PlayCircle, Search, X, Filter
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/ui/Pagination';

const StatusBadge = ({ status }) => {
  const map = {
    AKTIF: { cls: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={10}/> },
    DRAFT: { cls: 'bg-gray-100 text-gray-600', icon: <Clock size={10}/> },
    DIJEDA: { cls: 'bg-orange-100 text-orange-700', icon: <Clock size={10}/> },
    DIBATALKAN: { cls: 'bg-red-100 text-red-700', icon: <XCircle size={10}/> },
    SELESAI_BUDGET: { cls: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 size={10}/> },
    SELESAI_WAKTU: { cls: 'bg-blue-100 text-blue-700', icon: <CheckCircle2 size={10}/> },
    PENDING: { cls: 'bg-yellow-100 text-yellow-700', icon: <Clock size={10}/> },
    DITOLAK: { cls: 'bg-red-100 text-red-700', icon: <XCircle size={10}/> },
    DIPROSES: { cls: 'bg-indigo-100 text-indigo-700', icon: <Clock size={10}/> },
    SIAP_BAYAR: { cls: 'bg-purple-100 text-purple-700', icon: <DollarSign size={10}/> },
    SELESAI: { cls: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={10}/> },
  };
  const cfg = map[status] || { cls: 'bg-gray-100 text-gray-500', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase ${cfg.cls}`}>
      {cfg.icon} {status?.replace(/_/g, ' ')}
    </span>
  );
};

const MyCampaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignPagination, setCampaignPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [campaignFilters, setCampaignFilters] = useState({
    page: 1,
    limit: 6,
    search: '',
    platform: '',
    status: ''
  });
  
  // Detail States
  const [view, setView] = useState('list'); // 'list' | 'detail'
  const [detailCampaign, setDetailCampaign] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsPagination, setSubmissionsPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [submissionsFilters, setSubmissionsFilters] = useState({
    page: 1,
    limit: 10,
    status: ''
  });
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);

  const loadCampaignsList = useCallback(async () => {
    setLoading(true);
    try {
      // Use the correct endpoint for creators (my-joined)
      const res = await fetchApi('/campaigns/my-joined', {
        params: campaignFilters
      });
      setCampaigns(res.data || []);
      if (res.pagination) {
        setCampaignPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'Gagal memuat daftar campaign', 'error');
    } finally {
      setLoading(false);
    }
  }, [campaignFilters]);

  useEffect(() => { 
    if (view === 'list') loadCampaignsList(); 
  }, [loadCampaignsList, view]);

  // Real-time Traffic Polling (Every 30s when in detail view)
  useEffect(() => {
    let intervalId;
    if (view === 'detail' && detailCampaign) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetchApi(`/submissions/by-campaign/${detailCampaign.campaign_id}`, {
            params: submissionsFilters
          });
          setSubmissions(res.data?.submissions || []);
        } catch (error) {
          console.error("Gagal refresh traffic live", error);
        }
      }, 30000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [view, detailCampaign]);

  const loadSubmissions = useCallback(async () => {
    if (!detailCampaign) return;
    setSubmissionsLoading(true);
    try {
      const res = await fetchApi(`/submissions/by-campaign/${detailCampaign.campaign_id}`, {
        params: submissionsFilters
      });
      if (res.data?.campaign_info) {
        setDetailCampaign(prev => ({ ...prev, ...res.data.campaign_info }));
      }
      setSubmissions(res.data?.submissions || []);
      if (res.pagination) {
        setSubmissionsPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Gagal', 'Terjadi masalah saat memuat detail campaign.', 'error');
    } finally {
      setSubmissionsLoading(false);
    }
  }, [detailCampaign?.campaign_id, submissionsFilters]);

  useEffect(() => {
    if (view === 'detail') loadSubmissions();
  }, [loadSubmissions, view]);

  const openCampaignDetail = (campaign) => {
    setView('detail');
    setDetailCampaign(campaign);
    setSubmissionsFilters({ page: 1, limit: 10, status: '' });
  };

  const handleBackToList = () => {
    setView('list');
    setDetailCampaign(null);
    setSubmissions([]);
    setCampaignFilters(prev => ({ ...prev, page: 1 }));
  };

  const isVideoUrl = (url) => url?.match(/\.(mp4|webm|ogg)$/i) !== null;

  const handleDownload = async (url) => {
    try {
      Swal.fire({ title: 'Mengunduh...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a'); a.style.display = 'none'; a.href = blobUrl;
      a.download = url.split('/').pop() || 'campaign_asset';
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(blobUrl); document.body.removeChild(a);
      Swal.close();
    } catch (error) {
      Swal.close(); window.open(url, '_blank');
    }
  };

  const validateUrl = (url, platform) => {
    if (!url) return true;
    const p = platform?.toUpperCase();
    if (p === 'YOUTUBE') return url.includes('youtube.com') || url.includes('youtu.be');
    if (p === 'TIKTOK') return url.includes('tiktok.com');
    if (p === 'INSTAGRAM') return url.includes('instagram.com');
    return true;
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionUrl.trim()) return Swal.fire('Error', 'Harap masukkan link konten Anda!', 'error');
    
    // Validasi Platform sesuai permintaan User
    if (!validateUrl(submissionUrl, detailCampaign?.platform)) {
      return Swal.fire({
        icon: 'warning',
        title: 'Platform Tidak Sesuai',
        text: `Campaign ini hanya menerima link dari ${detailCampaign?.platform}. Harap masukkan URL yang benar.`,
        confirmButtonColor: '#1dbf73'
      });
    }

    setSubmitting(true);
    try {
      await fetchApi('/submissions', {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: detailCampaign.campaign_id,
          content_url: submissionUrl
        })
      });
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Konten Anda telah disubmit.', confirmButtonColor: '#1dbf73' });
      setSubmissionUrl('');
      loadSubmissions();
    } catch (err) {
      Swal.fire('Gagal Submit', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // --- ASSET PREVIEW MODAL ---
  const AssetPreviewModal = () => {
    if (!previewAsset) return null;
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewAsset(null)} />
        <div className="relative max-w-5xl w-full flex flex-col items-center">
          <button onClick={() => setPreviewAsset(null)} className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold hover:text-[#1dbf73]">
            <X size={24}/> Tutup
          </button>
          <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
            {isVideoUrl(previewAsset) ? (
              <video src={previewAsset} controls autoPlay className="max-h-[80vh] w-auto mx-auto" />
            ) : (
              <img src={previewAsset} alt="Preview" className="max-h-[80vh] w-auto object-contain" />
            )}
          </div>
          <div className="mt-4">
            <Button onClick={() => handleDownload(previewAsset)} className="bg-[#1dbf73] hover:bg-[#19a463] flex items-center gap-2">
              <Download size={18}/> Unduh Materi Ini
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // --- SUB-VIEW: LIST CAMPAIGNS ---
  if (view === 'list') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#404145] flex items-center gap-2">
              <Bookmark className="text-[#1dbf73]" size={24}/> My Campaigns
            </h2>
            <p className="text-sm text-gray-500 mt-1">Daftar campaign yang Anda ikuti dan performa konten Anda.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm">
            <Filter size={16} className="text-[#7a7d85]" />
            <select 
              className="bg-transparent font-bold text-[#404145] outline-none cursor-pointer" 
              value={campaignFilters.limit} 
              onChange={e => setCampaignFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            >
              <option value={6}>6 Campaign</option>
              <option value={12}>12 Campaign</option>
              <option value={24}>24 Campaign</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm w-full md:w-64">
            <Search size={16} className="text-[#7a7d85]" />
            <input 
              type="text" 
              placeholder="Cari campaign..." 
              className="bg-transparent outline-none w-full font-medium"
              value={campaignFilters.search}
              onChange={(e) => setCampaignFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>
            <Button onClick={() => navigate('/dashboard/explore')} variant="outline" className="gap-2 text-sm">
              <Megaphone size={16}/> Cari Campaign Baru
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#1dbf73]" size={40}/>
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="text-center py-20 border-2 border-dashed border-gray-200">
            <Bookmark size={56} className="mx-auto text-gray-300 mb-4"/>
            <h3 className="text-lg font-bold text-[#404145] mb-2">Belum ada campaign yang diikuti</h3>
            <p className="text-sm text-gray-400 mb-8 max-w-sm mx-auto">Cari campaign yang cocok di halaman Eksplorasi.</p>
            <Button onClick={() => navigate('/dashboard/explore')} className="bg-[#1dbf73] hover:bg-[#19a463] mx-auto h-12 px-8">Mulai Eksplorasi</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map(c => (
              <Card key={c.campaign_id} className="group flex flex-col hover:shadow-xl transition-all border border-gray-100 cursor-pointer hover:-translate-y-1 bg-white relative overflow-hidden" onClick={() => openCampaignDetail(c)}>
                <div className="absolute top-0 right-0 p-3"><StatusBadge status={c.status}/></div>
                <div className="mb-4"><span className="text-[10px] font-black text-white bg-[#1dbf73] px-2 py-1 rounded uppercase">{c.platform}</span></div>
                <h4 className="font-black text-[#404145] text-lg leading-tight mb-1 group-hover:text-[#1dbf73]">{c.nama_campaign}</h4>
                {c.brand_name && <p className="text-xs text-gray-400 mb-6 flex items-center gap-1 font-medium"><Megaphone size={12}/> {c.brand_name}</p>}
                <div className="grid grid-cols-3 gap-1 bg-gray-50 rounded-xl py-3 px-1 mb-6 text-center border">
                  <div>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">Submit</p>
                    <p className="font-black text-[#404145] text-base">{c.submission_count}</p>
                  </div>
                  <div className="border-x border-gray-200 px-1">
                    <p className="text-[8px] text-gray-400 font-bold uppercase">Views</p>
                    <p className="font-black text-blue-600 text-base">{(c.total_views || 0).toLocaleString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-[8px] text-gray-400 font-bold uppercase">Earned</p>
                    <p className="font-black text-[#1dbf73] text-[13px] mt-0.5 leading-none">
                      Rp{(c.total_earning || 0).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center group-hover:bg-gray-50 -mx-6 -mb-6 px-6 pb-6">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1 font-bold uppercase"><Calendar size={12}/> Joined {new Date(c.joined_at).toLocaleDateString('id-ID')}</span>
                  <div className="flex items-center gap-1 text-[#1dbf73] font-black text-xs">MANAGE <ArrowLeft className="rotate-180" size={14}/></div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <Pagination
            currentPage={campaignPagination.current_page}
            totalPages={campaignPagination.total_pages}
            totalItems={campaignPagination.total_items}
            limit={campaignFilters.limit}
            onPageChange={(page) => setCampaignFilters(prev => ({ ...prev, page }))}
            loading={loading}
          />
        </div>
      </div>
    );
  }

  // --- SUB-VIEW: DETAIL CAMPAIGN ---
  const isActive = detailCampaign?.status === 'AKTIF';
  const totalEarning = submissions.reduce((a, s) => a + (s.net_earning || 0), 0);
  const totalViews = submissions.reduce((a, s) => a + (s.views || 0), 0);
  const assets = Array.isArray(detailCampaign?.asset_urls) ? detailCampaign.asset_urls : [];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <AssetPreviewModal />
      
      {/* Header Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleBackToList} className="bg-gray-100 hover:bg-gray-200 p-2.5 rounded-full text-gray-600">
              <ArrowLeft size={22}/>
            </Button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-[#404145]">{detailCampaign?.nama_campaign}</h2>
                <StatusBadge status={detailCampaign?.status} />
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#1dbf73]">
                <span className="bg-[#1dbf73] text-white px-2 py-0.5 rounded text-[10px] uppercase font-black">{detailCampaign?.platform}</span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">{detailCampaign?.brand_name}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 pr-4">
             <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Komisi per 1000 Views</p>
                <p className="text-xl font-black text-[#1dbf73]">Rp {detailCampaign?.komisi_per_view?.toLocaleString('id-ID')}</p>
             </div>
             <div className="h-10 w-px bg-gray-200 hidden md:block"></div>
             <div className="text-right">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Total Earned</p>
                <p className="text-xl font-black text-[#404145]">Rp {totalEarning.toLocaleString('id-ID')}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Stats + Submissions + ASSETS! */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center py-4"><p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Status</p><p className="font-black text-sm uppercase">{detailCampaign?.status}</p></Card>
            <Card className="text-center py-4"><p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Views</p><p className="text-xl font-black text-blue-600">{totalViews.toLocaleString('id-ID')}</p></Card>
            <Card className="text-center py-4"><p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Submission</p><p className="text-xl font-black text-purple-600">{submissions.length}</p></Card>
            <Card className="text-center py-4"><p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Sisa Budget</p><p className="text-lg font-black text-[#1dbf73]">Rp{detailCampaign?.budget_tersisa?.toLocaleString('id-ID') || '0'}</p></Card>
          </div>

          {/* MATERI CAMPAIGN SECTION (PENTING AGAR SESUAI ASLINYA) */}
          <Card className="shadow-lg border-none ring-1 ring-gray-200">
            <h3 className="font-black text-[#404145] mb-4 flex items-center gap-2 border-b pb-4">
              <Download size={20} className="text-[#1dbf73]"/> Materi Campaign (Unduh untuk Konten)
            </h3>
            {assets.length === 0 ? (
              <p className="text-center py-6 text-gray-400 italic text-sm">Brand tidak menyertakan aset visual.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {assets.map((url, idx) => (
                  <div key={idx} className="group relative border rounded-xl overflow-hidden bg-gray-50 aspect-video">
                    <div className="w-full h-full cursor-pointer relative" onClick={() => setPreviewAsset(url)}>
                      {isVideoUrl(url) ? (
                        <>
                          <video src={url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                            <PlayCircle className="text-white drop-shadow-lg" size={40}/>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full relative">
                          <img src={url} alt={`Asset ${idx}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                            <Search className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24}/>
                          </div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleDownload(url)} className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-md text-[#1dbf73] hover:bg-[#1dbf73] hover:text-white transition-all transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100">
                      <Download size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-[11px] text-blue-700 font-bold flex items-center gap-2">
              <AlertCircle size={14}/> GUNAKAN MATERI DI ATAS SEBAGAI BAHAN UNTUK MEMBUAT KONTEN ANDA.
            </div>
          </Card>

          {/* LIST SUBMISSIONS */}
          <Card className="p-0 overflow-hidden shadow-lg border-none ring-1 ring-gray-200">
            <div className="p-5 bg-gray-50/50 border-b flex items-center justify-between">
              <div className="flex items-center gap-2"><div className="p-2 bg-[#1dbf73]/10 rounded-lg"><TrendingUp size={20} className="text-[#1dbf73]"/></div><h3 className="font-black text-[#404145]">Riwayat Konten & Link Traffic</h3></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-black uppercase text-gray-400">
                  <span>Limit:</span>
                  <select 
                    className="bg-transparent outline-none text-gray-900 cursor-pointer"
                    value={submissionsFilters.limit}
                    onChange={e => setSubmissionsFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-black uppercase text-gray-400">
                  <Filter size={12} />
                  <select 
                    className="bg-transparent outline-none text-gray-900 cursor-pointer"
                    value={submissionsFilters.status}
                    onChange={e => setSubmissionsFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                  >
                    <option value="">Semua Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-white">
              {submissionsLoading ? (<div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#1dbf73] mb-4" size={40}/></div>) : submissions.length === 0 ? (
                <div className="p-20 text-center text-gray-400 italic">Belum ada konten yang disubmit.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead><tr className="text-[11px] uppercase text-gray-400 font-black border-b bg-gray-50/50"><th className="px-6 py-4">Konten</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-center">Views</th><th className="px-6 py-4 text-right">Earning</th></tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {submissions.map((s, idx) => (
                        <tr key={s.submission_id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4">
                             <a href={s.content_url} target="_blank" rel="noreferrer" className="text-[#1dbf73] font-black text-sm flex items-center gap-1.5 hover:underline truncate max-w-[200px]"><ExternalLink size={14}/> {s.content_url}</a>
                             <span className="text-[10px] text-gray-400 font-bold uppercase">{new Date(s.submitted_at).toLocaleDateString('id-ID')}</span>
                          </td>
                          <td className="px-6 py-4 text-center"><StatusBadge status={s.status}/></td>
                          <td className="px-6 py-4 text-center font-black text-gray-700">{(s.views || 0).toLocaleString('id-ID')}</td>
                          <td className="px-6 py-4 text-right">
                             <p className={`font-black ${s.net_earning > 0 ? 'text-[#1dbf73]' : 'text-gray-400'}`}>Rp{(s.net_earning || 0).toLocaleString('id-ID')}</p>
                             {s.status === 'PENDING' && <p className="text-[9px] text-amber-500 font-bold">Est. Rp{(s.estimasi_komisi || 0).toLocaleString('id-ID')}</p>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-white">
              <Pagination
                currentPage={submissionsPagination.current_page}
                totalPages={submissionsPagination.total_pages}
                totalItems={submissionsPagination.total_items}
                limit={submissionsFilters.limit}
                onPageChange={(page) => setSubmissionsFilters(prev => ({ ...prev, page }))}
                loading={submissionsLoading}
              />
            </div>
          </Card>
        </div>

        {/* Right Col: Submit + Tech Info */}
        <div className="lg:col-span-1 space-y-6">
          {isActive ? (
            <Card className="border-2 border-[#1dbf73] shadow-xl relative overflow-hidden">
              <h3 className="font-black text-[#404145] text-lg mb-4 flex items-center gap-2"><Send size={22} className="text-[#1dbf73]"/> Submit Konten Baru</h3>
              <form onSubmit={handleSubmitWork} className="space-y-4">
                <div>
                  {!validateUrl(submissionUrl, detailCampaign?.platform) && submissionUrl.length > 0 && (
                    <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 animate-in fade-in slide-in-from-top-1">
                      <AlertCircle size={14} className="shrink-0"/>
                      <p className="text-[10px] font-black uppercase leading-tight">Link ini bukan {detailCampaign?.platform}!</p>
                    </div>
                  )}
                  <label className="block text-[10px] font-black text-[#404145] mb-2 uppercase text-gray-400">URL Postingan Sosial Media</label>
                  <div className="relative"><Link className="absolute left-4 top-3.5 text-gray-400" size={18}/>
                    <input type="url" required placeholder="https://..." className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl outline-none focus:border-[#1dbf73] text-sm" value={submissionUrl} onChange={(e) => setSubmissionUrl(e.target.value)} />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={submitting || !validateUrl(submissionUrl, detailCampaign?.platform)} 
                  className={`w-full h-14 text-md font-black shadow-lg rounded-xl transition-all active:scale-[0.98] ${!validateUrl(submissionUrl, detailCampaign?.platform) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#1dbf73] hover:bg-[#19a463] text-white'}`}
                >
                  {submitting ? <Loader2 className="animate-spin" size={20}/> : 'KIRIM SUBMISSION'}
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="text-center py-10 grayscale opacity-60">
              <XCircle size={48} className="mx-auto text-gray-300 mb-4"/><p className="font-black text-gray-500 uppercase tracking-widest">Campaign Nonaktif</p>
            </Card>
          )}

          <Card className="bg-gray-900 text-white border-none p-6">
            <h4 className="font-black text-sm mb-4 uppercase flex items-center gap-2"><AlertCircle size={16} className="text-[#1dbf73]"/> Syarat & Ketentuan</h4>
            <div className="space-y-4">
              {[
                { label: 'Minimum Durasi', value: `${detailCampaign?.min_watch_duration || '0'} Detik` },
                { label: 'Platform', value: detailCampaign?.platform },
                { label: 'Max Submission', value: `${detailCampaign?.max_submission_per_creator || '0'}x / User` },
                { label: 'Target Campaign', value: detailCampaign?.min_konten_diterima ? `${detailCampaign.min_konten_requirements || detailCampaign.min_konten_diterima} Konten` : 'None' }
              ].map((item, i) => (
                <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-[9px] text-gray-500 font-black uppercase">{item.label}</span>
                  <span className="text-xs font-black">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyCampaigns;
