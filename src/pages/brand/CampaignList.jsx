import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { List, DollarSign, Plus, Loader2, Users, X, CheckCircle2, Clock, XCircle, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Pagination from '../../components/ui/Pagination';

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

const ParticipantsModal = ({ campaignId, campaignName, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });

  const loadParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/campaigns/${campaignId}/participants`, {
        params: filters
      });
      setParticipants(res.data?.participants || []);
      setPagination(res.pagination || { current_page: 1, total_pages: 1, total_items: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [campaignId, filters]);

  useEffect(() => { loadParticipants(); }, [loadParticipants]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
        <div className="p-6 bg-gray-50/50 border-b flex justify-between items-center">
          <div>
            <h3 className="font-black text-lg text-[#404145] flex items-center gap-2">
              <Users size={20} className="text-[#1dbf73]"/> Peserta Campaign
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{campaignName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
              <input 
                type="text" 
                placeholder="Cari creator..." 
                className="pl-9 pr-4 py-2 border rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#1dbf73]"
                value={filters.search}
                onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              />
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-700">
              <X size={20}/>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-[#1dbf73]" size={36}/></div>
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
                {participants.map(p => (
                  <tr key={p.participant_id} className="hover:bg-gray-50/50">
                    <td className="p-4">
                      <p className="font-bold text-[#404145]">{p.nama_lengkap}</p>
                      <p className="text-[10px] text-blue-500">{p.email}</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${p.kyc_status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {p.kyc_status}
                      </span>
                    </td>
                    <td className="p-4 text-center font-black text-[#404145]">{p.submission_count}</td>
                    <td className="p-4 text-center font-bold text-blue-600">{(p.total_views || 0).toLocaleString('id-ID')}</td>
                    <td className="p-4 text-center">
                      {p.latest_submission_status !== '-' ? <SubmissionBadge status={p.latest_submission_status}/> : '-'}
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
          {participants.length === 0 && !loading && <div className="p-20 text-center text-gray-400 font-bold italic">Belum ada creator yang bergabung.</div>}
        </div>
        <div className="p-4 border-t bg-gray-50/30">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total_items}
            limit={filters.limit}
            onPageChange={page => setFilters(prev => ({ ...prev, page }))}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participantsModal, setParticipantsModal] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const navigate = useNavigate();

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/campaigns/my-campaigns', {
        params: filters
      });
      setCampaigns(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      } else {
        setPagination({ current_page: 1, total_pages: 1, total_items: (res.data || []).length });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadCampaigns(); }, [loadCampaigns]);

  const handleTopup = async (campaignId) => {
    const { value: amount } = await Swal.fire({
      title: 'Top Up Budget',
      input: 'number',
      inputLabel: 'Masukkan jumlah dana (Rp)',
      confirmButtonColor: '#1dbf73',
      showCancelButton: true
    });
    if (!amount) return;
    try {
      Swal.showLoading();
      const response = await fetchApi(`/campaigns/${campaignId}/topup`, { method: 'POST', body: JSON.stringify({ amount: parseInt(amount) }) });
      window.snap.pay(response.data.snap_token, {
        onSuccess: () => {
          Swal.fire('Berhasil!', 'Pembayaran diverifikasi.', 'success');
          loadCampaigns();
        }
      });
    } catch (err) { Swal.fire('Gagal!', err.message, 'error'); }
  };

  return (
    <div className="space-y-6">
      {participantsModal && (
        <ParticipantsModal
          campaignId={participantsModal.id}
          campaignName={participantsModal.name}
          onClose={() => setParticipantsModal(null)}
        />
      )}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#404145]">Daftar Campaign Saya</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari campaign..." 
              className="pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1dbf73] w-full md:w-64"
              value={filters.search || ''}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-none ring-1 ring-gray-100">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 font-bold text-sm flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-[#404145] uppercase tracking-wider text-xs"><List size={16} className="text-[#1dbf73]"/> Ringkasan Campaign</div>
          <span className="text-[10px] font-black text-[#7a7d85] bg-gray-100 px-2 py-0.5 rounded-full">{pagination.total_items} TOTAL</span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto text-[#1dbf73]" size={36}/></div>
          ) : campaigns.length === 0 ? (
            <div className="p-20 text-center text-[#7a7d85] font-bold italic">Anda belum memiliki campaign.</div>
          ) : (
            campaigns.map(c => (
              <div key={c.campaign_id} className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h4 className="font-bold text-[#404145] text-lg">{c.nama_campaign}</h4>
                    <StatusBadge status={c.status}/>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#7a7d85]">
                    <span className="font-bold text-blue-600">{c.platform}</span>
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
                  <Button
                    onClick={() => setParticipantsModal({ id: c.campaign_id, name: c.nama_campaign })}
                    variant="outline"
                    className="text-xs py-1.5 gap-1 border-blue-300 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Users size={14}/> Peserta
                  </Button>

                  {['DRAFT', 'AKTIF', 'DIJEDA', 'DIJEDA_HARIAN'].includes(c.status) && (
                    <Button
                      onClick={() => handleTopup(c.campaign_id)}
                      className="bg-[#1dbf73] hover:bg-[#19a463] text-xs py-1.5 gap-1 rounded-lg"
                    >
                      <DollarSign size={14}/> Top Up
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="text-xs py-1.5 rounded-lg"
                    onClick={() => navigate(`/dashboard/campaigns/edit/${c.campaign_id}`)}
                  >
                    Kelola
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-gray-50/10">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total_items}
            limit={filters.limit}
            onPageChange={page => setFilters(prev => ({ ...prev, page }))}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
};

export default CampaignList;