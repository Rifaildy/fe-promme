// --- src/pages/brand/BrandProfile.jsx ---
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { Settings, Loader2, Key, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

const BrandProfile = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ 
    nama_perusahaan: '', pic_name: '', phone_number: '', logo_url: '',
    website: '', alamat: '', kota: '', provinsi: '', kode_pos: '',
    industri: '', ukuran_perusahaan: '', deskripsi: '', tahun_berdiri: '',
    email: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [profileCompleted, setProfileCompleted] = useState(false);

  const INDUSTRI_OPTIONS = [
    'TEKNOLOGI', 'FASHION', 'FOOD_BEVERAGE', 'KECANTIKAN', 'KESEHATAN', 
    'OTOMOTIF', 'PROPERTI', 'FINANSIAL', 'EDUKASI', 'HIBURAN', 
    'TRAVEL', 'SPORTS', 'LAINNYA'
  ];

  const UKURAN_PERUSAHAAN_OPTIONS = [
    'STARTUP', 'UMKM', 'SME', 'KORPORASI', 'MULTINASIONAL'
  ];

  // Tarik data profil saat halaman pertama kali dimuat
  useEffect(() => {
    fetchApi('/brand/profile')
      .then(res => {
        if (res.data) {
          setForm({
            nama_perusahaan: res.data.nama_perusahaan || '',
            pic_name: res.data.pic_name || '',
            phone_number: res.data.phone_number || '',
            logo_url: res.data.logo_url || '',
            website: res.data.website || '',
            alamat: res.data.alamat || '',
            kota: res.data.kota || '',
            provinsi: res.data.provinsi || '',
            kode_pos: res.data.kode_pos || '',
            industri: res.data.industri || '',
            ukuran_perusahaan: res.data.ukuran_perusahaan || '',
            deskripsi: res.data.deskripsi || '',
            tahun_berdiri: res.data.tahun_berdiri || '',
            email: res.data.users?.email || ''
          });
          if (res.data.logo_url) {
            setLogoPreview(res.data.logo_url);
          }
          if (res.data.users) {
            setProfileCompleted(res.data.users.profile_completed || false);
          }
        }
      })
      .catch(err => {
        console.error('Gagal memuat profil', err);
      })
      .finally(() => {
        setFetching(false);
      });
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('nama_perusahaan', form.nama_perusahaan);
      formData.append('pic_name', form.pic_name);
      formData.append('phone_number', form.phone_number);
      formData.append('website', form.website);
      formData.append('alamat', form.alamat);
      formData.append('kota', form.kota);
      formData.append('provinsi', form.provinsi);
      formData.append('kode_pos', form.kode_pos);
      formData.append('industri', form.industri);
      formData.append('ukuran_perusahaan', form.ukuran_perusahaan);
      formData.append('deskripsi', form.deskripsi);
      if (form.tahun_berdiri) {
        formData.append('tahun_berdiri', form.tahun_berdiri);
      }
      if (logoFile) {
        formData.append('logo_file', logoFile);
      }

      const res = await fetchApi('/brand/profile', { 
        method: 'PUT', 
        body: formData 
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Profil berhasil diperbarui.',
        confirmButtonColor: '#1dbf73'
      });
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Memperbarui',
        text: err.message
      });
    } finally {
      setLoading(false);
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
        body: JSON.stringify({
          old_password: passwordForm.old_password,
          new_password: passwordForm.new_password
        })
      });

      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Password berhasil diubah.', confirmButtonColor: '#1dbf73' });
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: err.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  if (fetching) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#1dbf73]" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Pengaturan Akun</h2>
      
      {!profileCompleted && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800 font-medium">
            ⚠️ Profil Anda belum lengkap. Silakan lengkapi data profil untuk mengaktifkan semua fitur.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-[#404145] mb-6 flex items-center gap-2">
            <Settings size={18}/> Profil Brand
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-gray-100 overflow-hidden mb-3 bg-gray-50 flex items-center justify-center relative group">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={32} className="text-gray-300" />
                )}
                <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer text-white text-xs font-bold transition-opacity">
                  Ubah
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <p className="text-xs text-gray-400 font-medium">Unggah logo perusahaan (Opsional)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Username" 
                value={form.email?.split('@')[0] || ''} 
                readOnly 
                disabled 
                helperText="Username tidak dapat diubah"
              />
              <Input 
                label="Nama Perusahaan" 
                required 
                value={form.nama_perusahaan} 
                onChange={(e) => setForm({...form, nama_perusahaan: e.target.value})} 
                placeholder="Nama PT / CV" 
              />
              <Input 
                label="Nama PIC (Penanggung Jawab)" 
                required 
                value={form.pic_name} 
                onChange={(e) => setForm({...form, pic_name: e.target.value})} 
                placeholder="Nama lengkap penanggung jawab" 
              />
              <Input 
                label="Nomor Telepon / WhatsApp" 
                type="tel" 
                required 
                value={form.phone_number} 
                onChange={(e) => setForm({...form, phone_number: e.target.value})} 
                placeholder="Contoh: 08123456789" 
              />
              <Input 
                label="Website" 
                type="url" 
                value={form.website} 
                onChange={(e) => setForm({...form, website: e.target.value})} 
                placeholder="https://website.com" 
              />
              <Input 
                label="Tahun Berdiri" 
                type="number" 
                value={form.tahun_berdiri} 
                onChange={(e) => setForm({...form, tahun_berdiri: e.target.value})} 
                placeholder="Contoh: 2020" 
                min="1900"
                max={new Date().getFullYear()}
              />
              <div>
                <label className="block text-sm font-bold text-[#404145] mb-2">Industri</label>
                <select
                  value={form.industri}
                  onChange={(e) => setForm({...form, industri: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1dbf73]"
                >
                  <option value="">Pilih Industri</option>
                  {INDUSTRI_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#404145] mb-2">Ukuran Perusahaan</label>
                <select
                  value={form.ukuran_perusahaan}
                  onChange={(e) => setForm({...form, ukuran_perusahaan: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1dbf73]"
                >
                  <option value="">Pilih Ukuran Perusahaan</option>
                  {UKURAN_PERUSAHAAN_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#404145] mb-2">Deskripsi Perusahaan</label>
              <textarea
                value={form.deskripsi}
                onChange={(e) => setForm({...form, deskripsi: e.target.value})}
                placeholder="Deskripsikan perusahaan Anda secara singkat..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1dbf73]"
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-bold text-[#404145] mb-4">Alamat Lengkap</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input 
                    label="Alamat Jalan" 
                    value={form.alamat} 
                    onChange={(e) => setForm({...form, alamat: e.target.value})} 
                    placeholder="Nama jalan, nomor, RT/RW" 
                  />
                </div>
                <Input 
                  label="Kota/Kabupaten" 
                  value={form.kota} 
                  onChange={(e) => setForm({...form, kota: e.target.value})} 
                  placeholder="Contoh: Jakarta Selatan" 
                />
                <Input 
                  label="Provinsi" 
                  value={form.provinsi} 
                  onChange={(e) => setForm({...form, provinsi: e.target.value})} 
                  placeholder="Contoh: DKI Jakarta" 
                />
                <Input 
                  label="Kode Pos" 
                  value={form.kode_pos} 
                  onChange={(e) => setForm({...form, kode_pos: e.target.value})} 
                  placeholder="Contoh: 12345" 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 mt-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </Card>

        <Card>
          <h3 className="font-bold text-[#404145] mb-6 flex items-center gap-2">
            <Key size={18}/> Ubah Password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input 
              label="Password Lama" 
              type="password" 
              required 
              value={passwordForm.old_password} 
              onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})} 
              placeholder="Masukkan password lama" 
            />
            <Input 
              label="Password Baru" 
              type="password" 
              required 
              value={passwordForm.new_password} 
              onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})} 
              placeholder="Masukkan password baru" 
            />
            <Input 
              label="Konfirmasi Password Baru" 
              type="password" 
              required 
              value={passwordForm.confirm_password} 
              onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})} 
              placeholder="Ketik ulang password baru" 
            />
            <div className="pt-4 border-t border-gray-100 mt-2">
              <Button type="submit" disabled={passwordLoading} className="w-full bg-gray-800 hover:bg-gray-700">
                {passwordLoading ? 'Menyimpan...' : 'Perbarui Password'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default BrandProfile;