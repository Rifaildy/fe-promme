// --- src/pages/creator/ExploreCampaigns.jsx ---
import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { 
  Search, DollarSign, ArrowLeft, Download, 
  Video, Send, Link, X, PlayCircle, UserPlus, CheckCircle2,
  Clock, Megaphone, Calendar
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../components/ui/Pagination';

const StatusBadge = ({ status }) => {
  const map = {
    AKTIF: 'bg-green-100 text-green-700',
    DRAFT: 'bg-gray-100 text-gray-600',
    DIJEDA: 'bg-orange-100 text-orange-700',
    DIBATALKAN: 'bg-red-100 text-red-700',
    SELESAI_BUDGET: 'bg-blue-100 text-blue-700',
    SELESAI_WAKTU: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status?.replace('_', ' ')}
    </span>
  );
};

const ExploreCampaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 9,
    search: '',
    platform: '',
    status: 'AKTIF',
    sort: '-created_at',
    budget_min: '',
    budget_max: ''
  });
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [joining, setJoining] = useState(false);
  const [previewAsset, setPreviewAsset] = useState(null);

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/campaigns/explore', { 
        params: filters 
      });
      setCampaigns(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const isVideoUrl = (url) => url?.match(/\.(mp4|webm|ogg)$/i) !== null;

  const handleDownload = async (url) => {
    try {
      Swal.fire({ title: 'Mengunduh...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none'; a.href = blobUrl;
      a.download = url.split('/').pop() || 'campaign_asset';
      document.body.appendChild(a); a.click();
      window.URL.revokeObjectURL(blobUrl); document.body.removeChild(a);
      Swal.close();
    } catch (error) {
      Swal.close(); window.open(url, '_blank');
    }
  };

  const handleJoin = async () => {
    if (!selectedCampaign) return;
    setJoining(true);
    try {
      await fetchApi(`/campaigns/${selectedCampaign.campaign_id}/join`, { method: 'POST' });
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil Bergabung!',
        text: `Anda kini terdaftar di campaign "${selectedCampaign.nama_campaign}". Silakan submit konten Anda.`,
        confirmButtonColor: '#1dbf73'
      });
      // Update local state — tandai sudah join
      setCampaigns(prev => prev.map(c =>
        c.campaign_id === selectedCampaign.campaign_id ? { ...c, is_joined: true } : c
      ));
      setSelectedCampaign(prev => ({ ...prev, is_joined: true }));
    } catch (err) {
      Swal.fire('Gagal', err.message || 'Gagal bergabung dengan campaign', 'error');
    } finally {
      setJoining(false);
    }
  };

  // Submission functionality removed from Explore page as per request
  // Creators should go to 'My Campaigns' to submit content.

  // --- ASSET PREVIEW MODAL ---
  const AssetPreviewModal = () => {
    if (!previewAsset) return null;
    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10">
        <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewAsset(null)} />
        <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center">
          <button onClick={() => setPreviewAsset(null)} className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2 font-bold">
            <X size={24}/> Tutup
          </button>
          <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
            {isVideoUrl(previewAsset) ? (
              <video src={previewAsset} controls autoPlay className="max-h-[80vh] w-auto mx-auto" />
            ) : (
              <img src={previewAsset} alt="Preview" className="max-h-[80vh] w-auto object-contain" />
            )}
          </div>
          <div className="mt-4 flex gap-4">
            <Button onClick={() => handleDownload(previewAsset)} className="bg-[#1dbf73] hover:bg-[#19a463] flex items-center gap-2">
              <Download size={18}/> Unduh Aset Ini
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER: DETAIL VIEW ---
  if (selectedCampaign) {
    const assets = Array.isArray(selectedCampaign.asset_urls) ? selectedCampaign.asset_urls : [];
    const isJoined = selectedCampaign.is_joined === true;

    return (
      <div className="space-y-6">
        <AssetPreviewModal />
        
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <Button variant="ghost" onClick={() => setSelectedCampaign(null)} className="px-3 bg-white shadow-sm hover:bg-gray-100">
            <ArrowLeft size={20}/>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-[#404145]">{selectedCampaign.nama_campaign}</h2>
              <StatusBadge status={selectedCampaign.status} />
              {isJoined && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-black rounded-full">
                  <CheckCircle2 size={10}/> SUDAH BERGABUNG
                </span>
              )}
            </div>
            <p className="text-sm font-bold text-[#1dbf73] uppercase mt-1">
              {selectedCampaign.platform} {selectedCampaign.brand_name && `· ${selectedCampaign.brand_name}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details + Assets */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-bold text-[#404145] mb-4 border-b pb-2">Detail Campaign</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Komisi per 1k Views</p>
                  <p className="font-bold text-[#1dbf73] text-lg">Rp {selectedCampaign.komisi_per_view?.toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Min. Durasi Tonton</p>
                  <p className="font-bold text-[#404145] text-lg">{selectedCampaign.min_watch_duration} Detik</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Batas Submit</p>
                  <p className="font-bold text-[#404145] text-lg">{selectedCampaign.max_submission_per_creator}x</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Berakhir Pada</p>
                  <p className="font-bold text-red-500 text-lg">{selectedCampaign.tanggal_berakhir?.substring(0, 10) || '-'}</p>
                </div>
              </div>
              {selectedCampaign.min_konten_diterima > 0 && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 font-medium">
                  ⚡ Brand menetapkan minimum <strong>{selectedCampaign.min_konten_diterima} konten</strong> harus diterima dalam campaign ini.
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-bold text-[#404145] mb-4 border-b pb-2 flex items-center gap-2">
                <Download size={18}/> Aset Campaign (Materi)
              </h3>
              {assets.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6 italic">Brand tidak mengunggah aset untuk campaign ini.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {assets.map((url, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden bg-gray-50 shadow-sm group">
                      <div className="h-32 w-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative" onClick={() => setPreviewAsset(url)}>
                        {isVideoUrl(url) ? (
                          <div className="relative w-full h-full">
                            <video src={url} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all">
                              <PlayCircle className="text-white drop-shadow-lg" size={40}/>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            <img src={url} alt={`Asset ${idx}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                              <Search className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24}/>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-white flex justify-between items-center border-t">
                        <span className="text-[10px] text-gray-500 truncate max-w-[100px]">Materi_{idx + 1}</span>
                        <button onClick={() => handleDownload(url)} className="text-[#1dbf73] hover:text-white hover:bg-[#1dbf73] border border-[#1dbf73] p-1.5 rounded transition-colors" title="Unduh">
                          <Download size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right: Action Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Step 1: Join */}
            {!isJoined ? (
              <Card className="border-2 border-dashed border-[#1dbf73] bg-green-50/30">
                <div className="text-center py-4">
                  <div className="w-14 h-14 bg-[#1dbf73]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UserPlus size={28} className="text-[#1dbf73]" />
                  </div>
                  <h3 className="font-black text-[#404145] text-lg mb-2">Bergabung Dulu</h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    Untuk bisa submit konten, Anda harus bergabung dengan campaign ini terlebih dahulu.
                  </p>
                  <Button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full bg-[#1dbf73] hover:bg-[#19a463] h-12 text-md gap-2"
                  >
                    <UserPlus size={18}/> {joining ? 'Mendaftar...' : 'Gabung Campaign'}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="border-[#1dbf73] bg-green-50 shadow-sm">
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <CheckCircle2 size={32} className="text-[#1dbf73]" />
                  </div>
                  <h3 className="font-black text-[#404145] text-lg mb-2">Anda Sudah Bergabung</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Silakan buka menu <b>My Campaigns</b> untuk melakukan manajemen dan submit konten.
                  </p>
                  <Button
                    onClick={() => navigate('/dashboard/my-campaigns')}
                    className="w-full bg-[#1dbf73] hover:bg-[#19a463] h-12 gap-2"
                  >
                    Buka My Campaigns
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: GRID UTAMA ---
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#404145]">Eksplorasi Campaign</h2>
        <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
          <select 
            className="w-full md:w-32 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm font-bold text-[#404145] bg-white cursor-pointer"
            value={filters.limit}
            onChange={e => handleFilterChange('limit', parseInt(e.target.value))}
          >
            <option value={9}>9 Item</option>
            <option value={18}>18 Item</option>
            <option value={36}>36 Item</option>
          </select>
          <select 
            className="w-full md:w-40 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm font-bold text-[#404145] bg-white cursor-pointer"
            value={filters.platform}
            onChange={e => handleFilterChange('platform', e.target.value)}
          >
            <option value="">Semua Platform</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="TIKTOK">TikTok</option>
            <option value="YOUTUBE">YouTube</option>
          </select>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari campaign atau brand..."
              className="w-full pl-10 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {/* Advanced Filters */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full p-4 bg-white rounded-xl shadow-sm border border-gray-100">
        <span className="text-sm font-bold text-gray-500 min-w-max">Filter & Urutkan:</span>
        <select 
          className="w-full md:w-auto px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm bg-gray-50 cursor-pointer"
          value={filters.sort}
          onChange={e => handleFilterChange('sort', e.target.value)}
        >
          <option value="-created_at">Terbaru</option>
          <option value="created_at">Terlama</option>
          <option value="-budget_total">Budget Tertinggi</option>
          <option value="budget_total">Budget Terendah</option>
        </select>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="number"
            placeholder="Min Budget (Rp)"
            className="w-full md:w-36 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm bg-gray-50"
            value={filters.budget_min}
            onChange={e => handleFilterChange('budget_min', e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input
            type="number"
            placeholder="Max Budget (Rp)"
            className="w-full md:w-36 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm bg-gray-50"
            value={filters.budget_max}
            onChange={e => handleFilterChange('budget_max', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-[#7a7d85] col-span-full text-center py-10">Mencari campaign aktif...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-[#7a7d85] col-span-full text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
            Belum ada campaign yang tersedia.
          </p>
        ) : (
          campaigns.map((c) => (
            <Card key={c.campaign_id} className="flex flex-col h-full hover:shadow-md transition-shadow border border-gray-100 relative">
              {c.is_joined && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 text-[9px] font-black px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={9}/> JOINED
                  </span>
                </div>
              )}
              <div className="flex-1 space-y-2">
                <span className="text-[10px] font-bold text-white bg-[#1dbf73] px-2 py-1 rounded uppercase tracking-wider">
                  {c.platform}
                </span>
                
                <div className="flex items-start gap-3 mt-4 mb-3">
                  <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-gray-50 overflow-hidden shrink-0 shadow-sm">
                    {c.brand_logo ? (
                      <img src={c.brand_logo} alt={c.brand_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#1dbf73] font-black text-sm">
                        {c.brand_name?.charAt(0).toUpperCase() || 'P'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#404145] text-lg leading-tight line-clamp-2">{c.nama_campaign}</h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{c.brand_name || 'Brand Partner'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#1dbf73] font-bold text-sm">
                  <DollarSign size={16}/> Rp {c.komisi_per_view?.toLocaleString('id-ID')}
                  <span className="text-gray-400 font-normal text-xs">/ 1000 Views</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Calendar size={11}/> {c.tanggal_berakhir?.substring(0, 10) || 'Tidak terbatas'}
                </div>
                <Button 
                  onClick={() => { setSelectedCampaign(c); setSubmissionUrl(''); }} 
                  className="text-xs py-1.5 px-4 bg-gray-900 hover:bg-black text-white"
                >
                  Lihat Detail
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          limit={filters.limit}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default ExploreCampaigns;