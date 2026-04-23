import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { Settings, Save, Loader2, Clock, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminSettings = () => {
    const [settings, setSettings] = useState({ tracker_frequency: '1' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const res = await fetchApi('/admin/settings');
                if (res.data) {
                    setSettings(prev => ({ ...prev, ...res.data }));
                }
            } catch (err) {
                console.error("Gagal memuat pengaturan:", err);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await fetchApi('/admin/settings', {
                method: 'PATCH',
                body: JSON.stringify(settings)
            });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Pengaturan sistem telah diperbarui',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            Swal.fire('Error', err.message || 'Gagal menyimpan pengaturan', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[#1dbf73]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-[#404145] flex items-center gap-2">
                        <Settings className="text-[#1dbf73]" size={24} /> Pengaturan Sistem
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Konfigurasi parameter operasional platform Promme secara global.</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSave}>
                    <Card className="shadow-lg border-none ring-1 ring-gray-200">
                        <div className="space-y-6 p-2">
                            {/* Tracker Frequency */}
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
                                <div className="space-y-1">
                                    <h4 className="font-black text-[#404145] flex items-center gap-2">
                                        <Clock size={18} className="text-blue-500" /> Frekuensi Tracking View
                                    </h4>
                                    <p className="text-xs text-gray-500 max-w-md">
                                        Mengatur seberapa sering (dalam menit) bot akan memeriksa dan mengupdate views ke platform sosial media (YouTube/TikTok/IG).
                                    </p>
                                </div>
                                <div className="w-32 relative">
                                    <input 
                                        type="number" 
                                        min="1" 
                                        className="w-full pl-4 pr-10 py-2 border-2 border-gray-100 rounded-lg outline-none focus:border-[#1dbf73] font-black text-center"
                                        value={settings.tracker_frequency}
                                        onChange={(e) => setSettings({ ...settings, tracker_frequency: e.target.value })}
                                    />
                                    <span className="absolute right-3 top-2 text-[10px] font-black text-gray-400 mt-0.5">MIN</span>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                                <AlertCircle className="text-amber-600 shrink-0" size={20} />
                                <div className="space-y-1">
                                    <p className="text-xs font-black text-amber-900 border-b border-amber-200 pb-1 uppercase">Peringatan Penting</p>
                                    <p className="text-[11px] text-amber-800 leading-relaxed">
                                        Semakin kecil angka menit yang Anda masukkan, semakin sering bot akan memanggil API sosial media. 
                                        Hal ini akan **mempercepat pemakaian kuota API** Anda (YouTube Quota / RapidAPI Limit). 
                                        Disarankan menggunakan angka **10-30 menit** untuk penghematan kuota jika tráfico sedang tinggi.
                                    </p>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <Button 
                                    type="submit" 
                                    disabled={saving}
                                    className="bg-[#1dbf73] hover:bg-[#19a463] shadow-lg flex items-center gap-2 px-8 h-12"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={18}/>}
                                    SIMPAN PERUBAHAN
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};

export default AdminSettings;
