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


const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
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
          <Button 
            onClick={() => navigate('/dashboard/campaigns/create')}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Buat Campaign
          </Button>
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
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm overflow-hidden shrink-0">
                    <span className="text-[#1dbf73] font-black text-lg">{c.nama_campaign?.charAt(0).toUpperCase() || 'C'}</span>
                  </div>
                  <div>
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
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  <Button
                    onClick={() => navigate(`/dashboard/campaigns/${c.campaign_id}/participants`)}
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