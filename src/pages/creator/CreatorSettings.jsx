import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { ShieldCheck, Share2, Clock, CheckCircle, Smartphone } from 'lucide-react';

import { FaYoutube, FaInstagram, FaFacebook } from "react-icons/fa";
import Swal from 'sweetalert2';

// Definisi Platform yang Didukung beserta Icon-nya
const SUPPORTED_PLATFORMS = [
  { id: 'YOUTUBE', name: 'YouTube', icon: FaYoutube, color: 'text-red-500' },
  { id: 'TIKTOK', name: 'TikTok', icon: Smartphone, color: 'text-black' },
  { id: 'INSTAGRAM', name: 'Instagram', icon: FaInstagram, color: 'text-pink-600' },
  { id: 'FACEBOOK', name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' }
];

const CreatorSettings = () => {
  const [kycForm, setKycForm] = useState({ nik: '', npwp: '', ktp_image: null, selfie_image: null });
  const [loading, setLoading] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  
  const [profileData, setProfileData] = useState(null);
  const [connectedAccounts, setConnectedAccounts] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchApi('/creators/profile');
        if (res.data) {
          setProfileData(res.data);
          if (res.data.connected_social_accounts) {
            setConnectedAccounts(res.data.connected_social_accounts);
          }
        }
      } catch (err) {
        console.log('Error fetching profile', err);
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
      Swal.fire({ icon: 'error', title: 'Validasi Gagal', text: 'NIK harus berjumlah 16 digit.' });
      setLoading(false); return;
    }
    if (!kycForm.ktp_image || !kycForm.selfie_image) {
      Swal.fire({ icon: 'warning', title: 'Data Tidak Lengkap', text: 'Harap unggah Foto KTP dan Foto Selfie.' });
      setLoading(false); return;
    }

    try {
      const formData = new FormData();
      formData.append('nik', kycForm.nik);
      if (kycForm.npwp) formData.append('npwp', kycForm.npwp);
      formData.append('ktp_image', kycForm.ktp_image);
      formData.append('selfie_image', kycForm.selfie_image);

      const response = await fetchApi('/creators/kyc', { method: 'POST', body: formData });
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Data KYC berhasil dikirim.', confirmButtonColor: '#1dbf73' });
      
      setProfileData({ ...profileData, kyc_status: response.data.kyc_status || 'PENDING' });
      setKycForm({ nik: '', npwp: '', ktp_image: null, selfie_image: null });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.message, confirmButtonColor: '#d33' });
    } finally {
      setLoading(false);
    }
  };

  // --- ALUR OAUTH ASLI ---
  const handleConnectSocial = (platformId) => {
    // 1. Ganti dengan Client ID / App ID Anda
    const FB_APP_ID = 'APP_ID_FACEBOOK_ANDA'; // Ganti dengan App ID dari Meta Developers
    
    // 2. Tentukan Redirect URI (Halaman di frontend Anda yang akan menangani callback)
    // Misalnya: http://localhost:5173/oauth/callback
    // Pastikan URI ini didaftarkan di pengaturan aplikasi Meta Anda
    const redirectUri = encodeURIComponent(`${window.location.origin}/oauth/callback`);

    // Kita menggunakan state untuk mengirim informasi platform yang sedang dicoba dihubungkan
    const stateParam = encodeURIComponent(JSON.stringify({ platform: platformId }));

    if (platformId === 'FACEBOOK' || platformId === 'INSTAGRAM') {
      // Instagram API juga menggunakan infrastruktur Meta (Facebook Login)
      // Perbedaan biasanya ada di scope (izin) yang diminta
      
      let scopes = '';
      if (platformId === 'FACEBOOK') {
         scopes = 'public_profile'; // Scope dasar Facebook
      } else if (platformId === 'INSTAGRAM') {
         // Scope untuk Instagram Basic Display API
         scopes = 'user_profile,user_media'; 
      }

      // Bangun URL otorisasi Facebook/Meta
      // Catatan: Jika menggunakan Instagram Basic Display API khusus, URL-nya adalah api.instagram.com/oauth/authorize
      // Di sini kita asumsikan menggunakan Facebook Login untuk mengakses akun IG terhubung (cara umum)
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${redirectUri}&state=${stateParam}&scope=${scopes}`;
      
      // Redirect pengguna ke halaman otorisasi
      window.location.href = authUrl;
      return;
    }

    // (Contoh untuk YouTube agar tidak error jika diklik)
    if (platformId === 'YOUTUBE') {
        const GOOGLE_CLIENT_ID = 'CLIENT_ID_GOOGLE_ANDA';
        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&state=${stateParam}&scope=https://www.googleapis.com/auth/youtube.readonly`;
        window.location.href = googleAuthUrl;
        return;
    }

    // Jika platform belum didukung di frontend ini, gunakan mock untuk sementara
    Swal.fire({
      title: `Menghubungkan ke ${platformId}... (Mock)`,
      text: 'Fitur otorisasi asli belum dikonfigurasi untuk platform ini.',
      icon: 'info'
    });
  };

  const renderKycSection = () => {
    if (isFetchingProfile) return <div className="text-center p-4 text-gray-500">Memuat data...</div>;
    if (profileData && profileData.kyc_status === 'PENDING') {
      return (
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg text-center space-y-3">
          <Clock className="mx-auto text-orange-500" size={48} />
          <h4 className="font-bold text-orange-700 text-lg">Verifikasi Sedang Diproses</h4>
          <p className="text-sm text-orange-600">Dokumen KYC sedang ditinjau (Max 1x24 Jam).</p>
        </div>
      );
    }
    if (profileData && profileData.kyc_status === 'VERIFIED') {
      return (
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center space-y-3">
          <CheckCircle className="mx-auto text-[#1dbf73]" size={48} />
          <h4 className="font-bold text-green-700 text-lg">Akun Terverifikasi</h4>
          <p className="text-sm text-green-600">KYC Anda telah berhasil diverifikasi.</p>
        </div>
      );
    }
    return (
      <form onSubmit={handleKycSubmit} className="space-y-4">
        {profileData && profileData.kyc_status === 'REJECTED' && (
           <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200">KYC Ditolak. Harap unggah ulang dokumen.</div>
        )}
        <Input label="Nomor NIK" name="nik" required placeholder="16 digit angka" value={kycForm.nik} onChange={e => setKycForm({...kycForm, nik: e.target.value})} />
        <Input label="NPWP (Opsional)" name="npwp" placeholder="Masukkan NPWP" value={kycForm.npwp} onChange={e => setKycForm({...kycForm, npwp: e.target.value})} />
        <Input id="ktp_input" label="Foto KTP" name="ktp_image" type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'ktp_image')} />
        <Input id="selfie_input" label="Foto Selfie" name="selfie_image" type="file" accept="image/*" required onChange={(e) => handleFileChange(e, 'selfie_image')} />
        <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Mengunggah...' : 'Ajukan Verifikasi'}</Button>
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
          {renderKycSection()}
        </Card>

        <Card>
          <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
            <Share2 size={18} className="text-[#1dbf73]"/> Akun Sosial Media
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Hubungkan akun sosial media Anda untuk mulai mengambil campaign.
          </p>
          <div className="space-y-3">
            {SUPPORTED_PLATFORMS.map((platform) => {
              const linkedAccount = connectedAccounts.find(acc => acc.platform === platform.id);
              const Icon = platform.icon;

              return (
                <div key={platform.id} className="p-3 border rounded-md flex justify-between items-center bg-gray-50 hover:bg-white transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-white rounded-full shadow-sm border ${platform.color}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold block text-[#404145]">{platform.name}</span>
                      {linkedAccount && (
                        <span className="text-xs text-gray-500 font-mono">@{linkedAccount.username}</span>
                      )}
                    </div>
                  </div>
                  
                  {linkedAccount ? (
                    <span className="text-[10px] font-bold text-[#1dbf73] bg-green-100 px-2 py-1 rounded-full border border-green-200">
                      Terhubung
                    </span>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="text-xs py-1 px-3 h-8" 
                      onClick={() => handleConnectSocial(platform.id)}
                    >
                      Hubungkan
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

      </div>
    </div>
  );
};

export default CreatorSettings;