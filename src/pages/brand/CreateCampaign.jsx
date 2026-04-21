import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { X, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2'; 

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    nama_campaign: '', daily_spend_limit: '', 
    platform: 'TIKTOK', // [REVISI]: Gunakan huruf kapital sesuai ENUM database
    komisi_per_view: '', min_watch_duration: 15, max_submission_per_creator: 1,
    min_konten_diterima: 0,
    tanggal_mulai: '', tanggal_berakhir: ''
  });

  const [assetFiles, setAssetFiles] = useState([]); 

  const handleFileChange = (e) => {
    if (e.target.files) {
      const validFiles = [];
      let hasOversizedFile = false;

      Array.from(e.target.files).forEach(file => {
        // Validasi Ukuran File (Maksimal 10MB)
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
        Swal.fire({
          icon: 'error',
          title: 'File Terlalu Besar',
          text: 'Beberapa file diabaikan karena ukurannya melebihi batas maksimal 10MB.'
        });
      }

      setAssetFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeAsset = (index) => {
    URL.revokeObjectURL(assetFiles[index].preview);
    const newAssets = assetFiles.filter((_, i) => i !== index);
    setAssetFiles(newAssets);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('nama_campaign', form.nama_campaign);
    formData.append('budget_total', 0); 
    formData.append('daily_spend_limit', form.daily_spend_limit);
    formData.append('platform', form.platform);
    formData.append('komisi_per_view', form.komisi_per_view);
    formData.append('min_watch_duration', form.min_watch_duration);
    formData.append('max_submission_per_creator', form.max_submission_per_creator);
    formData.append('min_konten_diterima', form.min_konten_diterima || 0);
    formData.append('tanggal_mulai', form.tanggal_mulai);
    formData.append('tanggal_berakhir', form.tanggal_berakhir);

    assetFiles.forEach((asset) => {
      formData.append('asset_files', asset.file); 
    });

    try {
      await fetchApi('/campaigns', { method: 'POST', body: formData });
      
      Swal.fire({
        icon: 'success',
        title: 'Campaign Berhasil Dibuat!',
        text: 'Status saat ini adalah DRAFT. Lakukan Top-Up untuk mengaktifkannya.'
      }).then(() => {
        navigate('/dashboard/campaigns');
      });

    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menyimpan',
        text: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Buat Campaign Baru</h2>
      <Card className="max-w-6xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Campaign" required value={form.nama_campaign} onChange={(e) => setForm({...form, nama_campaign: e.target.value})} />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Limit Harian (Rp)" type="number" required value={form.daily_spend_limit} onChange={(e) => setForm({...form, daily_spend_limit: e.target.value})} />
            <Input label="Komisi per 1000 Views (Rp)" type="number" required value={form.komisi_per_view} onChange={(e) => setForm({...form, komisi_per_view: e.target.value})} />
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <label className="block text-sm font-bold text-[#404145] mb-1 flex items-center gap-2">
              <ImageIcon size={16}/> Aset Campaign (Pilih Foto/Video)
            </label>
            <p className="text-[10px] text-gray-500 mb-3 italic">* Maksimal ukuran file 10MB per file. Mendukung format gambar dan video.</p>
            
            <div className="flex gap-2 mb-3">
              <input 
                type="file" 
                multiple 
                accept="image/*,video/*"
                className="flex-1 px-3 py-2 border rounded-md text-sm bg-white cursor-pointer"
                onChange={handleFileChange}
              />
            </div>
            
            {assetFiles.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {assetFiles.map((asset, idx) => (
                  <div key={idx} className="relative group w-24 h-24 rounded-lg overflow-hidden border shadow-sm bg-white">
                    {asset.type === 'video' ? (
                      <video src={asset.preview} className="w-full h-full object-cover" />
                    ) : (
                      <img src={asset.preview} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-start justify-end p-1">
                      <button type="button" onClick={() => removeAsset(idx)} className="bg-white text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-red-500 transition-all">
                        <X size={14}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#404145] mb-2">Platform Utama</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73]" value={form.platform} onChange={(e) => setForm({...form, platform: e.target.value})}>
                {/* [REVISI]: value menggunakan huruf kapital */}
                <option value="TIKTOK">TikTok</option>
                <option value="INSTAGRAM">Instagram</option>
                <option value="YOUTUBE">YouTube</option>
              </select>
            </div>
            <Input label="Min. Durasi Tonton (Detik)" type="number" required value={form.min_watch_duration} onChange={(e) => setForm({...form, min_watch_duration: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Maks. Submit / Creator" type="number" required value={form.max_submission_per_creator} onChange={(e) => setForm({...form, max_submission_per_creator: e.target.value})} />
<<<<<<< HEAD
            <div>
              <label className="block text-sm font-bold text-[#404145] mb-2">Min. Konten Harus Diterima</label>
              <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm" placeholder="0 (opsional)" value={form.min_konten_diterima} onChange={(e) => setForm({...form, min_konten_diterima: e.target.value})} />
              <p className="text-[10px] text-gray-400 mt-1">Jumlah minimum konten yang ingin Anda terima dari campaign ini.</p>
            </div>
=======
            <div></div> 
>>>>>>> 319271fc958be65c2f30112029116e1cd85a1b75
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal Mulai" type="date" required value={form.tanggal_mulai} onChange={(e) => setForm({...form, tanggal_mulai: e.target.value})} />
            <Input label="Tanggal Berakhir" type="date" required value={form.tanggal_berakhir} onChange={(e) => setForm({...form, tanggal_berakhir: e.target.value})} />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/campaigns')}>Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Draft'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateCampaign;