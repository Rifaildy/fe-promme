import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { ShieldCheck, Share2, Clock, CheckCircle, Smartphone, User, Settings, Key, Image as ImageIcon, Loader2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('profil'); // 'profil', 'akun', 'sosial', 'verifikasi'

  const [profileForm, setProfileForm] = useState({ 
    nama_lengkap: '', profile_picture_url: '',
    bio: '', tanggal_lahir: '', jenis_kelamin: '',
    alamat: '', kota: '', provinsi: '', kode_pos: '', negara: '',
    bahasa: [], kategori_niche: []
  });
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileCompleted, setProfileCompleted] = useState(false);

  const JENIS_KELAMIN_OPTIONS = ['LAKI-LAKI', 'PEREMPUAN', 'LAINNYA'];
  const BAHASA_OPTIONS = ['Indonesia', 'English', 'Mandarin', 'Japanese', 'Korean', 'Lainnya'];
  const KATEGORI_NICHE_OPTIONS = [
    'LIFESTYLE', 'BEAUTY', 'FASHION', 'FOOD', 'TRAVEL', 'TECH', 
    'GAMING', 'EDUCATION', 'HEALTH_FITNESS', 'COMEDY', 'MUSIC', 
    'SPORTS', 'PARENTING', 'BUSINESS', 'ART_DESIGN', 'DIY_CRAFTS', 'LAINNYA'
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetchApi('/creators/profile');
        if (res.data) {
          setProfileData(res.data);
          setProfileForm({
            nama_lengkap: res.data.nama_lengkap || '',
            profile_picture_url: res.data.profile_picture_url || '',
            bio: res.data.bio || '',
            tanggal_lahir: res.data.tanggal_lahir || '',
            jenis_kelamin: res.data.jenis_kelamin || '',
            alamat: res.data.alamat || '',
            kota: res.data.kota || '',
            provinsi: res.data.provinsi || '',
            kode_pos: res.data.kode_pos || '',
            negara: res.data.negara || 'Indonesia',
            bahasa: res.data.bahasa || [],
            kategori_niche: res.data.kategori_niche || []
          });
          if (res.data.profile_picture_url) setProfilePreview(res.data.profile_picture_url);
          if (res.data.connected_social_accounts) {
            setConnectedAccounts(res.data.connected_social_accounts);
          }
          if (res.data.users) {
            setProfileCompleted(res.data.users.profile_completed || false);
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
      const file = e.target.files[0];
      if (field === 'profile_picture') {
        setProfileFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setProfilePreview(reader.result);
        reader.readAsDataURL(file);
      } else {
        setKycForm({ ...kycForm, [field]: file });
      }
    }
  };

  const handleCheckboxChange = (field, value) => {
    const currentArray = profileForm[field] || [];
    if (currentArray.includes(value)) {
      setProfileForm({
        ...profileForm,
        [field]: currentArray.filter(item => item !== value)
      });
    } else {
      setProfileForm({
        ...profileForm,
        [field]: [...currentArray, value]
      });
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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('nama_lengkap', profileForm.nama_lengkap);
      formData.append('bio', profileForm.bio);
      if (profileForm.tanggal_lahir) {
        formData.append('tanggal_lahir', profileForm.tanggal_lahir);
      }
      if (profileForm.jenis_kelamin) {
        formData.append('jenis_kelamin', profileForm.jenis_kelamin);
      }
      formData.append('alamat', profileForm.alamat);
      formData.append('kota', profileForm.kota);
      formData.append('provinsi', profileForm.provinsi);
      formData.append('kode_pos', profileForm.kode_pos);
      formData.append('negara', profileForm.negara);
      
      if (profileForm.bahasa && profileForm.bahasa.length > 0) {
        profileForm.bahasa.forEach(bahasa => {
          formData.append('bahasa', bahasa);
        });
      }
      
      if (profileForm.kategori_niche && profileForm.kategori_niche.length > 0) {
        profileForm.kategori_niche.forEach(niche => {
          formData.append('kategori_niche', niche);
        });
      }
      
      if (profileFile) {
        formData.append('profile_picture', profileFile);
      }
      
      const response = await fetchApi('/creators/profile', { method: 'PUT', body: formData });
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Profil berhasil diperbarui.', confirmButtonColor: '#1dbf73' });
      
      // Handle array or object response
      const updatedData = Array.isArray(response.data) ? response.data[0] : response.data;
      setProfileData({ ...profileData, ...updatedData });
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.message });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Konfirmasi password baru tidak cocok!' });
      return;
    }
    setPasswordLoading(true);
    try {
      await fetchApi('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ old_password: passwordForm.old_password, new_password: passwordForm.new_password })
      });
      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Password berhasil diubah.', confirmButtonColor: '#1dbf73' });
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleConnectSocial = async (platformId) => {
    try {
      Swal.fire({
        title: `Menghubungkan ke ${platformId}...`,
        text: 'Meminta akses URL otorisasi dari server',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      const response = await fetchApi(`/creators/oauth/authorize/${platformId.toUpperCase()}`);
      if (response.data && response.data.authorization_url) {
        sessionStorage.setItem('oauth_platform', platformId.toUpperCase());
        window.location.href = response.data.authorization_url;
      } else {
         throw new Error('Server tidak merespons dengan URL otorisasi yang valid.');
      }
    } catch (err) {
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
    if (profileData && profileData.kyc_status?.toUpperCase() === 'PENDING') {
      return (
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg text-center space-y-3">
          <Clock className="mx-auto text-orange-500" size={48} />
          <h4 className="font-bold text-orange-700 text-lg">Verifikasi Sedang Diproses</h4>
          <p className="text-sm text-orange-600">Dokumen KYC sedang ditinjau (Max 1x24 Jam).</p>
        </div>
      );
    }
    if (profileData && profileData.kyc_status?.toUpperCase() === 'VERIFIED') {
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

  if (isFetchingProfile) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-[#1dbf73]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Pengaturan</h2>

      {/* Tabs Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setActiveTab('profil')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'profil' ? 'border-[#1dbf73] text-[#1dbf73]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <User size={16} /> Profil Publik
        </button>
        <button 
          onClick={() => setActiveTab('akun')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'akun' ? 'border-[#1dbf73] text-[#1dbf73]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Settings size={16} /> Pengaturan Akun
        </button>
        <button 
          onClick={() => setActiveTab('sosial')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'sosial' ? 'border-[#1dbf73] text-[#1dbf73]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <Share2 size={16} /> Media Sosial
        </button>
        <button 
          onClick={() => setActiveTab('verifikasi')}
          className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'verifikasi' ? 'border-[#1dbf73] text-[#1dbf73]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          <ShieldCheck size={16} /> Verifikasi KYC
        </button>
      </div>

      {!profileCompleted && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Profil Anda belum lengkap. Silakan lengkapi data profil untuk mengaktifkan semua fitur.
          </p>
        </div>
      )}

      {activeTab === 'profil' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Profil Saya Card */}
          {profileData && (
            <Card className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                {profilePreview ? (
                   <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                   <User size={48} />
                )}
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{profileData.nama_lengkap || '-'}</h3>
                  <p className="text-sm font-bold text-gray-500">@{(Array.isArray(profileData?.users) ? profileData.users[0]?.email : profileData?.users?.email)?.split('@')[0] || '-'}</p>
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

          <Card>
            <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
              <User size={18} className="text-[#1dbf73]"/> Detail Profil
            </h3>
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="flex flex-col items-center gap-4 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                  {profilePreview ? (
                    <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <label className="bg-white border border-gray-300 px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer hover:bg-gray-50 transition-colors shadow-sm">
                    Ganti Foto
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'profile_picture')} />
                  </label>
                  <p className="text-[10px] text-gray-400 mt-2">Format: JPG, PNG. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nama Lengkap" name="nama_lengkap" placeholder="Masukkan nama sesuai KTP" required value={profileForm.nama_lengkap} onChange={e => setProfileForm({...profileForm, nama_lengkap: e.target.value})} />
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-[#404145]">Jenis Kelamin</label>
                  <select 
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none transition-shadow"
                    value={profileForm.jenis_kelamin}
                    onChange={e => setProfileForm({...profileForm, jenis_kelamin: e.target.value})}
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    {JENIS_KELAMIN_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <Input label="Tanggal Lahir" type="date" value={profileForm.tanggal_lahir} onChange={e => setProfileForm({...profileForm, tanggal_lahir: e.target.value})} />
                <Input label="Negara" value={profileForm.negara} onChange={e => setProfileForm({...profileForm, negara: e.target.value})} />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#404145]">Bio Singkat</label>
                <textarea 
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none transition-shadow h-24 text-sm"
                  placeholder="Ceritakan sedikit tentang diri Anda..."
                  value={profileForm.bio}
                  onChange={e => setProfileForm({...profileForm, bio: e.target.value})}
                ></textarea>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-bold text-[#404145] mb-4">Alamat Lengkap</h4>
                <Input label="Alamat Jalan" placeholder="Nama jalan, nomor, RT/RW" value={profileForm.alamat} onChange={e => setProfileForm({...profileForm, alamat: e.target.value})} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input label="Kota/Kabupaten" placeholder="Contoh: Jakarta Selatan" value={profileForm.kota} onChange={e => setProfileForm({...profileForm, kota: e.target.value})} />
                  <Input label="Provinsi" placeholder="Contoh: DKI Jakarta" value={profileForm.provinsi} onChange={e => setProfileForm({...profileForm, provinsi: e.target.value})} />
                  <Input label="Kode Pos" placeholder="Contoh: 12345" value={profileForm.kode_pos} onChange={e => setProfileForm({...profileForm, kode_pos: e.target.value})} />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-bold text-[#404145] mb-4">Bahasa yang Dikuasai</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {BAHASA_OPTIONS.map(bahasa => (
                    <label key={bahasa} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileForm.bahasa?.includes(bahasa)}
                        onChange={() => handleCheckboxChange('bahasa', bahasa)}
                        className="rounded border-gray-300 text-[#1dbf73] focus:ring-[#1dbf73]"
                      />
                      <span className="text-sm">{bahasa}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-bold text-[#404145] mb-4">Kategori Konten/Niche</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {KATEGORI_NICHE_OPTIONS.map(niche => (
                    <label key={niche} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profileForm.kategori_niche?.includes(niche)}
                        onChange={() => handleCheckboxChange('kategori_niche', niche)}
                        className="rounded border-gray-300 text-[#1dbf73] focus:ring-[#1dbf73]"
                      />
                      <span className="text-sm">{niche.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={profileLoading}>{profileLoading ? 'Menyimpan...' : 'Simpan Profil'}</Button>
            </form>
          </Card>
        </div>
      )}

      {activeTab === 'akun' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card>
            <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
              <Settings size={18} className="text-[#1dbf73]"/> Identitas Akun
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Username" 
                value={(Array.isArray(profileData?.users) ? profileData.users[0]?.email : profileData?.users?.email)?.split('@')[0] || ''} 
                readOnly 
                disabled 
                helperText="Username tidak dapat diubah"
              />
              <Input 
                label="Email" 
                value={(Array.isArray(profileData?.users) ? profileData.users[0]?.email : profileData?.users?.email) || ''} 
                readOnly 
                disabled 
                helperText="Email tidak dapat diubah"
              />
            </div>
          </Card>

          <Card>
            <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
              <Key size={18} className="text-[#1dbf73]"/> Ubah Password
            </h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input label="Password Lama" type="password" required value={passwordForm.old_password} onChange={e => setPasswordForm({...passwordForm, old_password: e.target.value})} />
              <Input label="Password Baru" type="password" required value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})} />
              <Input label="Konfirmasi Password" type="password" required value={passwordForm.confirm_password} onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})} />
              <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700" disabled={passwordLoading}>{passwordLoading ? 'Menyimpan...' : 'Perbarui Password'}</Button>
            </form>
          </Card>
        </div>
      )}

      {activeTab === 'sosial' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card>
            <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
              <Share2 size={18} className="text-[#1dbf73]"/> Akun Sosial Media
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Hubungkan akun sosial media Anda untuk mulai mengambil campaign.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SUPPORTED_PLATFORMS.map((platform) => {
                const linkedAccount = connectedAccounts.find(acc => acc.platform === platform.id);
                const Icon = platform.icon;

                return (
                  <div key={platform.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 hover:bg-white transition-all shadow-sm">

                    <div className="flex items-center gap-4">
                      <div className={`p-3 bg-white rounded-full shadow-sm border ${platform.color}`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <span className="text-sm font-bold block text-[#404145]">{platform.name}</span>
                        {linkedAccount ? (
                          <span className="text-xs text-[#1dbf73] font-mono">@{linkedAccount.username}</span>
                        ) : (
                          <span className="text-xs text-gray-400">Belum terhubung</span>
                        )}
                      </div>
                    </div>
                    
                    {linkedAccount ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-bold text-[#1dbf73] bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                          Aktif
                        </span>
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="text-xs py-1 px-4 h-9" 
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
      )}

      {activeTab === 'verifikasi' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card>
            <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#1dbf73]"/> Verifikasi Identitas (KYC)
            </h3>
            <div className="mb-6 p-4 bg-blue-50 text-blue-700 text-sm rounded-lg border border-blue-100 flex gap-3">
              <Clock size={20} className="flex-shrink-0" />
              <div>
                <p className="font-bold">Informasi Penting</p>
                <p className="text-xs opacity-80">Verifikasi KYC diperlukan untuk melakukan penarikan saldo dan mengakses campaign premium. Proses verifikasi memakan waktu 1-3 hari kerja.</p>
              </div>
            </div>
            {renderKycSection()}
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreatorSettings;
