import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { FileText } from 'lucide-react';

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
      <h2 className="text-2xl font-black text-[#404145]">Sistem Audit & Log</h2>
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm flex items-center gap-2">
          <FileText size={16}/> Rekam Jejak Sistem (Immutable)
        </div>
        <div className="divide-y divide-gray-200 max-h-[500px] overflow-y-auto">
          {loading ? (
             <div className="p-6 text-center text-[#7a7d85]">Menarik data log...</div>
          ) : logs.length === 0 ? (
            <div className="p-6 text-center text-[#7a7d85]">Belum ada data log yang tercatat.</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="p-4 hover:bg-gray-50 flex gap-4 font-mono text-sm">
                <span className="text-gray-400">[{new Date(log.created_at).toLocaleString()}]</span>
                <span className="font-bold text-[#1dbf73]">{log.action}</span>
                <span className="text-[#404145]">{log.details}</span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default AdminAuditLogs;