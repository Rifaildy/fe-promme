// --- src/pages/creator/CreatorSettings.jsx ---
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { ShieldCheck, Share2 } from 'lucide-react';

const CreatorSettings = () => {
  // 1. Pembaruan State untuk menyimpan objek file, bukan URL
  const [kycForm, setKycForm] = useState({
    nik: '',
    ktp_file: null, // Ubah dari ktp_image_url menjadi ktp_file
    selfie_file: null // Ubah dari selfie_image_url menjadi selfie_file
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 3. Fungsi Handler untuk perubahan file
  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setKycForm({ ...kycForm, [field]: e.target.files[0] });
    }
  };

  // 4. Pembaruan Submit untuk mengirim data sebagai FormData
  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // Validasi file
    if (!kycForm.ktp_file || !kycForm.selfie_file) {
      setErrorMsg('Harap unggah Foto KTP dan Foto Selfie.');
      setLoading(false);
      return;
    }

    try {
      // Gunakan FormData untuk mengirim data multipart/form-data
      const formData = new FormData();
      formData.append('nik', kycForm.nik);
      formData.append('ktp_file', kycForm.ktp_file); // Tambahkan objek file
      formData.append('selfie_file', kycForm.selfie_file); // Tambahkan objek file

      // Saya mengasumsikan endpoint API backend untuk pengajuan KYC yang sama
      // Tetapi backend perlu diperbarui untuk menangani FormData
      const endpoint = '/creators/kyc';

      await fetchApi(endpoint, {
        method: 'POST',
        body: formData // Kirim FormData sebagai body request
      });

      alert('Data KYC berhasil dikirim! Mohon tunggu verifikasi admin.');
      // Atur ulang form
      setKycForm({ nik: '', ktp_file: null, selfie_file: null });
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Pengaturan Akun</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#1dbf73]"/> Verifikasi KYC
          </h3>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleKycSubmit} className="space-y-4">
            <Input 
              label="Nomor NIK" 
              name="nik"
              required 
              placeholder="16 digit angka" 
              value={kycForm.nik} 
              onChange={e => setKycForm({...kycForm, nik: e.target.value})} 
            />
            
            {/* 2. Ganti input teks dengan input file */}
            <Input
              label="Foto KTP"
              name="ktp_file"
              type="file"
              accept="image/*" // Batasi hanya file gambar
              required
              onChange={(e) => handleFileChange(e, 'ktp_file')}
            />
            
            {/* 2. Ganti input teks dengan input file */}
            <Input
              label="Foto Selfie"
              name="selfie_file"
              type="file"
              accept="image/*" // Batasi hanya file gambar
              required
              onChange={(e) => handleFileChange(e, 'selfie_file')}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Mengirim Data...' : 'Ajukan Verifikasi'}
            </Button>
            <p className="text-[10px] text-[#7a7d85] text-center italic mt-2">
              Harap unggah Foto KTP dan Foto Selfie yang jelas.
            </p>
          </form>
        </Card>

        <Card>
          <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
            <Share2 size={18} className="text-[#1dbf73]"/> Akun Sosial Media
          </h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-md flex justify-between items-center bg-gray-50">
              <span className="text-sm font-bold">TikTok</span>
              <Button variant="outline" className="text-xs py-1">Hubungkan</Button>
            </div>
            <div className="p-3 border rounded-md flex justify-between items-center bg-gray-50">
              <span className="text-sm font-bold">Instagram</span>
              <Button variant="outline" className="text-xs py-1">Hubungkan</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CreatorSettings;