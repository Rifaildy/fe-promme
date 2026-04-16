import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nama_campaign: '', budget_total: '', daily_spend_limit: '', platform: 'TikTok',
    komisi_per_view: '', min_watch_duration: 15, max_submission_per_creator: 1,
    tanggal_mulai: '', tanggal_berakhir: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi('/campaigns', { method: 'POST', body: JSON.stringify(form) });
      alert('Campaign berhasil dibuat (Status DRAFT). Lakukan Top-Up untuk mengaktifkannya.');
      navigate('/dashboard/campaigns');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Buat Campaign</h2>
      <Card className="max-w-3xl">
        <h3 className="font-bold text-[#404145] mb-6 flex items-center gap-2"><Plus size={18}/> Detail Campaign Baru</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Campaign" required value={form.nama_campaign} onChange={(e) => setForm({...form, nama_campaign: e.target.value})} placeholder="Cth: Review Skincare Q4" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Total Budget (Rp)" type="number" required value={form.budget_total} onChange={(e) => setForm({...form, budget_total: e.target.value})} />
            <Input label="Limit Harian (Rp)" type="number" required value={form.daily_spend_limit} onChange={(e) => setForm({...form, daily_spend_limit: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#404145] mb-2">Platform Utama</label>
              <select className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1dbf73] outline-none" value={form.platform} onChange={(e) => setForm({...form, platform: e.target.value})}>
                <option value="TikTok">TikTok</option><option value="Instagram">Instagram</option><option value="YouTube">YouTube</option>
              </select>
            </div>
            <Input label="Komisi per View (Rp)" type="number" required value={form.komisi_per_view} onChange={(e) => setForm({...form, komisi_per_view: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min. Durasi Tonton (Detik)" type="number" required value={form.min_watch_duration} onChange={(e) => setForm({...form, min_watch_duration: e.target.value})} />
            <Input label="Maks. Submit / Creator" type="number" required value={form.max_submission_per_creator} onChange={(e) => setForm({...form, max_submission_per_creator: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Tanggal Mulai" type="date" required value={form.tanggal_mulai} onChange={(e) => setForm({...form, tanggal_mulai: e.target.value})} />
            <Input label="Tanggal Berakhir" type="date" required value={form.tanggal_berakhir} onChange={(e) => setForm({...form, tanggal_berakhir: e.target.value})} />
          </div>
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/campaigns')}>Batal</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan sebagai Draft'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateCampaign;