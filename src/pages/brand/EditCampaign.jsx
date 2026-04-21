import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { Save, Trash2, Image as ImageIcon, X, DollarSign } from 'lucide-react';
import Swal from 'sweetalert2';

const EditCampaign = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  const [form, setForm] = useState(null);
  const [existingUrls, setExistingUrls] = useState([]); 
  const [newFiles, setNewFiles] = useState([]); 

  const loadCampaignData = async () => {
    try {
      const res = await fetchApi('/campaigns/my-campaigns');
      const found = res.data.find(c => c.campaign_id === id);
      if (found) {
        setForm(found);
        setExistingUrls(found.asset_urls || []); 
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaignData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isVideoUrl = (url) => url.match(/\.(mp4|webm|ogg)$/i) !== null;

  const handleFileChange = (e) => {
    if (e.target.files) {
      const validFiles = [];
      let hasOversizedFile = false;

      Array.from(e.target.files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
          hasOversizedFile = true;
        } else {
          validFiles.push({
            file: file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'image'
          });
        }
      });

      if (hasOversizedFile) {
        Swal.fire('File Terlalu Besar', 'Beberapa file diabaikan karena melebihi batas 10MB.', 'error');
      }

      setNewFiles([...newFiles, ...validFiles]);
    }
  };

  const removeExistingUrl = (index) => setExistingUrls(existingUrls.filter((_, idx) => idx !== index));
  
  const removeNewFile = (index) => {
    URL.revokeObjectURL(newFiles[index].preview);
    setNewFiles(newFiles.filter((_, idx) => idx !== index));
  };

  // --- HANDLER TOP UP BUDGET ---
  const handleTopup = async () => {
    const { value: amount } = await Swal.fire({
      title: 'Top Up Budget',
      input: 'number',
      inputLabel: 'Masukkan jumlah dana (Rp)',
      inputPlaceholder: 'Contoh: 1000000',
      showCancelButton: true,
      confirmButtonText: 'Proses Pembayaran',
      confirmButtonColor: '#1dbf73',
      inputValidator: (value) => {
        if (!value || value <= 0) return 'Harap masukkan jumlah yang valid!';
      }
    });

    if (!amount) return;

    try {
      Swal.showLoading();
      const response = await fetchApi(`/campaigns/${id}/topup`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseInt(amount) })
      });

      const { snap_token } = response.data;

      window.snap.pay(snap_token, {
        onSuccess: function (result) {
          // Ganti dari langsung Swal success menjadi:
          Swal.fire({
            title: 'Pembayaran Sedang Diproses',
            text: 'Mohon tunggu sebentar, sistem sedang memverifikasi dana Anda...',
            icon: 'info',
            showConfirmButton: false,
            timer: 2500, // Beri waktu 2.5 detik untuk Webhook backend bekerja
            timerProgressBar: true,
          }).then(() => {
            Swal.fire('Berhasil!', 'Pembayaran Anda telah diverifikasi.', 'success');
            // Gunakan loadCampaigns() untuk CampaignList atau loadCampaignData() untuk EditCampaign
            loadCampaigns(); 
          });
        },
        onPending: function (result) {
          Swal.fire('Menunggu Pembayaran!', 'Selesaikan pembayaran Anda segera.', 'warning');
        },
        onError: function (result) {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat pembayaran.', 'error');
        },
        onClose: function () {
          console.log('User menutup modal pembayaran sebelum selesai');
        }
      });
    } catch (err) {
      Swal.fire('Gagal!', err.message, 'error');
    }
  };

  // --- HANDLER UPDATE INFO ---
  const handleUpdateInfo = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('nama_campaign', form.nama_campaign);
    formData.append('daily_spend_limit', form.daily_spend_limit);
    formData.append('platform', form.platform);
    formData.append('komisi_per_view', form.komisi_per_view);
    formData.append('min_watch_duration', form.min_watch_duration);
    formData.append('max_submission_per_creator', form.max_submission_per_creator);
    formData.append('tanggal_mulai', form.tanggal_mulai);
    formData.append('tanggal_berakhir', form.tanggal_berakhir);
    formData.append('existing_asset_urls', JSON.stringify(existingUrls));

    newFiles.forEach((asset) => {
      formData.append('asset_files', asset.file); 
    });

    try {
      await fetchApi(`/campaigns/${id}`, { method: 'PUT', body: formData });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Campaign berhasil diperbarui!'
      }).then(() => loadCampaignData());

      setNewFiles([]);
    } catch (err) { 
      Swal.fire('Gagal Menyimpan', err.message, 'error'); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdateStatus = async (status) => {
    const confirm = await Swal.fire({
      title: 'Konfirmasi',
      text: `Ubah status campaign menjadi ${status}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Ubah',
      cancelButtonText: 'Batal'
    });

    if (!confirm.isConfirmed) return;

    try {
      await fetchApi(`/campaigns/${id}/status`, { 
        method: 'PATCH', 
        body: JSON.stringify({ status }) 
      });
      setForm({ ...form, status });
      Swal.fire('Berhasil', 'Status diperbarui!', 'success');
    } catch (err) { 
      Swal.fire('Gagal Memperbarui', err.message, 'error'); 
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'AKTIF': return 'text-[#1dbf73] bg-[#e8f9f0]';
      case 'DRAFT': return 'text-gray-600 bg-gray-100';
      case 'DIJEDA':
      case 'DIJEDA_HARIAN': return 'text-orange-600 bg-orange-100';
      case 'SELESAI_BUDGET':
      case 'SELESAI_WAKTU': return 'text-blue-600 bg-blue-100';
      case 'DIBATALKAN': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading || !form) return <div className="p-10 text-center text-[#7a7d85]">Memuat Detail Campaign...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-2xl font-black text-[#404145]">Kelola Campaign</h2>
        <div className="flex flex-wrap gap-2">
          {form.status === 'AKTIF' && (
            <Button variant="outline" onClick={() => handleUpdateStatus('DIJEDA')} className="text-orange-500 border-orange-200 hover:bg-orange-50">Jeda Campaign</Button>
          )}
          
          {(form.status === 'DRAFT' || form.status === 'DIJEDA' || form.status === 'DIJEDA_HARIAN') && (
            <Button variant="outline" onClick={() => handleUpdateStatus('AKTIF')} className="text-green-600 border-green-200 hover:bg-green-50">Aktifkan Campaign</Button>
          )}
          
          {(form.status !== 'DIBATALKAN' && form.status !== 'SELESAI_BUDGET' && form.status !== 'SELESAI_WAKTU') && (
            <Button variant="outline" onClick={() => handleUpdateStatus('DIBATALKAN')} className="text-red-500 border-red-200 hover:bg-red-50">Batalkan Campaign</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <form onSubmit={handleUpdateInfo} className="space-y-4">
            <h3 className="font-bold border-b pb-2 mb-4 text-[#404145]">Informasi Dasar</h3>
            <Input label="Nama Campaign" value={form.nama_campaign} onChange={(e) => setForm({...form, nama_campaign: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4">
              <Input label="Limit Harian (Rp)" type="number" value={form.daily_spend_limit} onChange={(e) => setForm({...form, daily_spend_limit: e.target.value})} />
              <Input label="Komisi per 1000 Views (Rp)" type="number" value={form.komisi_per_view} onChange={(e) => setForm({...form, komisi_per_view: e.target.value})} />
            </div>

            {/* BARU: Input Target & Durasi */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min. Durasi Tonton (Detik)" type="number" value={form.min_watch_duration} onChange={(e) => setForm({...form, min_watch_duration: e.target.value})} />
              <Input label="Maks. Submit / Creator" type="number" value={form.max_submission_per_creator} onChange={(e) => setForm({...form, max_submission_per_creator: e.target.value})} />
            </div>

            {/* BARU: Input Tanggal Mulai (Read-Only) & Berakhir */}
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Tanggal Mulai" 
                type="date" 
                value={form.tanggal_mulai ? form.tanggal_mulai.substring(0, 10) : ''} 
                disabled={true} 
              />
              <Input 
                label="Tanggal Berakhir" 
                type="date" 
                value={form.tanggal_berakhir ? form.tanggal_berakhir.substring(0, 10) : ''} 
                onChange={(e) => setForm({...form, tanggal_berakhir: e.target.value})} 
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
              <label className="block text-sm font-bold text-[#404145] mb-1 flex items-center gap-2">
                <ImageIcon size={16}/> Kelola Aset (Pilih Foto/Video Baru)
              </label>
              <p className="text-[10px] text-gray-500 mb-3 italic">* Maksimal ukuran file 10MB per file. Mendukung format gambar dan video.</p>
              
              <div className="flex gap-2 mb-4">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border rounded-md text-sm bg-white cursor-pointer"
                />
              </div>

              <div className="space-y-6">
                {existingUrls.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2 border-b pb-1">Aset Tersimpan (Database):</p>
                    <div className="flex flex-wrap gap-4">
                      {existingUrls.map((url, idx) => (
                        <div key={`old-${idx}`} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-white">
                          {isVideoUrl(url) ? (
                            <video src={url} className="w-full h-full object-cover" />
                          ) : (
                            <img src={url} alt="asset" className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-start justify-end p-1">
                            <button type="button" onClick={() => removeExistingUrl(idx)} className="bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-red-500 transition-all" title="Hapus Aset">
                              <Trash2 size={14}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newFiles.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-[#1dbf73] mb-2 border-b pb-1">Aset Baru (Siap Diunggah):</p>
                    <div className="flex flex-wrap gap-4">
                      {newFiles.map((asset, idx) => (
                        <div key={`new-${idx}`} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-green-400 shadow-sm bg-green-50">
                          {asset.type === 'video' ? (
                            <video src={asset.preview} className="w-full h-full object-cover" />
                          ) : (
                            <img src={asset.preview} alt={`new-${idx}`} className="w-full h-full object-cover" />
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-start justify-end p-1">
                            <button type="button" onClick={() => removeNewFile(idx)} className="bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-red-500 transition-all">
                              <X size={14}/>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-gray-100">
              <Button type="submit" disabled={loading} className="w-full gap-2">
                <Save size={18}/> {loading ? 'Memproses...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold mb-4 text-[#404145]">Status & Budget</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-[#7a7d85]">Status:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(form.status)}`}>
                  {form.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7a7d85]">Budget Total:</span>
                <span className="font-bold text-[#404145]">Rp {form.budget_total.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-[#7a7d85]">Sisa Budget:</span>
                <span className="font-bold text-[#1dbf73] text-lg">Rp {form.budget_tersisa.toLocaleString('id-ID')}</span>
              </div>
            </div>
            
            <div className="mt-4 pt-2">
              <Button onClick={handleTopup} className="w-full gap-2 bg-[#1dbf73] hover:bg-[#19a463]">
                <DollarSign size={16}/> Top Up Budget
              </Button>
              <p className="text-[10px] text-center text-gray-400 mt-2">Gunakan Midtrans untuk menambah saldo Campaign.</p>
            </div>
          </Card>
          <Button variant="ghost" onClick={() => navigate('/dashboard/campaigns')} className="w-full">Kembali ke Daftar</Button>
        </div>
      </div>
    </div>
  );
};

export default EditCampaign;