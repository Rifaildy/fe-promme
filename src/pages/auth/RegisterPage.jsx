// --- src/pages/auth/RegisterPage.jsx ---
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Topbar from '../../components/layout/Topbar';
import { fetchApi } from '../../utils/api';

const RegisterPage = ({ onNavigate }) => {
  const [regType, setRegType] = useState('brand'); // 'brand' | 'creator'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // State Form
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nama_perusahaan: '',
    pic_name: '',
    phone_number: '',
    nama_lengkap: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Tentukan endpoint berdasarkan tipe registrasi
      const endpoint = regType === 'brand' ? '/auth/register/brand' : '/auth/register/creator';
      
      // Susun payload sesuai kebutuhan backend
      const payload = regType === 'brand' 
        ? { 
            email: formData.email, 
            password: formData.password, 
            nama_perusahaan: formData.nama_perusahaan, 
            pic_name: formData.pic_name, 
            phone_number: formData.phone_number 
          }
        : { 
            email: formData.email, 
            password: formData.password, 
            nama_lengkap: formData.nama_lengkap 
          };

      // Memanggil helper fetchApi
      await fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setSuccessMsg('Registrasi berhasil! Mengalihkan ke halaman login...');
      
      // Alihkan ke login setelah 2 detik menggunakan onNavigate bawaan App.jsx
      setTimeout(() => {
        onNavigate('login');
      }, 2000);

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col w-full">
      <Topbar onNavigate={onNavigate} />
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <Card className="w-full max-w-lg p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#404145]">Daftar ke Promme</h2>
            <p className="text-[#7a7d85] mt-2">Bergabunglah dengan ekosistem kami</p>
          </div>
          
          {/* Tabs Role */}
          <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
            <button
              onClick={() => { setRegType('brand'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${regType === 'brand' ? 'bg-white text-[#1dbf73] shadow-sm' : 'text-[#7a7d85]'}`}
            >
              Saya Brand
            </button>
            <button
              onClick={() => { setRegType('creator'); setErrorMsg(''); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all ${regType === 'creator' ? 'bg-white text-[#1dbf73] shadow-sm' : 'text-[#7a7d85]'}`}
            >
              Saya Creator
            </button>
          </div>

          {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200">{errorMsg}</div>}
          {successMsg && <div className="mb-4 p-3 bg-green-100 text-green-700 text-sm rounded-md border border-green-200">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-2">
            <Input label="Email" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="email@contoh.com" required />
            <Input label="Password" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Minimal 8 karakter" required />
            
            {regType === 'brand' ? (
              <>
                <Input label="Nama Perusahaan" name="nama_perusahaan" type="text" value={formData.nama_perusahaan} onChange={handleChange} placeholder="PT Solusi Digital" required />
                <Input label="Nama PIC" name="pic_name" type="text" value={formData.pic_name} onChange={handleChange} placeholder="Nama penanggung jawab" required />
                <Input label="Nomor Telepon" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} placeholder="08123456789" required />
              </>
            ) : (
              <Input label="Nama Lengkap" name="nama_lengkap" type="text" value={formData.nama_lengkap} onChange={handleChange} placeholder="Sesuai identitas KTP" required />
            )}

            <div className="pt-4">
              <Button type="submit" className="w-full py-3 text-lg" disabled={loading}>
                {loading ? 'Mendaftarkan...' : 'Buat Akun'}
              </Button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-sm text-[#7a7d85]">
            Sudah punya akun? <span onClick={() => onNavigate('login')} className="text-[#1dbf73] cursor-pointer hover:underline font-bold">Masuk</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;