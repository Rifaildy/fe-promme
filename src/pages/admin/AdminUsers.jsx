// --- src/pages/admin/AdminUsers.jsx ---
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { Users, CheckCircle, XCircle, Power, Filter } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL'); // State untuk filter

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/users');
      setUsers(res.data || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if(!window.confirm(`Yakin ingin mengubah status user menjadi ${newStatus}?`)) return;
    try {
      await fetchApi(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      loadUsers(); // Refresh data
    } catch (err) { alert(err.message); }
  };

  // Sekarang kita menerima creatorId yang asli, bukan userId
  const handleReviewKyc = async (creatorId, status) => {
    if (!creatorId) return alert("Error: User ini belum memiliki data profil Creator!");
    if(!window.confirm(`Yakin ingin ${status} KYC ini?`)) return;
    
    try {
      await fetchApi(`/admin/kyc/${creatorId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      alert(`Status KYC berhasil diubah menjadi ${status}`);
      loadUsers(); // Refresh data untuk melihat perubahan di tabel
    } catch (err) { alert(err.message); }
  };

  // --- LOGIKA FILTERING & SORTING ---
  const roleOrder = { 'ADMIN': 1, 'FINANCE': 2, 'BRAND': 3, 'CREATOR': 4 };
  
  const processedUsers = users
    .filter(u => roleFilter === 'ALL' ? true : u.role === roleFilter) // Filter role
    .sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99)); // Sorting prioritas

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#404145]">User & KYC Management</h2>
        
        {/* Dropdown Filter */}
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Filter size={16} className="text-[#7a7d85]" />
          <select 
            className="bg-transparent text-sm font-bold text-[#404145] outline-none cursor-pointer"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="FINANCE">Finance</option>
            <option value="BRAND">Brand</option>
            <option value="CREATOR">Creator</option>
          </select>
        </div>
      </div>
      
      <Card className="p-0 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 font-bold text-sm flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users size={16}/> Daftar Pengguna
          </div>
          <span className="text-xs font-normal text-[#7a7d85]">Menampilkan {processedUsers.length} data</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-[#7a7d85] text-xs uppercase border-b">
                <th className="p-4">Email / User ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status Akun</th>
                <th className="p-4">Status KYC</th>
                <th className="p-4 text-right">Aksi Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="5" className="p-6 text-center text-[#7a7d85]">Memuat data pengguna...</td></tr>
              ) : processedUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-[#7a7d85]">Tidak ada pengguna ditemukan.</td></tr>
              ) : (
                processedUsers.map(u => {
                  // Ekstrak data creator dari hasil JOIN (Supabase biasanya me-return array untuk 1:M atau object tunggal untuk 1:1)
                  const creatorData = Array.isArray(u.creators) ? u.creators[0] : u.creators;
                  const kycStatus = creatorData?.kyc_status || 'BELUM SUBMIT';

                  return (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-bold text-[#404145]">{u.email}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-1">{u.id}</div>
                      </td>
                      <td className="p-4 font-bold text-[#1dbf73]">{u.role}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4">
                        {u.role === 'CREATOR' ? (
                          <span className={`px-2 py-1 rounded text-[10px] font-bold 
                            ${kycStatus === 'VERIFIED' ? 'bg-blue-100 text-blue-700' 
                            : kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700' 
                            : kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' 
                            : 'bg-gray-100 text-gray-600'}`}>
                            {kycStatus}
                          </span>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="p-4 flex flex-col gap-2 items-end">
                        <Button variant="outline" className="text-[10px] py-1 px-2 h-auto" onClick={() => handleUpdateStatus(u.id, u.status || 'ACTIVE')}>
                          <Power size={12} className="mr-1"/> Suspend/Active
                        </Button>
                        
                        {/* Tombol KYC hanya muncul jika Role Creator dan kycStatus PENDING */}
                        {u.role === 'CREATOR' && kycStatus === 'PENDING' && creatorData && (
                          <div className="flex gap-1 mt-1">
                            <button 
                              onClick={() => handleReviewKyc(creatorData.id, 'VERIFIED')} 
                              className="text-[10px] bg-green-500 hover:bg-green-600 transition-colors text-white px-2 py-1 rounded flex items-center"
                            >
                              <CheckCircle size={10} className="mr-1"/> Approve
                            </button>
                            <button 
                              onClick={() => handleReviewKyc(creatorData.id, 'REJECTED')} 
                              className="text-[10px] bg-red-500 hover:bg-red-600 transition-colors text-white px-2 py-1 rounded flex items-center"
                            >
                              <XCircle size={10} className="mr-1"/> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminUsers;