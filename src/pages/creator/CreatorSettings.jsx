import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { ShieldCheck, Share2, Clock, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const CreatorSettings = () => {
  const [kycForm, setKycForm] = useState({
    nik: '',
    npwp: '',
    ktp_image: null,
    selfie_image: null
  });
  
  const [loading, setLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  
  // State untuk menyimpan data profile / status KYC saat ini
  const [profileData, setProfileData] = useState(null);

  // Mengambil data profile/KYC saat halaman pertama kali dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Catatan: Endpoint ini perlu Anda buat di backend (GET /creators/profile)
        // Jika belum ada, blok catch akan menangkap error dan menampilkan form biasa
        const res = await fetchApi('/creators/profile');
        if (res.data) {
          setProfileData(res.data);
        }
      } catch (err) {
        console.log('Belum ada data profile atau endpoint belum tersedia.');
      } finally {
        setIsFetchingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files[0]) {
      setKycForm({ ...kycForm, [field]: e.target.files[0] });
    }
  };

  const handleKycSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (kycForm.nik.length !== 16) {
      Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'NIK harus berjumlah 16 digit.',
      });
      setLoading(false);
      return;
    }

    if (!kycForm.ktp_image || !kycForm.selfie_image) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Tidak Lengkap',
        text: 'Harap unggah Foto KTP dan Foto Selfie.',
      });
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('nik', kycForm.nik);
      if (kycForm.npwp && kycForm.npwp.trim() !== '') {
        formData.append('npwp', kycForm.npwp);
      }
      formData.append('ktp_image', kycForm.ktp_image);
      formData.append('selfie_image', kycForm.selfie_image);

      const response = await fetchApi('/creators/kyc', {
        method: 'POST',
        body: formData 
      });

      // Tampilkan SweetAlert Sukses
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Data KYC berhasil dikirim. Mohon tunggu verifikasi admin.',
        confirmButtonColor: '#1dbf73'
      });
      
      // Update state dengan data yang baru saja dikembalikan oleh server
      // (Berdasarkan respon controller: kyc_status, ktp_image_url, selfie_image_url)
      setProfileData({
        nik: kycForm.nik,
        npwp: kycForm.npwp,
        kyc_status: response.data.kyc_status || 'PENDING',
        ktp_image_url: response.data.ktp_image_url,
        selfie_image_url: response.data.selfie_image_url
      });
      
      // Kosongkan form
      setKycForm({ nik: '', npwp: '', ktp_image: null, selfie_image: null });

    } catch (err) {
      // Tampilkan SweetAlert Error
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mengunggah',
        text: err.message || 'Terjadi kesalahan saat mengunggah data.',
        confirmButtonColor: '#d33'
      });
    } finally {
      setLoading(false);
    }
  };

  // Render UI Berdasarkan Status KYC
  const renderKycSection = () => {
    if (isFetchingProfile) {
      return <div className="text-center p-4 text-gray-500">Memuat data...</div>;
    }

    // Jika KYC sedang PENDING
    if (profileData && profileData.kyc_status === 'PENDING') {
      return (
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg text-center space-y-3">
          <Clock className="mx-auto text-orange-500" size={48} />
          <h4 className="font-bold text-orange-700 text-lg">Verifikasi Sedang Diproses</h4>
          <p className="text-sm text-orange-600">
            Terima kasih telah mengirimkan data (NIK: {profileData.nik}). Tim kami sedang meninjau dokumen KYC Anda. Proses ini biasanya memakan waktu 1x24 jam.
          </p>
        </div>
      );
    }

    // Jika KYC sudah VERIFIED
    if (profileData && profileData.kyc_status === 'VERIFIED') {
      return (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center space-y-3">
          <CheckCircle className="mx-auto text-[#1dbf73]" size={48} />
          <h4 className="font-bold text-green-700 text-lg">Akun Terverifikasi</h4>
          <p className="text-sm text-green-600">
            Selamat! Data KYC Anda telah berhasil diverifikasi. Anda sekarang dapat menarik dana dan menggunakan semua fitur kreator.
          </p>
          <div className="mt-4 p-3 bg-white rounded border border-green-100 text-left text-sm text-gray-700">
             <p><strong>NIK:</strong> {profileData.nik}</p>
             {profileData.npwp && <p><strong>NPWP:</strong> {profileData.npwp}</p>}
          </div>
        </div>
      );
    }

    // Default: Tampilkan Form (Belum KYC atau REJECTED)
    return (
      <form onSubmit={handleKycSubmit} className="space-y-4">
        {profileData && profileData.kyc_status === 'REJECTED' && (
           <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200">
             Dokumen KYC Anda sebelumnya ditolak. Harap unggah ulang dokumen yang lebih jelas.
           </div>
        )}
        <Input 
          label="Nomor NIK" 
          name="nik"
          required 
          placeholder="16 digit angka" 
          value={kycForm.nik} 
          onChange={e => setKycForm({...kycForm, nik: e.target.value})} 
        />
        
        <Input 
          label="NPWP (Opsional)" 
          name="npwp"
          placeholder="Masukkan NPWP jika ada" 
          value={kycForm.npwp} 
          onChange={e => setKycForm({...kycForm, npwp: e.target.value})} 
        />
        
        <Input
          id="ktp_input"
          label="Foto KTP"
          name="ktp_image"
          type="file"
          accept="image/*"
          required
          onChange={(e) => handleFileChange(e, 'ktp_image')}
        />
        
        <Input
          id="selfie_input"
          label="Foto Selfie"
          name="selfie_image"
          type="file"
          accept="image/*"
          required
          onChange={(e) => handleFileChange(e, 'selfie_image')}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Mengunggah Data...' : 'Ajukan Verifikasi'}
        </Button>
        <p className="text-[10px] text-[#7a7d85] text-center italic mt-2">
          Maksimal ukuran file adalah 5MB. Harap pastikan foto terbaca jelas.
        </p>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Pengaturan Akun</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#1dbf73]"/> Verifikasi KYC
          </h3>
          
          {/* Tampilkan Peringatan/Form berdasarkan Status */}
          {renderKycSection()}

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