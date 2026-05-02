import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { ShieldCheck, Share2, Clock, CheckCircle, Smartphone, User } from 'lucide-react';

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

  // --- OAUTH FLOW DENGAN BACKEND ---
  const handleConnectSocial = async (platformId) => {
    try {
      // Tampilkan SweetAlert Loading
      Swal.fire({
        title: `Menghubungkan ke ${platformId}...`,
        text: 'Meminta akses URL otorisasi dari server',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      console.log(`[OAuth] Requesting authorization URL for platform: ${platformId}`);

      // 1. Dapatkan Otorisasi URL dari Backend
      // Backend endpoint expects platform as uppercase in URL path
      const response = await fetchApi(`/creators/oauth/authorize/${platformId.toUpperCase()}`);
      
      console.log(`[OAuth] Authorization URL received:`, response.data);

      if (response.data && response.data.authorization_url) {
        // 2. Simpan platform yang sedang di-connect ke session (untuk di-cek saat Callback URL dirender)
        sessionStorage.setItem('oauth_platform', platformId.toUpperCase());
        
        console.log(`[OAuth] Redirecting to provider authorization URL`);
        
        // 3. Redirect ke URL Otorisasi Provider Media Sosial
        window.location.href = response.data.authorization_url;
      } else {
         throw new Error('Server tidak merespons dengan URL otorisasi yang valid.');
      }
    } catch (err) {
      console.error(`[OAuth] Error getting authorization URL:`, err);
      
      Swal.fire({
        icon: 'error',
        title: 'Gagal Mendapatkan Authorization URL',
        text: err.message || 'Terjadi kesalahan sistem saat mencoba menghubungi penyedia layanan.',
        confirmButtonColor: '#d33'
      });
    }
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

      {/* Profil Saya Card */}
      {profileData && (
        <Card className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User size={48} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div>
              <h3 className="text-2xl font-black text-gray-900">{profileData.nama_lengkap || '-'}</h3>
              <p className="text-sm font-bold text-gray-500">{profileData.users?.email || '-'}</p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-md ${profileData.users?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                Status: {profileData.users?.status || 'UNKNOWN'}
              </span>
              <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-md ${profileData.kyc_status === 'VERIFIED' ? 'bg-green-100 text-green-700' : profileData.kyc_status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                KYC: {profileData.kyc_status || 'UNVERIFIED'}
              </span>
            </div>
          </div>
        </Card>
      )}

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
