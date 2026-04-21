import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { List, DollarSign, Plus, Loader2, Users, X, CheckCircle2, Clock, XCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const StatusBadge = ({ status }) => {
  const map = {
    AKTIF: 'text-[#1dbf73] bg-[#e8f9f0]',
    DRAFT: 'text-gray-600 bg-gray-100',
    DIJEDA: 'text-orange-600 bg-orange-100',
    DIJEDA_HARIAN: 'text-orange-600 bg-orange-100',
    SELESAI_BUDGET: 'text-blue-600 bg-blue-100',
    SELESAI_WAKTU: 'text-blue-600 bg-blue-100',
    DIBATALKAN: 'text-red-600 bg-red-100',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${map[status] || 'text-gray-600 bg-gray-100'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
};

const SubmissionBadge = ({ status }) => {
  const map = {
    PENDING: { cls: 'bg-yellow-100 text-yellow-700', icon: <Clock size={10}/> },
    DIPROSES: { cls: 'bg-indigo-100 text-indigo-700', icon: <Clock size={10}/> },
    SIAP_BAYAR: { cls: 'bg-purple-100 text-purple-700', icon: <DollarSign size={10}/> },
    SELESAI: { cls: 'bg-green-100 text-green-700', icon: <CheckCircle2 size={10}/> },
    DITOLAK: { cls: 'bg-red-100 text-red-700', icon: <XCircle size={10}/> },
  };
  const cfg = map[status] || { cls: 'bg-gray-100 text-gray-500', icon: null };
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${cfg.cls}`}>
      {cfg.icon}{status?.replace(/_/g, ' ')}
    </span>
  );
};

// Modal: Daftar Peserta Campaign
const ParticipantsModal = ({ campaignId, campaignName, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi(`/campaigns/${campaignId}/participants`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [campaignId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b bg-gray-50 flex justify-between items-center flex-shrink-0">
          <div>
            <h3 className="font-black text-lg text-[#404145] flex items-center gap-2">
              <Users size={20} className="text-[#1dbf73]"/> Peserta Campaign
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{campaignName}</p>
          </div>
          <div className="flex items-center gap-3">
            {data && (
              <span className="bg-[#1dbf73]/10 text-[#1dbf73] text-sm font-black px-3 py-1 rounded-full">
                {data.total_participants} Creator
              </span>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700">
              <X size={20}/>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-[#1dbf73]" size={36}/></div>
          ) : !data || data.participants.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-gray-300 mb-3"/>
              <p className="text-gray-500">Belum ada creator yang bergabung.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase text-gray-500 border-b bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-4">Creator</th>
                  <th className="p-4 text-center">KYC</th>
                  <th className="p-4 text-center">Submission</th>
                  <th className="p-4 text-center">Total Views</th>
                  <th className="p-4 text-center">Status Terakhir</th>
                  <th className="p-4 text-center">Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.participants.map(p => (
                  <tr key={p.participant_id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-bold text-[#404145]">{p.nama_lengkap}</p>
                      <p className="text-[10px] text-blue-500">{p.email}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">
                        Joined {new Date(p.joined_at).toLocaleDateString('id-ID')}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${p.kyc_status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.kyc_status}
                      </span>
                    </td>
                    <td className="p-4 text-center font-black text-[#404145]">{p.submission_count}</td>
                    <td className="p-4 text-center font-bold text-blue-600">{(p.total_views || 0).toLocaleString('id-ID')}</td>
                    <td className="p-4 text-center">
                      {p.latest_submission_status !== '-'
                        ? <SubmissionBadge status={p.latest_submission_status}/>
                        : <span className="text-[10px] text-gray-400">-</span>
                      }
                    </td>
                    <td className="p-4 text-center">
                      <span className={`font-black text-sm ${p.total_earning > 0 ? 'text-[#1dbf73]' : 'text-gray-400'}`}>
                        Rp {(p.total_earning || 0).toLocaleString('id-ID')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participantsModal, setParticipantsModal] = useState(null); // { id, name }
  const navigate = useNavigate();

  const loadCampaigns = async () => {
    try {
      const res = await fetchApi('/campaigns/my-campaigns');
      setCampaigns(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCampaigns(); }, []);

  const handleTopup = async (campaignId) => {
    const { value: amount } = await Swal.fire({
      title: 'Top Up Budget',
      input: 'number',
      inputLabel: 'Masukkan jumlah dana (Rp)',
      inputPlaceholder: 'Contoh: 1000000',
      showCancelButton: true,
      confirmButtonText: 'Proses Pembayaran',
      confirmButtonColor: '#1dbf73',
      inputValidator: (value) => {
        if (!value || value <= 0) return 'Harap masukkan jumlah yang valid!';
      }
    });
    if (!amount) return;
    try {
      Swal.showLoading();
      const response = await fetchApi(`/campaigns/${campaignId}/topup`, {
        method: 'POST',
        body: JSON.stringify({ amount: parseInt(amount) })
      });
      const { snap_token } = response.data;
      window.snap.pay(snap_token, {
        // onSuccess: () => { Swal.fire('Berhasil!', 'Pembayaran Anda telah diterima.', 'success'); loadCampaigns(); },
        onPending: () => Swal.fire('Menunggu!', 'Selesaikan pembayaran Anda segera.', 'info'),
        onError: () => Swal.fire('Gagal!', 'Terjadi kesalahan saat pembayaran.', 'error'),
        onClose: () => console.log('User menutup modal pembayaran'),
        onSuccess: function (result) {
          // Ganti dari langsung Swal success menjadi:
          Swal.fire({
            title: 'Pembayaran Sedang Diproses',
            text: 'Mohon tunggu sebentar, sistem sedang memverifikasi dana Anda...',
            icon: 'info',
            showConfirmButton: false,
            timer: 2500, // Beri waktu 2.5 detik untuk Webhook backend bekerja
            timerProgressBar: true,
          }).then(() => {
            Swal.fire('Berhasil!', 'Pembayaran Anda telah diverifikasi.', 'success');
            // Gunakan loadCampaigns() untuk CampaignList atau loadCampaignData() untuk EditCampaign
            loadCampaigns(); 
          });
        },
        onPending: function (result) {
          Swal.fire('Menunggu Pembayaran!', 'Selesaikan pembayaran Anda segera.', 'warning');
        },
        onError: function (result) {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat pembayaran.', 'error');
        },
        onClose: function () {
          console.log('User menutup modal pembayaran sebelum selesai');
        }
      });
    } catch (err) {
      Swal.fire('Gagal!', err.message, 'error');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <Loader2 className="animate-spin text-[#1dbf73]" size={40} />
    </div>
  );

  return (
    <div className="space-y-6">
      {participantsModal && (
        <ParticipantsModal
          campaignId={participantsModal.id}
          campaignName={participantsModal.name}
          onClose={() => setParticipantsModal(null)}
        />
      )}

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
              Belum ada campaign. Mulai langkah pertama Anda hari ini!
            </div>
          ) : (
            campaigns.map(c => (
              <div key={c.campaign_id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="font-bold text-[#404145] text-lg">{c.nama_campaign}</h4>
                    <StatusBadge status={c.status}/>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#7a7d85]">
                    <span>{c.platform}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#404145]">Sisa: Rp {(c.budget_tersisa || 0).toLocaleString('id-ID')}</span>
                    <span>•</span>
                    <span>Limit Harian: Rp {(c.daily_spend_limit || 0).toLocaleString('id-ID')}</span>
                    {c.min_konten_diterima > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-amber-600 font-semibold">Min. Konten: {c.min_konten_diterima}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  {/* Lihat Peserta */}
                  <Button
                    onClick={() => setParticipantsModal({ id: c.campaign_id, name: c.nama_campaign })}
                    variant="outline"
                    className="text-xs py-1.5 gap-1 border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <Users size={14}/> Peserta
                  </Button>

                  {/* Top Up */}
                  {['DRAFT', 'AKTIF', 'DIJEDA', 'DIJEDA_HARIAN'].includes(c.status) && (
                    <Button
                      onClick={() => handleTopup(c.campaign_id)}
                      className="bg-[#1dbf73] hover:bg-[#19a463] text-xs py-1.5 gap-1"
                    >
                      <DollarSign size={14}/> Top Up
                    </Button>
                  )}

                  {/* Kelola */}
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