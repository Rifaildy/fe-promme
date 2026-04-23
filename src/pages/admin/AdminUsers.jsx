import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { Users, CheckCircle, XCircle, Power, Filter, Eye, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null); 

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchApi('/admin/users');
      setUsers(res.data || []);
      
      if (selectedUser) {
        const updatedSelected = res.data.find(u => u.id === selectedUser.id);
        if(updatedSelected) setSelectedUser(updatedSelected);
      }
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleUpdateStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const confirm = await Swal.fire({
      title: 'Konfirmasi Status',
      text: `Yakin ingin mengubah status user menjadi ${newStatus}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Ubah',
      confirmButtonColor: '#1dbf73',
      cancelButtonColor: '#ef4444',
    });
    
    if(!confirm.isConfirmed) return;
    
    try {
      await fetchApi(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
      Swal.fire('Berhasil', 'Status pengguna diperbarui', 'success');
      loadUsers(); 
    } catch (err) { Swal.fire('Error', err.message, 'error'); }
  };

  const handleReviewKyc = async (creatorId, status) => {
    if (!creatorId) return Swal.fire("Error", "User ini belum memiliki data profil Creator!", "error");
    
    const confirm = await Swal.fire({
      title: 'Validasi KYC',
      text: `Yakin ingin menandai dokumen KYC ini sebagai ${status}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: status === 'VERIFIED' ? '#1dbf73' : '#ef4444',
      confirmButtonText: `Ya, ${status}`
    });

    if(!confirm.isConfirmed) return;
    
    try {
      await fetchApi(`/admin/kyc/${creatorId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      Swal.fire('Berhasil', `Status KYC berhasil diubah menjadi ${status}`, 'success');
      loadUsers();
    } catch (err) { Swal.fire('Error', err.message, 'error'); }
  };

  // --- DETAIL VIEW ---
  if (selectedUser) {
    const isCreator = selectedUser.role === 'CREATOR';
    const isBrand = selectedUser.role === 'BRAND';
    // Menangani baik format object langsung maupun array dari Supabase
    const creatorData = Array.isArray(selectedUser.creators) ? selectedUser.creators[0] : selectedUser.creators;
    const brandData = Array.isArray(selectedUser.brands) ? selectedUser.brands[0] : selectedUser.brands;
    const kycStatus = creatorData?.kyc_status || 'BELUM SUBMIT';

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedUser(null)} className="px-3"><ArrowLeft size={20}/></Button>
          <h2 className="text-2xl font-black text-[#404145]">Detail Pengguna</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 h-max">
            <h3 className="font-bold border-b pb-2 mb-4 text-[#404145]">Informasi Akun</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500 block text-xs">User ID</span><span className="font-mono text-xs">{selectedUser.id}</span></div>
              <div><span className="text-gray-500 block text-xs">Email</span><span className="font-bold">{selectedUser.email}</span></div>
              <div><span className="text-gray-500 block text-xs">Role</span><span className="font-bold text-[#1dbf73]">{selectedUser.role}</span></div>
              <div>
                <span className="text-gray-500 block text-xs">Status Akun</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${selectedUser.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedUser.status || 'ACTIVE'}
                </span>
              </div>
            </div>
          </Card>
          <Card className="col-span-1 md:col-span-2">
            {isCreator && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                  <h3 className="font-bold text-[#404145]">Data Profil Creator</h3>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold 
                    ${kycStatus === 'VERIFIED' ? 'bg-blue-100 text-blue-700' : kycStatus === 'REJECTED' ? 'bg-red-100 text-red-700' : kycStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                    KYC: {kycStatus}
                  </span>
                </div>
                {!creatorData ? <p className="text-gray-500 italic text-sm">User belum melengkapi profil creator.</p> : (
                  <>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-gray-500 block text-xs">Nama Lengkap</span><span className="font-bold">{creatorData.nama_lengkap || '-'}</span></div>
                      <div><span className="text-gray-500 block text-xs">NPWP</span><span className="font-bold">{creatorData.npwp || 'Tidak Ada'}</span></div>
                      <div><span className="text-gray-500 block text-xs">Bank</span><span className="font-bold">{creatorData.bank_rekening || '-'}</span></div>
                      <div><span className="text-gray-500 block text-xs">No. Rekening</span><span className="font-bold">{creatorData.nomor_rekening || '-'}</span></div>
                    </div>
                    
                    {/* BAGIAN FOTO YANG DIPERBAIKI */}
                    <div className="pt-4 border-t border-gray-100">
                      <h4 className="font-bold text-sm text-[#404145] mb-3">Dokumen KYC</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-2 bg-gray-50 text-center">
                          <p className="text-xs font-bold mb-2">Foto KTP</p>
                          {creatorData.ktp_image_url ? (
                            <img src={creatorData.ktp_image_url} alt="KTP" className="max-h-40 mx-auto object-contain rounded" /> 
                          ) : (
                            <div className="py-10 text-gray-400 flex flex-col items-center"><ImageIcon size={24}/> Belum Upload</div>
                          )}
                        </div>
                        <div className="border rounded-lg p-2 bg-gray-50 text-center">
                          <p className="text-xs font-bold mb-2">Foto Selfie + KTP</p>
                          {creatorData.selfie_image_url ? (
                            <img src={creatorData.selfie_image_url} alt="Selfie" className="max-h-40 mx-auto object-contain rounded" /> 
                          ) : (
                            <div className="py-10 text-gray-400 flex flex-col items-center"><ImageIcon size={24}/> Belum Upload</div>
                          )}
                        </div>
                      </div>
                    </div>

                    {kycStatus === 'PENDING' && (
                      <div className="flex gap-2 pt-4 border-t border-gray-100 justify-end">
                        <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50 gap-2" onClick={() => handleReviewKyc(creatorData.id, 'REJECTED')}><XCircle size={16}/> Tolak KYC</Button>
                        <Button className="bg-[#1dbf73] hover:bg-[#19a463] gap-2" onClick={() => handleReviewKyc(creatorData.id, 'VERIFIED')}><CheckCircle size={16}/> Verifikasi & Setujui</Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {isBrand && (
              <div className="space-y-6">
                <h3 className="font-bold border-b pb-2 mb-4 text-[#404145]">Data Profil Brand</h3>
                {!brandData ? <p className="text-gray-500 italic text-sm">User belum melengkapi profil brand.</p> : (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500 block text-xs">Nama Perusahaan</span><span className="font-bold">{brandData.nama_perusahaan || '-'}</span></div>
                    <div><span className="text-gray-500 block text-xs">Penanggung Jawab (PIC)</span><span className="font-bold">{brandData.pic_name || '-'}</span></div>
                    <div><span className="text-gray-500 block text-xs">Nomor Telepon</span><span className="font-bold">{brandData.phone_number || '-'}</span></div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // --- MAIN TABLE VIEW ---
  const roleOrder = { 'ADMIN': 1, 'FINANCE': 2, 'BRAND': 3, 'CREATOR': 4 };
  const processedUsers = users
    .filter(u => roleFilter === 'ALL' ? true : u.role === roleFilter) 
    .sort((a, b) => (roleOrder[a.role] || 99) - (roleOrder[b.role] || 99)); 

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-[#404145]">User & Account Management</h2>
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm">
          <Filter size={16} className="text-[#7a7d85]" />
          <select className="bg-transparent font-bold text-[#404145] outline-none cursor-pointer" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="ALL">Semua Role</option>
            <option value="ADMIN">Admin</option>
            <option value="FINANCE">Finance</option>
            <option value="BRAND">Brand</option>
            <option value="CREATOR">Creator</option>
          </select>
        </div>
      </div>
      
      <Card className="p-0 overflow-hidden shadow-sm border-none ring-1 ring-gray-100">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 font-bold text-sm flex justify-between items-center">
          <div className="flex items-center gap-2 font-black text-[#404145] uppercase tracking-wider text-xs"><Users size={16} className="text-blue-500"/> Daftar Pengguna Sistem</div>
          <span className="text-[10px] font-black text-[#7a7d85] bg-gray-100 px-2 py-0.5 rounded-full">{processedUsers.length} TOTAL</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/30 text-gray-400 text-[10px] uppercase font-black border-b tracking-widest">
                <th className="p-4">Email / ID</th>
                <th className="p-4 text-center">Role</th>
                <th className="p-4 text-center">Status Akun</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {loading ? (
                <tr><td colSpan="4" className="p-12 text-center text-[#7a7d85]">Memuat data...</td></tr>
              ) : processedUsers.length === 0 ? (
                <tr><td colSpan="4" className="p-12 text-center text-[#7a7d85]">Tidak ada pengguna ditemukan.</td></tr>
              ) : (
                processedUsers.map(u => {
                  const isStaff = u.role === 'ADMIN' || u.role === 'FINANCE';
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-[#404145]">{u.email}</div>
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">{u.id}</div>
                      </td>
                      <td className="p-4 text-center">
                         <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-tighter shadow-sm border ${
                            u.role === 'ADMIN' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                            u.role === 'BRAND' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            u.role === 'FINANCE' ? 'bg-orange-50 border-orange-200 text-orange-700' :
                            'bg-green-50 border-green-200 text-green-700'
                         }`}>
                           {u.role}
                         </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-black shadow-sm ${u.status === 'ACTIVE' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {u.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {u.role !== 'ADMIN' ? (
                            <Button 
                              variant="outline" 
                              className={`text-[9px] font-black py-1 px-3 h-8 shadow-sm transition-all active:scale-95 ${u.status === 'ACTIVE' ? 'text-red-500 border-red-100 hover:bg-red-50' : 'text-green-600 border-green-100 hover:bg-green-50'}`}
                              onClick={() => handleUpdateStatus(u.id, u.status || 'ACTIVE')}
                            >
                              <Power size={12} className="mr-1"/> {u.status === 'ACTIVE' ? 'SUSPEND' : 'ACTIVATE'}
                            </Button>
                          ) : <span className="text-[9px] text-gray-300 font-black uppercase">Restricted</span>}
                        </div>
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