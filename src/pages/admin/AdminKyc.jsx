import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { 
  ShieldCheck, CheckCircle, XCircle, Filter, 
  Eye, ArrowLeft, Image as ImageIcon, Search,
  Clock, AlertCircle, User
} from 'lucide-react';
import Swal from 'sweetalert2';
import Pagination from '../../components/ui/Pagination';

const AdminKyc = () => {
    const [creators, setCreators] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_items: 0 });
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        kyc_status: 'PENDING'
    });
    const [selectedCreator, setSelectedCreator] = useState(null);

    const loadCreators = async () => {
        setLoading(true);
        try {
            const res = await fetchApi('/admin/users', {
                params: {
                    ...filters,
                    role: 'CREATOR',
                    kyc_status: filters.kyc_status === 'ALL' ? '' : filters.kyc_status
                }
            });
            
            let onlyCreators = (res.data || [])
                .map(u => {
                    const c = Array.isArray(u.creators) ? u.creators[0] : u.creators;
                    return c ? { ...c, user: { email: u.email, status: u.status, id: u.id } } : null;
                })
                .filter(Boolean);

            // Client-side search by nama_lengkap since backend searches email/username only
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                onlyCreators = onlyCreators.filter(c => 
                    (c.nama_lengkap || '').toLowerCase().includes(searchLower) ||
                    (c.user?.email || '').toLowerCase().includes(searchLower)
                );
            }
            
            setCreators(onlyCreators);
            if (res.pagination) {
                setPagination(res.pagination);
            }

            if (selectedCreator) {
                const updated = onlyCreators.find(c => c.id === selectedCreator.id);
                if (updated) setSelectedCreator(updated);
            }
        } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Gagal memuat data KYC', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadCreators(); }, [filters]);

    const handleReviewKyc = async (creatorId, status) => {
        const confirm = await Swal.fire({
            title: 'Validasi KYC',
            text: `Yakin ingin menandai dokumen KYC ini sebagai ${status}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: status === 'VERIFIED' ? '#1dbf73' : '#ef4444',
            confirmButtonText: `Ya, ${status}`
        });

        if (!confirm.isConfirmed) return;

        try {
            await fetchApi(`/admin/kyc/${creatorId}`, { 
                method: 'PATCH', 
                body: JSON.stringify({ status }) 
            });
            Swal.fire('Berhasil', `Status KYC berhasil diubah menjadi ${status}`, 'success');
            loadCreators();
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    if (selectedCreator) {
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => setSelectedCreator(null)} className="px-3 hover:bg-gray-100 rounded-full">
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-black text-[#404145]">Review Dokumen KYC</h2>
                        <p className="text-sm text-gray-500">Verifikasi identitas untuk {selectedCreator.nama_lengkap}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-lg border-none ring-1 ring-gray-100">
                            <h3 className="font-black text-sm text-[#404145] uppercase tracking-wider mb-4 border-b pb-2">Informasi Profil</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                                        {selectedCreator.nama_lengkap?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{selectedCreator.nama_lengkap}</div>
                                        <div className="text-xs text-gray-400">{selectedCreator.user?.email}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-3 pt-2">
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">NIK (KTP)</label>
                                        <span className="font-black text-gray-700">{selectedCreator.nik || '-'}</span>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-xl">
                                        <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">NPWP</label>
                                        <span className="font-black text-gray-700">{selectedCreator.npwp || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {selectedCreator.kyc_status === 'PENDING' && (
                            <Card className="bg-amber-50 border-amber-200">
                                <div className="flex gap-3">
                                    <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                    <div>
                                        <p className="text-xs font-bold text-amber-900 uppercase">Menunggu Validasi</p>
                                        <p className="text-[11px] text-amber-800 mt-1">Harap periksa keaslian foto KTP dan kecocokan wajah dengan foto selfie sebelum menyetujui.</p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-lg border-none ring-1 ring-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-sm text-[#404145] uppercase tracking-wider">Dokumen Lampiran</h3>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase 
                                    ${selectedCreator.kyc_status === 'VERIFIED' ? 'bg-green-100 text-green-700' : 
                                      selectedCreator.kyc_status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                                      'bg-amber-100 text-amber-700'}`}>
                                    {selectedCreator.kyc_status}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-2">
                                        <ImageIcon size={14}/> Foto KTP Asli
                                    </label>
                                    <div className="aspect-[3/2] bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center group relative">
                                        {selectedCreator.ktp_image_url ? (
                                            <img 
                                                src={selectedCreator.ktp_image_url} 
                                                alt="KTP" 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-zoom-in"
                                                onClick={() => window.open(selectedCreator.ktp_image_url, '_blank')}
                                            />
                                        ) : (
                                            <div className="text-gray-400 flex flex-col items-center italic text-xs">Belum diupload</div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-2">
                                        <ImageIcon size={14}/> Selfie + KTP
                                    </label>
                                    <div className="aspect-[3/2] bg-gray-100 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center group relative">
                                        {selectedCreator.selfie_image_url ? (
                                            <img 
                                                src={selectedCreator.selfie_image_url} 
                                                alt="Selfie" 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-zoom-in"
                                                onClick={() => window.open(selectedCreator.selfie_image_url, '_blank')}
                                            />
                                        ) : (
                                            <div className="text-gray-400 flex flex-col items-center italic text-xs">Belum diupload</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {selectedCreator.kyc_status === 'PENDING' && (
                                <div className="flex gap-3 mt-10 pt-6 border-t border-gray-100">
                                    <Button 
                                        variant="outline" 
                                        className="flex-1 h-12 text-red-600 border-red-200 hover:bg-red-50 font-black gap-2"
                                        onClick={() => handleReviewKyc(selectedCreator.id, 'REJECTED')}
                                    >
                                        <XCircle size={18} /> TOLAK KYC
                                    </Button>
                                    <Button 
                                        className="flex-1 h-12 bg-[#1dbf73] hover:bg-[#19a463] text-white font-black gap-2 shadow-lg shadow-green-100"
                                        onClick={() => handleReviewKyc(selectedCreator.id, 'VERIFIED')}
                                    >
                                        <CheckCircle size={18} /> SETUJUI & VERIFIKASI
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[#404145] flex items-center gap-2">
                        <ShieldCheck className="text-blue-600" size={28} /> Verifikasi KYC
                    </h2>
                    <p className="text-sm text-gray-500">Kelola persetujuan identitas untuk para Creator.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm">
                        <Filter size={16} className="text-gray-400" />
                        <select 
                            className="bg-transparent font-bold text-[#404145] outline-none cursor-pointer"
                            value={filters.limit}
                            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                        >
                            <option value={10}>10 Baris</option>
                            <option value={25}>25 Baris</option>
                            <option value={50}>50 Baris</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm w-full md:w-64">
                        <Search size={16} className="text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Cari Nama/Email..." 
                            className="bg-transparent text-sm outline-none w-full"
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: 'PENDING', label: 'Menunggu Review', icon: <Clock size={14}/>, color: 'amber' },
                    { id: 'VERIFIED', label: 'Terverifikasi', icon: <CheckCircle size={14}/>, color: 'blue' },
                    { id: 'REJECTED', label: 'Ditolak', icon: <XCircle size={14}/>, color: 'red' },
                    { id: 'ALL', label: 'Semua', icon: <Filter size={14}/>, color: 'gray' }
                ].map(f => (
                    <button
                        key={f.id}
                        onClick={() => handleFilterChange('kyc_status', f.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black transition-all border
                            ${filters.kyc_status === f.id 
                                ? `bg-${f.color === 'blue' ? 'blue-600' : f.color === 'amber' ? 'amber-500' : f.color === 'red' ? 'red-600' : 'gray-800'} text-white border-transparent` 
                                : `bg-white text-gray-600 border-gray-200 hover:border-gray-400`}`}
                    >
                        {f.icon} {f.label}
                    </button>
                ))}
            </div>

            <Card className="p-0 overflow-hidden shadow-sm border-none ring-1 ring-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black border-b tracking-widest">
                                <th className="p-4">Creator</th>
                                <th className="p-4">NIK / Identitas</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {loading ? (
                                <tr><td colSpan="4" className="p-12 text-center text-gray-400">Memuat data...</td></tr>
                            ) : creators.length === 0 ? (
                                <tr><td colSpan="4" className="p-12 text-center text-gray-400 italic">Tidak ada data untuk filter ini.</td></tr>
                            ) : creators.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => setSelectedCreator(c)}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                                                {c.nama_lengkap?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{c.nama_lengkap}</div>
                                                <div className="text-[10px] text-gray-400">{c.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="font-mono text-xs text-gray-600">{c.nik || 'N/A'}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter
                                            ${c.kyc_status === 'VERIFIED' ? 'bg-blue-50 text-blue-600' : 
                                              c.kyc_status === 'REJECTED' ? 'bg-red-50 text-red-600' : 
                                              'bg-amber-50 text-amber-600'}`}>
                                            {c.kyc_status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <Button 
                                            onClick={() => setSelectedCreator(c)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] px-4 py-1.5 rounded-lg flex items-center gap-2 mx-auto"
                                        >
                                            <Eye size={12}/> Review Dokumen
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 bg-white">
                    <Pagination
                        currentPage={pagination.current_page}
                        totalPages={pagination.total_pages}
                        totalItems={pagination.total_items}
                        limit={filters.limit}
                        onPageChange={handlePageChange}
                        loading={loading}
                    />
                </div>
            </Card>
        </div>
    );
};

export default AdminKyc;
