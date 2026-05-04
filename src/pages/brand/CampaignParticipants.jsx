import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import { fetchApi } from '../../utils/api';
import { Search, ArrowLeft, Users, CheckCircle2, XCircle, Clock } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const map = {
    VERIFIED: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    REJECTED: 'bg-red-100 text-red-700',
    UNVERIFIED: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {status || 'UNKNOWN'}
    </span>
  );
};

const CampaignParticipants = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    kyc_status: '',
    sort: '-joined_at'
  });

  const loadParticipants = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi(`/campaigns/${id}/participants`, { params: filters });
      setParticipants(res.data.participants || []);
      setCampaignName(res.data.campaign_name || 'Campaign');
      if (res.pagination) setPagination(res.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, filters]);

  useEffect(() => { loadParticipants(); }, [loadParticipants]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <Button variant="ghost" onClick={() => navigate('/dashboard/my-campaigns')} className="px-3 bg-white shadow-sm hover:bg-gray-100">
          <ArrowLeft size={20}/>
        </Button>
        <div>
          <h2 className="text-2xl font-black text-[#404145]">Peserta Campaign</h2>
          <p className="text-sm font-bold text-[#1dbf73] uppercase mt-1">{campaignName}</p>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
            <select 
              className="w-full md:w-32 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm font-bold text-[#404145] bg-gray-50"
              value={filters.limit}
              onChange={e => handleFilterChange('limit', parseInt(e.target.value))}
            >
              <option value={10}>10 Item</option>
              <option value={25}>25 Item</option>
              <option value={50}>50 Item</option>
            </select>
            <select 
              className="w-full md:w-40 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm font-bold text-[#404145] bg-gray-50"
              value={filters.kyc_status}
              onChange={e => handleFilterChange('kyc_status', e.target.value)}
            >
              <option value="">Semua Status KYC</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="UNVERIFIED">Unverified</option>
            </select>
            <select 
              className="w-full md:w-40 px-3 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm font-bold text-[#404145] bg-gray-50"
              value={filters.sort}
              onChange={e => handleFilterChange('sort', e.target.value)}
            >
              <option value="-joined_at">Terbaru Gabung</option>
              <option value="joined_at">Terlama Gabung</option>
              <option value="-submission_count">Submission Terbanyak</option>
            </select>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau email..."
              className="w-full pl-10 pr-4 py-2 border rounded-md outline-none focus:ring-2 focus:ring-[#1dbf73] text-sm bg-gray-50"
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="p-4 text-sm font-black text-gray-400 uppercase tracking-wider">Creator</th>
                <th className="p-4 text-sm font-black text-gray-400 uppercase tracking-wider">Status KYC</th>
                <th className="p-4 text-sm font-black text-gray-400 uppercase tracking-wider">Tanggal Bergabung</th>
                <th className="p-4 text-sm font-black text-gray-400 uppercase tracking-wider">Submissions</th>
                <th className="p-4 text-sm font-black text-gray-400 uppercase tracking-wider">Total Earning</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Memuat data peserta...</td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Belum ada peserta yang bergabung.</td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.participant_id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold overflow-hidden">
                          {p.profile_picture_url ? (
                            <img src={p.profile_picture_url} alt={p.nama_lengkap} className="w-full h-full object-cover" />
                          ) : (
                            p.nama_lengkap.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#404145]">{p.nama_lengkap}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={p.kyc_status} />
                    </td>
                    <td className="p-4 text-sm text-[#404145] font-medium">
                      {new Date(p.joined_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm font-bold text-gray-700">
                        <Users size={14} className="text-gray-400"/>
                        {p.submission_count}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-[#1dbf73]">
                      Rp {p.total_earning?.toLocaleString('id-ID') || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          totalItems={pagination.total_items}
          limit={filters.limit}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default CampaignParticipants;
