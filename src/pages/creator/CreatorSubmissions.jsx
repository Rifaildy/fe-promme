import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { fetchApi } from '../../utils/api';
import { FileText, ExternalLink, Plus, Search, Loader2, Filter } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

const CreatorSubmissions = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    status: ''
  });

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/submissions', {
        params: filters
      });
      setSubmissions(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#404145]">Riwayat Pekerjaan</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm">
            <Filter size={16} className="text-[#7a7d85]" />
            <select 
              className="bg-transparent font-bold text-[#404145] outline-none cursor-pointer" 
              value={filters.limit} 
              onChange={e => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            >
              <option value={10}>10 Baris</option>
              <option value={20}>20 Baris</option>
              <option value={50}>50 Baris</option>
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari campaign/URL..." 
              className="pl-10 pr-4 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1dbf73] w-full md:w-64"
              value={filters.search}
              onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
            />
          </div>
          <Button onClick={() => alert("Gunakan menu Eksplorasi untuk submit konten baru")} className="gap-2 text-xs py-2">
            <Plus size={16}/> Submit Konten
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm flex items-center gap-2">
          <FileText size={16}/> Daftar Submission
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-6 text-center text-[#7a7d85]">Memuat data...</div>
          ) : submissions.length === 0 ? (
            <div className="p-6 text-center text-[#7a7d85]">Anda belum pernah mengirimkan konten.</div>
          ) : (
            submissions.map(s => (
              <div key={s.submission_id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50">
                <div>
                  <h4 className="font-bold text-[#404145]">{s.nama_campaign}</h4>
                  <a href={s.content_url} target="_blank" className="text-xs text-[#1dbf73] flex items-center gap-1 hover:underline">
                    Lihat Konten <ExternalLink size={12}/>
                  </a>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] text-[#7a7d85]">Views Valid</p>
                    <p className="font-bold text-sm">{s.views_tervalidasi || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-[#7a7d85]">Net Earning</p>
                    <p className="font-bold text-sm text-[#1dbf73]">Rp {s.net_earning?.toLocaleString('id-ID') || 0}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${s.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white">
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

export default CreatorSubmissions;