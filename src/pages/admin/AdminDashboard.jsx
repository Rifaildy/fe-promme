import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { fetchApi } from '../../utils/api';
import { Users, ShieldAlert, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/admin/users')
      .then(res => setUsers(res.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const totalBrand = users.filter(u => u.role === 'BRAND').length;
  const totalCreator = users.filter(u => u.role === 'CREATOR').length;

  if (loading) return <div className="text-center py-10 text-[#7a7d85]">Memuat Data Admin...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-[#404145]">Platform Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-[#7a7d85] font-semibold text-sm flex items-center gap-2"><Users size={16}/> Total Pengguna Aktif</h3>
          <p className="text-3xl font-black text-[#404145] mt-2">{users.length}</p>
          <div className="flex gap-4 mt-2 text-xs font-bold text-[#7a7d85]">
            <span>{totalBrand} Brand</span>
            <span>{totalCreator} Creator</span>
          </div>
        </Card>
        <Card className="bg-[#404145] text-white">
          <h3 className="text-gray-300 font-semibold text-sm flex items-center gap-2"><ShieldAlert size={16}/> Sistem Keamanan</h3>
          <p className="text-xl font-bold mt-2 text-[#1dbf73]">Normal</p>
          <p className="text-xs text-gray-400 mt-1">Tidak ada anomali terdeteksi</p>
        </Card>
        <Card>
          <h3 className="text-[#7a7d85] font-semibold text-sm flex items-center gap-2"><Activity size={16}/> Server Status</h3>
          <p className="text-xl font-bold mt-2 text-[#1dbf73]">Online</p>
          <p className="text-xs text-[#7a7d85] mt-1">Semua layanan beroperasi</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-[#404145] mb-4 flex items-center gap-2"><Activity size={18}/> Aktivitas Sistem Terbaru</h3>
        <div className="space-y-4">
          {[
            { action: 'Pendaftaran Akun Baru', user: 'budi@brand.co.id', time: '10 menit yang lalu' },
            { action: 'Update Konfigurasi', user: 'Admin System', time: '1 jam yang lalu' },
            { action: 'Penarikan Dana Selesai', user: 'finance@promme.id', time: '3 jam yang lalu' }
          ].map((log, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
              <div>
                <p className="font-semibold text-sm text-[#404145]">{log.action}</p>
                <p className="text-xs text-gray-500">{log.user}</p>
              </div>
              <span className="text-xs font-medium text-gray-400">{log.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;