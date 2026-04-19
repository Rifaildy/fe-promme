import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { List, DollarSign, Plus, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadCampaigns = async () => {
    try {
      const res = await fetchApi('/campaigns/my-campaigns');
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleTopup = async (campaignId) => {
    // 1. Minta input jumlah Top-up
    const { value: amount } = await Swal.fire({
      title: 'Top Up Budget',
      input: 'number',
      inputLabel: 'Masukkan jumlah dana (Rp)',
      inputPlaceholder: 'Contoh: 1000000',
      showCancelButton: true,
      confirmButtonText: 'Proses Pembayaran',
      confirmButtonColor: '#1dbf73',
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return 'Harap masukkan jumlah yang valid!';
        }
      }
    });

    if (!amount) return;

    try {
      Swal.showLoading();
      // 2. Panggil API backend untuk mendapatkan Snap Token
      const response = await fetchApi(`/campaigns/${campaignId}/topup`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseInt(amount) })
      });

      const { snap_token } = response.data;

      // 3. Tampilkan Pop-up Midtrans Snap
      window.snap.pay(snap_token, {
        onSuccess: function (result) {
          Swal.fire('Berhasil!', 'Pembayaran Anda telah diterima.', 'success');
          loadCampaigns(); // Refresh data kampanye
        },
        onPending: function (result) {
          Swal.fire('Menunggu!', 'Selesaikan pembayaran Anda segera.', 'info');
        },
        onError: function (result) {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat pembayaran.', 'error');
        },
        onClose: function () {
          console.log('User menutup modal pembayaran');
        }
      });
    } catch (err) {
      Swal.fire('Gagal!', err.message, 'error');
    }
  };

  // Helper untuk mewarnai Status Badge agar konsisten
  const getStatusColor = (status) => {
    switch(status) {
      case 'AKTIF': return 'text-[#1dbf73] bg-[#e8f9f0]';
      case 'DRAFT': return 'text-gray-600 bg-gray-100';
      case 'DIJEDA':
      case 'DIJEDA_HARIAN': return 'text-orange-600 bg-orange-100';
      case 'SELESAI_BUDGET':
      case 'SELESAI_WAKTU': return 'text-blue-600 bg-blue-100';
      case 'DIBATALKAN': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#1dbf73]" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#404145]">Daftar Campaign</h2>
        <Button onClick={() => navigate('/dashboard/campaigns/create')} className="gap-2">
          <Plus size={18}/> Buat Campaign Baru
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-[#404145] flex items-center gap-2">
            <List size={18}/> Ringkasan Campaign Anda
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {campaigns.length === 0 ? (
            <div className="p-10 text-center text-[#7a7d85]">
              Belum ada campaign yang dibuat. Mulai langkah pertama Anda hari ini!
            </div>
          ) : (
            campaigns.map(c => (
              <div key={c.campaign_id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-bold text-[#404145] text-lg">{c.nama_campaign}</h4>
                    {/* Menggunakan helper getStatusColor dan menghilangkan underscore */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(c.status)}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#7a7d85]">
                    <span>{c.platform}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#404145]">Sisa Budget: Rp {c.budget_tersisa?.toLocaleString('id-ID')}</span>
                    <span>•</span>
                    <span>Limit Harian: Rp {c.daily_spend_limit?.toLocaleString('id-ID')}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Tombol Top Up tersedia untuk Draft, Aktif, dan Dijeda agar bisa diisi ulang */}
                  {(c.status === 'DRAFT' || c.status === 'AKTIF' || c.status === 'DIJEDA' || c.status === 'DIJEDA_HARIAN') && (
                    <Button 
                      onClick={() => handleTopup(c.campaign_id)}
                      className="bg-[#1dbf73] hover:bg-[#19a463] text-xs py-1.5 gap-1"
                    >
                      <DollarSign size={14}/> Top Up
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    className="text-xs py-1.5"
                    onClick={() => navigate(`/dashboard/campaigns/edit/${c.campaign_id}`)}
                  >
                    Kelola
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default CampaignList;