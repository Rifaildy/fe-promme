// --- src/pages/brand/BrandProfile.jsx ---
import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { Settings, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2'; // Import SweetAlert2

const BrandProfile = () => {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({ nama_perusahaan: '', pic_name: '', phone_number: '' });

  // Tarik data profil saat halaman pertama kali dimuat
  useEffect(() => {
    fetchApi('/brand/profile')
      .then(res => {
        if (res.data) {
          setForm({
            nama_perusahaan: res.data.nama_perusahaan || '',
            pic_name: res.data.pic_name || '',
            phone_number: res.data.phone_number || ''
          });
        }
      })
      .catch(err => {
        console.error('Gagal memuat profil', err);
      })
      .finally(() => {
        setFetching(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Body berbentuk string JSON (karena kita tidak mengirim file fisik di sini)
      await fetchApi('/brand/profile', { 
        method: 'PUT', 
        body: JSON.stringify(form) 
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Profil berhasil diperbarui.',
        confirmButtonColor: '#1dbf73'
      });
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

  if (fetching) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#1dbf73]" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Profil Brand</h2>
      <Card className="max-w-xl">
        <h3 className="font-bold text-[#404145] mb-6 flex items-center gap-2">
          <Settings size={18}/> Pengaturan Profil
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="pt-4 border-t border-gray-100 mt-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BrandProfile;