// --- src/pages/finance/FinanceWithdrawals.jsx ---
import React, { useEffect, useState, useCallback } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { DollarSign, CheckCircle, XCircle, Search, Filter, Loader2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import Swal from 'sweetalert2';

const FinanceWithdrawals = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING'); // PENDING | FAILED
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: ''
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Use the new standardized endpoint if possible, or keep separate but with pagination
      const endpoint = activeTab === 'PENDING' ? '/finance/withdrawals/pending' : '/finance/withdrawals/failed';
      const res = await fetchApi(endpoint, {
        params: filters
      });
      setData(res.data || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFilters(prev => ({ ...prev, page: 1, search: '' }));
  };

  const handleApprove = async (id) => {
    const confirm = await Swal.fire({
      title: 'Konfirmasi Pencairan',
      text: 'Setujui pencairan dana ini ke rekening Creator? (Iris akan memproses transfer)',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1dbf73',
      confirmButtonText: 'Ya, Setujui'
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.showLoading();
      await fetchApi(`/finance/withdrawals/${id}/approve`, { method: 'POST' });
      Swal.fire('Berhasil', 'Pencairan disetujui dan sedang diproses Iris.', 'success');
      loadData();
    } catch (err) { 
      Swal.fire('Gagal', err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#404145]">Operasional Pencairan Dana</h2>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm w-full md:w-64">
          <Search size={16} className="text-[#7a7d85]" />
          <input 
            type="text" 
            placeholder="Cari ID/Creator..." 
            className="bg-transparent outline-none w-full font-medium"
            value={filters.search}
            onChange={e => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
      </div>
      
      <div className="flex space-x-4 border-b border-gray-200">
        <button 
          onClick={() => handleTabChange('PENDING')}
          className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === 'PENDING' ? 'text-[#1dbf73]' : 'text-[#7a7d85] hover:text-[#404145]'}`}
        >
          Review Manual (&gt; Rp10M)
          {activeTab === 'PENDING' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1dbf73] rounded-t-md" />}
        </button>
        <button 
          onClick={() => handleTabChange('FAILED')}
          className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === 'FAILED' ? 'text-red-500' : 'text-[#7a7d85] hover:text-[#404145]'}`}
        >
          Transaksi Bouncing/Gagal
          {activeTab === 'FAILED' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-500 rounded-t-md" />}
        </button>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-none ring-1 ring-gray-100">
        <div className="p-4 bg-gray-50/50 border-b border-gray-200 font-bold text-xs flex items-center justify-between uppercase tracking-wider text-gray-500">
          <div className="flex items-center gap-2">
            {activeTab === 'PENDING' ? <><DollarSign size={16} className="text-green-500"/> Antrean Review Pencairan Besar</> : <><XCircle size={16} className="text-red-500"/> Daftar Pencairan Gagal</>}
          </div>
          <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[10px] font-black">{pagination.total_items} TOTAL</span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {loading ? (
             <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-[#1dbf73]" size={40}/></div>
          ) : data.length === 0 ? (
            <div className="p-20 text-center text-[#7a7d85] font-bold italic">Tidak ada data penarikan untuk kategori ini.</div>
          ) : (
            data.map(w => (
              <div key={w.withdrawal_id || w.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className={`p-3 rounded-2xl ${activeTab === 'PENDING' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    <DollarSign size={24}/>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tight">WD_ID: {w.withdrawal_id || w.id}</p>
                    <p className={`font-black text-xl ${activeTab === 'PENDING' ? 'text-[#404145]' : 'text-red-600'}`}>Rp {Number(w.amount).toLocaleString('id-ID')}</p>
                    {w.creators && <p className="text-xs text-gray-500 font-bold">Creator: {w.creators.nama_lengkap || 'Unknown'}</p>}
                  </div>
                </div>
                {activeTab === 'PENDING' ? (
                  <Button onClick={() => handleApprove(w.withdrawal_id || w.id)} className="bg-green-600 hover:bg-green-700 gap-2 text-sm font-black rounded-xl px-6 h-11">
                    <CheckCircle size={18}/> Setujui & Transfer
                  </Button>
                ) : (
                  <Button variant="outline" className="text-sm font-black rounded-xl px-6 h-11 border-gray-300">Investigasi</Button>
                )}
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

export default FinanceWithdrawals;