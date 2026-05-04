import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { FileText, User, Tag, Clock, Search, RefreshCw } from 'lucide-react';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total_pages: 1, total_items: 0 });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/audit-logs', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm,
          status: actionFilter,
          sort: sortConfig.key ? `${sortConfig.direction === 'desc' ? '-' : ''}${sortConfig.key}` : ''
        }
      });
      setLogs(res.data || []);
      if (res.pagination) {
        setPagination({
          page: res.pagination.current_page,
          limit: res.pagination.per_page,
          total_items: res.pagination.total_items,
          total_pages: res.pagination.total_pages
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [pagination.page, searchTerm, actionFilter, sortConfig]);

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return <span className="ml-1 text-[10px]">{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h2 className="text-2xl font-black text-[#404145]">Sistem Audit & Log</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-full md:w-64">
            <Search size={16} className="text-[#7a7d85]" />
            <input
              type="text"
              placeholder="Cari log..."
              className="bg-transparent text-sm font-medium outline-none w-full text-[#404145]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none text-[#404145] cursor-pointer"
            >
              <option value="all">Semua Aksi</option>
              <option value="APPROVE_SUBMISSION">APPROVE_SUBMISSION</option>
              <option value="INVALIDATE_SUBMISSION">INVALIDATE_SUBMISSION</option>
              <option value="HOLD_WALLET_BALANCE">HOLD_WALLET_BALANCE</option>
              <option value="RELEASE_WALLET_BALANCE">RELEASE_WALLET_BALANCE</option>
              <option value="SUSPEND_USER">SUSPEND_USER</option>
              <option value="ACTIVATE_USER">ACTIVATE_USER</option>
              <option value="UPDATE_SYSTEM_SETTINGS">UPDATE_SYSTEM_SETTINGS</option>
              <option value="LOGIN">LOGIN</option>
            </select>
          </div>
          <Button onClick={loadData} variant="outline" className="p-2" disabled={loading}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-gray-200">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm flex items-center gap-2 text-gray-700">
          <FileText size={16} className="text-blue-500"/> Rekam Jejak Sistem (Immutable)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-black cursor-pointer hover:bg-gray-50" onClick={() => handleSort('created_at')}>
                  Waktu <SortIcon columnKey="created_at" />
                </th>
                <th className="p-4 font-black cursor-pointer hover:bg-gray-50" onClick={() => handleSort('actor_id')}>
                  Admin ID <SortIcon columnKey="actor_id" />
                </th>
                <th className="p-4 font-black cursor-pointer hover:bg-gray-50" onClick={() => handleSort('action')}>
                  Aksi <SortIcon columnKey="action" />
                </th>
                <th className="p-4 font-black cursor-pointer hover:bg-gray-50" onClick={() => handleSort('entity_type')}>
                  Entitas <SortIcon columnKey="entity_type" />
                </th>
                <th className="p-4 font-black">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                 <tr><td colSpan="5" className="p-12 text-center text-gray-400">Menarik data log...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5" className="p-12 text-center text-gray-400 italic">Belum ada data log yang tercatat.</td></tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap text-gray-500 flex items-center gap-2">
                      <Clock size={12}/> {new Date(log.created_at).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4 font-mono text-[10px] text-gray-400">
                      <div className="flex items-center gap-1"><User size={10}/> {log.actor_id?.split('-')[0]}...</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 rounded bg-blue-50 text-blue-600 font-bold text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-[#404145] font-medium"><Tag size={12}/> {log.entity_type}</div>
                      <div className="text-[10px] text-gray-300 font-mono">{log.entity_id?.split('-')[0]}...</div>
                    </td>
                    <td className="p-4">
                       <div className="max-w-xs overflow-hidden text-ellipsis">
                          {log.new_data ? (
                            <pre className="text-[9px] bg-gray-100 p-1 rounded text-gray-600 max-h-12 overflow-y-auto">
                              {JSON.stringify(log.new_data)}
                            </pre>
                          ) : <span className="text-gray-300 text-[10px]">-</span>}
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 bg-white">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            totalItems={pagination.total_items}
            limit={pagination.limit}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;