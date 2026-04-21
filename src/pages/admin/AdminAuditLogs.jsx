import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { FileText, User, Tag, Clock } from 'lucide-react';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/admin/audit-logs')
      .then(res => setLogs(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#404145]">Sistem Audit & Log</h2>
      </div>

      <Card className="p-0 overflow-hidden shadow-sm border-gray-200">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm flex items-center gap-2 text-gray-700">
          <FileText size={16} className="text-blue-500"/> Rekam Jejak Sistem (Immutable)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-4 font-black">Waktu</th>
                <th className="p-4 font-black">Admin ID</th>
                <th className="p-4 font-black">Aksi</th>
                <th className="p-4 font-black">Entitas</th>
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
      </Card>
    </div>
  );
};

export default AdminAuditLogs;