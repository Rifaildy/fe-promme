// --- src/pages/creator/ExploreCampaigns.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { 
  Search, DollarSign, ArrowLeft, Download, 
  Video, Send, Link, X, PlayCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const ExploreCampaigns = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk mode detail & submission
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // [BARU] State untuk pratinjau aset (Modal)
  const [previewAsset, setPreviewAsset] = useState(null);

  useEffect(() => {
    fetchApi('/campaigns/explore')
      .then(res => setCampaigns(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const isVideoUrl = (url) => url.match(/\.(mp4|webm|ogg)$/i) !== null;

  const handleDownload = async (url) => {
    try {
      Swal.fire({ 
        title: 'Mengunduh...', 
        text: 'Mohon tunggu sebentar', 
        allowOutsideClick: false, 
        didOpen: () => Swal.showLoading() 
      });
      
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = blobUrl;
      a.download = url.split('/').pop() || 'campaign_asset';
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      Swal.close();
    } catch (error) {
      Swal.close();
      window.open(url, '_blank');
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!submissionUrl) return Swal.fire('Error', 'Harap masukkan link konten Anda!', 'error');

    setSubmitting(true);
    try {
      await fetchApi('/submissions', {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: selectedCampaign.campaign_id,
          content_url: submissionUrl
        })
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil Disubmit!',
        text: 'Pekerjaan Anda sedang ditinjau. Anda dapat memantaunya di menu Submissions.',
        confirmButtonColor: '#1dbf73'
      }).then(() => {
        navigate('/dashboard/submissions');
      });

    } catch (err) {
      Swal.fire('Gagal Submit', err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // --- [BARU] KOMPONEN MODAL PREVIEW ---
  const AssetPreviewModal = () => {
    if (!previewAsset) return null;

    return (
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10">
        {/* Overlay Background */}
        <div 
          className="absolute inset-0 bg-black/90 backdrop-blur-sm" 
          onClick={() => setPreviewAsset(null)} 
        />
        
        {/* Konten Modal */}
        <div className="relative max-w-5xl w-full max-h-full flex flex-col items-center">
          <button 
            onClick={() => setPreviewAsset(null)}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 flex items-center gap-2 font-bold"
          >
            <X size={24}/> Tutup
          </button>

          <div className="w-full bg-black rounded-xl overflow-hidden shadow-2xl flex items-center justify-center">
            {isVideoUrl(previewAsset) ? (
              <video 
                src={previewAsset} 
                controls 
                autoPlay 
                className="max-h-[80vh] w-auto mx-auto"
              />
            ) : (
              <img 
                src={previewAsset} 
                alt="Preview" 
                className="max-h-[80vh] w-auto object-contain"
              />
            )}
          </div>
          
          <div className="mt-4 flex gap-4">
            <Button 
              onClick={() => handleDownload(previewAsset)}
              className="bg-[#1dbf73] hover:bg-[#19a463] flex items-center gap-2"
            >
              <Download size={18}/> Unduh Aset Ini
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER MODE DETAIL CAMPAIGN ---
  if (selectedCampaign) {
    const assets = Array.isArray(selectedCampaign.asset_urls) ? selectedCampaign.asset_urls : [];

    return (
      <div className="space-y-6">
        <AssetPreviewModal />
        
        <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
          <Button variant="ghost" onClick={() => setSelectedCampaign(null)} className="px-3 bg-white shadow-sm hover:bg-gray-100">
            <ArrowLeft size={20}/>
          </Button>
          <div>
            <h2 className="text-2xl font-black text-[#404145]">{selectedCampaign.nama_campaign}</h2>
            <p className="text-sm font-bold text-[#1dbf73] uppercase mt-1">{selectedCampaign.platform}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-bold text-[#404145] mb-4 border-b pb-2">Detail Pekerjaan</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Komisi per View</p>
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
            </Card>

            <Card>
              <h3 className="font-bold text-[#404145] mb-4 border-b pb-2 flex items-center gap-2">
                <Download size={18}/> Aset Campaign (Materi)
              </h3>
              
              {assets.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-6 italic">Brand tidak mengunggah aset materi untuk campaign ini.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {assets.map((url, idx) => (
                    <div key={idx} className="border rounded-lg overflow-hidden bg-gray-50 shadow-sm group">
                      {/* Thumbnail Container (Clickable for Preview) */}
                      <div 
                        className="h-32 w-full bg-gray-200 flex items-center justify-center overflow-hidden cursor-pointer relative"
                        onClick={() => setPreviewAsset(url)}
                      >
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
                        <button 
                          onClick={() => handleDownload(url)}
                          className="text-[#1dbf73] hover:text-white hover:bg-[#1dbf73] border border-[#1dbf73] p-1.5 rounded transition-colors"
                          title="Unduh Materi"
                        >
                          <Download size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-green-200 shadow-md">
              <h3 className="font-bold text-[#404145] mb-4 border-b pb-2 flex items-center gap-2">
                <Send size={18} className="text-[#1dbf73]"/> Submit Pekerjaan
              </h3>
              
              <div className="text-sm text-gray-600 mb-6 space-y-2">
                <p>1. Lihat dan unduh materi di samping sebagai panduan.</p>
                <p>2. Publish konten kreatif Anda di <b>{selectedCampaign.platform}</b>.</p>
                <p>3. Pastikan link konten bersifat publik.</p>
              </div>

              <form onSubmit={handleSubmitWork} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-[#404145] mb-2 flex items-center gap-2">
                    <Link size={16}/> Link Konten Anda
                  </label>
                  <input 
                    type="url" 
                    required
                    placeholder={`https://www.${selectedCampaign.platform.toLowerCase()}.com/...`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm"
                    value={submissionUrl}
                    onChange={(e) => setSubmissionUrl(e.target.value)}
                  />
                </div>
                
                <Button type="submit" disabled={submitting} className="w-full bg-[#1dbf73] hover:bg-[#19a463] h-12 text-md gap-2">
                  <Send size={18}/> {submitting ? 'Mengirim...' : 'Submit Konten'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER MODE UTAMA (GRID CAMPAIGN) ---
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#404145]">Eksplorasi Campaign</h2>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Cari campaign..." 
            className="w-full pl-10 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73]" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-[#7a7d85] col-span-full text-center py-10">Mencari campaign aktif...</p>
        ) : campaigns.length === 0 ? (
          <p className="text-[#7a7d85] col-span-full text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
            Belum ada campaign yang tersedia untuk saat ini.
          </p>
        ) : (
          campaigns.map(c => (
            <Card key={c.campaign_id} className="flex flex-col h-full hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex-1">
                <span className="text-[10px] font-bold text-white bg-[#1dbf73] px-2 py-1 rounded uppercase tracking-wider">{c.platform}</span>
                <h4 className="font-bold text-[#404145] text-lg mt-3 leading-tight">{c.nama_campaign}</h4>
                <div className="flex items-center gap-1 text-[#1dbf73] font-bold text-sm mt-3">
                  <DollarSign size={16}/> Rp {c.komisi_per_view?.toLocaleString('id-ID')} <span className="text-gray-400 font-normal text-xs">/ View</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-[#7a7d85]">Min. Durasi</p>
                  <p className="font-bold text-sm text-[#404145]">{c.min_watch_duration} Detik</p>
                </div>
                <Button onClick={() => setSelectedCampaign(c)} className="text-xs py-1.5 px-4 bg-gray-900 hover:bg-black text-white">
                  Lihat Detail
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ExploreCampaigns;