import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import {
  ArrowLeft, Megaphone, Users, Search,
  Calendar, DollarSign, TrendingUp, AlertOctagon, RefreshCw
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/ui/Pagination';

const AdminCampaignDetail = () => {
  const { campaign_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('creators');
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [page, setPage] = useState(1);
  const limit = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/admin/campaigns/${campaign_id}`, {
        params: { page, limit }
      });
      setCampaign(res.data?.campaign);
      setParticipants(res.data?.participants || []);
      setPagination({
        current_page: page,
        total_pages: Math.ceil((res.data?.participants || []).length / limit),
        total_items: (res.data?.participants || []).length
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'Gagal memuat detail campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [campaign_id]);

  useEffect(() => {
    let filtered = participants;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nama_lengkap.toLowerCase().includes(lower) ||
        p.email.toLowerCase().includes(lower)
      );
    }
    setFilteredParticipants(filtered.slice((page - 1) * limit, page * limit));
    setPagination({
      current_page: page,
      total_pages: Math.ceil(filtered.length / limit),
      total_items: filtered.length
    });
  }, [searchTerm, participants, page]);

  const handleStatusChange = async (newStatus) => {
    const confirm = await Swal.fire({
      title: `Ubah Status Campaign?`,
      text: `Status akan diubah menjadi ${newStatus}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'AKTIF' ? '#1dbf73' : '#ef4444',
      confirmButtonText: 'Ya, Ubah'
    });
    if (!confirm.isConfirmed) return;

    try {
      await fetchApi(`/admin/campaigns/${campaign_id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      Swal.fire('Berhasil', `Campaign diubah menjadi ${newStatus}`, 'success');
      loadData();
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-gray-400 font-bold">Memuat data campaign...</div>;
  }

  if (!campaign) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-500 font-bold">Campaign tidak ditemukan</p>
        <Button onClick={() => navigate('/dashboard/fraud-ops')} className="mt-4 bg-[#1dbf73]">Kembali</Button>
      </div>
    );
  }

  const budgetUsed = (campaign.budget_total || 0) - (campaign.budget_tersisa || 0);
  const budgetPercent = campaign.budget_total > 0 ? ((budgetUsed / campaign.budget_total) * 100).toFixed(1) : 0;
  const totalSubmissions = participants.reduce((sum, p) => sum + p.submission_count, 0);
  const totalPayout = participants.reduce((sum, p) => sum + p.total_earning, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/fraud-ops')} className="px-3">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-2xl font-black text-[#404145] flex items-center gap-2">
            <Megaphone size={24} className="text-purple-600" /> Detail Campaign
          </h2>
          <p className="text-sm text-gray-500">{campaign.nama_campaign}</p>
        </div>
      </div>

      {/* Campaign Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="text-[10px] font-black uppercase text-blue-600 flex items-center gap-1">
            <DollarSign size={14} /> Total Budget
          </div>
          <div className="font-black text-blue-700 text-xl mt-1">
            Rp {(campaign.budget_total || 0).toLocaleString('id-ID')}
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="text-[10px] font-black uppercase text-green-600 flex items-center gap-1">
            <TrendingUp size={14} /> Sisa Budget
          </div>
          <div className="font-black text-green-700 text-xl mt-1">
            Rp {(campaign.budget_tersisa || 0).toLocaleString('id-ID')}
          </div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="text-[10px] font-black uppercase text-orange-600 flex items-center gap-1">
            <Users size={14} /> Total Creator
          </div>
          <div className="font-black text-orange-700 text-xl mt-1">{participants.length}</div>
        </Card>
        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="text-[10px] font-black uppercase text-purple-600 flex items-center gap-1">
            <Calendar size={14} /> Total Submission
          </div>
          <div className="font-black text-purple-700 text-xl mt-1">{totalSubmissions}</div>
        </Card>
      </div>

      {/* Main Detail + Participants */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Campaign Info */}
        <Card className="col-span-1 h-max space-y-5">
          <h3 className="font-black text-sm text-[#404145] uppercase tracking-wider border-b pb-2">Informasi Campaign</h3>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Status</span>
              <span className={`px-2 py-0.5 rounded text-xs font-black ${
                campaign.status === 'AKTIF' ? 'bg-green-100 text-green-700' :
                campaign.status === 'DIBATALKAN' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>{campaign.status}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Platform</span>
              <span className="font-bold text-sm">{campaign.platform || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Komisi/View</span>
              <span className="font-bold text-sm">Rp {(campaign.komisi_per_view || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Min. Konten</span>
              <span className="font-bold text-sm">{campaign.min_konten_diterima || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Berakhir</span>
              <span className="font-bold text-sm">
                {campaign.tanggal_berakhir ? new Date(campaign.tanggal_berakhir).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Dibuat</span>
              <span className="font-bold text-sm">
                {campaign.created_at ? new Date(campaign.created_at).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <h4 className="font-bold text-sm text-[#404145]">Brand Owner</h4>
            <div className="space-y-2">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase font-bold">Perusahaan</div>
                <div className="font-bold text-sm">{campaign.brand_name || '-'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase font-bold">Email</div>
                <div className="font-bold text-sm">{campaign.brand_email || '-'}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-[10px] text-gray-400 uppercase font-bold">Status Akun</div>
                <span className={`px-2 py-0.5 rounded text-xs font-black ${
                  campaign.brand_status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>{campaign.brand_status || '-'}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="text-[10px] font-black text-gray-400 uppercase">Budget Usage</div>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-500">{budgetPercent}% terpakai</span>
              <span className="text-gray-900">Rp {budgetUsed.toLocaleString('id-ID')} / Rp {(campaign.budget_total || 0).toLocaleString('id-ID')}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${Math.min(budgetPercent, 100)}%` }}></div>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="text-[10px] font-black text-gray-400 uppercase">Campaign ID</div>
            <div className="font-mono text-[11px] text-blue-600 bg-blue-50 px-3 py-2 rounded break-all">{campaign.campaign_id}</div>
          </div>

          <div className="flex gap-2 pt-2">
            {campaign.status === 'AKTIF' ? (
              <Button onClick={() => handleStatusChange('DIBATALKAN')} className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl">
                <AlertOctagon size={14} className="inline mr-1" /> Stop Campaign
              </Button>
            ) : (
              <Button onClick={() => handleStatusChange('AKTIF')} className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2.5 rounded-xl">
                <RefreshCw size={14} className="inline mr-1" /> Activate
              </Button>
            )}
          </div>
        </Card>

        {/* Right: Participants Table */}
        <Card className="col-span-1 lg:col-span-2 p-0 overflow-hidden">
          <div className="p-4 bg-purple-50/50 border-b border-purple-100 font-bold text-sm flex justify-between items-center">
            <div className="flex items-center gap-2 font-black text-[#404145] uppercase tracking-wider text-xs">
              <Users size={16} className="text-purple-600" /> Creator yang Bergabung ({participants.length})
            </div>
          </div>

          <div className="p-3 flex items-center gap-2 bg-white border-b border-gray-100">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau email creator..."
              className="bg-transparent text-sm outline-none w-full font-medium"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/30 text-gray-400 text-[10px] uppercase font-black border-b tracking-widest">
                  <th className="p-4">Creator</th>
                  <th className="p-4 text-center">KYC</th>
                  <th className="p-4 text-center">Submission</th>
                  <th className="p-4 text-center">Views</th>
                  <th className="p-4 text-center">Earning</th>
                  <th className="p-4 text-center">Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filteredParticipants.length === 0 ? (
                  <tr><td colSpan="6" className="p-12 text-center text-gray-400 italic">Tidak ada creator ditemukan.</td></tr>
                ) : (
                  filteredParticipants.map(p => (
                    <tr key={p.participant_id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#404145]">{p.nama_lengkap}</div>
                        <div className="text-[10px] text-blue-600">{p.email}</div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          p.kyc_status === 'VERIFIED' ? 'bg-blue-100 text-blue-700' :
                          p.kyc_status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>{p.kyc_status}</span>
                      </td>
                      <td className="p-4 text-center font-bold">{p.submission_count}</td>
                      <td className="p-4 text-center font-bold">{(p.total_views || 0).toLocaleString('id-ID')}</td>
                      <td className="p-4 text-center font-bold text-green-600">Rp {(p.total_earning || 0).toLocaleString('id-ID')}</td>
                      <td className="p-4 text-center text-xs text-gray-500">
                        {p.joined_at ? new Date(p.joined_at).toLocaleDateString('id-ID') : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {pagination.total_pages > 1 && (
            <div className="p-4 border-t border-gray-100">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.total_pages}
                totalItems={pagination.total_items}
                limit={limit}
                onPageChange={setPage}
                loading={false}
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminCampaignDetail;
