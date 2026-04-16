import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { Settings } from 'lucide-react';

const BrandProfile = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nama_perusahaan: '', pic_name: '', phone_number: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi('/brand/profile', { method: 'PUT', body: JSON.stringify(form) });
      alert('Profil berhasil diperbarui!');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Profil Brand</h2>
      <Card className="max-w-xl">
        <h3 className="font-bold text-[#404145] mb-6 flex items-center gap-2"><Settings size={18}/> Pengaturan Profil</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Perusahaan" required value={form.nama_perusahaan} onChange={(e) => setForm({...form, nama_perusahaan: e.target.value})} placeholder="Nama PT / CV" />
          <Input label="Nama PIC" required value={form.pic_name} onChange={(e) => setForm({...form, pic_name: e.target.value})} placeholder="Nama penanggung jawab" />
          <Input label="Nomor Telepon" type="tel" required value={form.phone_number} onChange={(e) => setForm({...form, phone_number: e.target.value})} placeholder="081234..." />
          <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full">{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default BrandProfile;