import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { fetchApi } from '../../utils/api';
import { Settings, Save, Loader2, Clock, AlertCircle, User, Key, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminSettings = () => {
    const [settings, setSettings] = useState({ tracker_frequency: '1' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Profile State
    const [profileForm, setProfileForm] = useState({ nama_lengkap: '', profile_picture_url: '', email: '' });
    const [profileFile, setProfileFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);

    // Password State
    const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [passwordSaving, setPasswordSaving] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load System Settings
                const settingsRes = await fetchApi('/admin/settings');
                if (settingsRes.data) {
                    setSettings(prev => ({ ...prev, ...settingsRes.data }));
                }

                // Load My Profile
                const profileRes = await fetchApi('/auth/me');
                if (profileRes.data) {
                    setProfileForm({
                        nama_lengkap: profileRes.data.nama_lengkap || '',
                        profile_picture_url: profileRes.data.profile_picture_url || '',
                        email: profileRes.data.email || ''
                    });
                    setProfilePreview(profileRes.data.profile_picture_url);
                }
            } catch (err) {
                console.error("Gagal memuat data:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        try {
            const formData = new FormData();
            formData.append('nama_lengkap', profileForm.nama_lengkap);
            if (profileFile) {
                formData.append('profile_picture', profileFile);
            }

            await fetchApi('/auth/profile', {
                method: 'PUT',
                body: formData
            });

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Profil Anda telah diperbarui',
                timer: 2000,
                showConfirmButton: false
            });
            window.dispatchEvent(new Event('profileUpdated'));
        } catch (err) {
            Swal.fire('Error', err.message || 'Gagal memperbarui profil', 'error');
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            return Swal.fire('Error', 'Konfirmasi password tidak cocok', 'error');
        }

        setPasswordSaving(true);
        try {
            await fetchApi('/auth/change-password', {
                method: 'PUT',
                body: JSON.stringify({
                    old_password: passwordForm.old_password,
                    new_password: passwordForm.new_password
                })
            });
            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: 'Password berhasil diubah',
                timer: 2000,
                showConfirmButton: false
            });
            setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            Swal.fire('Error', err.message || 'Gagal mengubah password', 'error');
        } finally {
            setPasswordSaving(false);
        }
    };

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Settings (Left) */}
                <div className="space-y-6">
                    <form onSubmit={handleSave}>
                        <Card className="shadow-lg border-none ring-1 ring-gray-200">
                            <h3 className="font-black text-lg text-[#404145] mb-6 flex items-center gap-2 px-2">
                                <Settings size={20} className="text-[#1dbf73]" /> Konfigurasi Global
                            </h3>
                            <div className="space-y-6 p-2">
                                {/* Tracker Frequency */}
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b">
                                    <div className="space-y-1">
                                        <h4 className="font-black text-[#404145] flex items-center gap-2">
                                            <Clock size={18} className="text-blue-500" /> Frekuensi Tracking
                                        </h4>
                                        <p className="text-[10px] text-gray-500 max-w-[250px]">
                                            Interval (menit) bot memeriksa update views sosial media.
                                        </p>
                                    </div>
                                    <div className="w-24 relative">
                                        <input 
                                            type="number" 
                                            min="1" 
                                            className="w-full pl-3 pr-8 py-2 border-2 border-gray-100 rounded-lg outline-none focus:border-[#1dbf73] font-black text-center text-sm"
                                            value={settings.tracker_frequency}
                                            onChange={(e) => setSettings({ ...settings, tracker_frequency: e.target.value })}
                                        />
                                        <span className="absolute right-2 top-2.5 text-[9px] font-black text-gray-400">MIN</span>
                                    </div>
                                </div>

                                {/* Info Box */}
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                                    <AlertCircle className="text-amber-600 shrink-0" size={18} />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-amber-900 uppercase">Peringatan Kuota</p>
                                        <p className="text-[10px] text-amber-800 leading-tight">
                                            Angka kecil mempercepat pemakaian API Quota. Disarankan 10-30 menit.
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-4">
                                    <Button 
                                        type="submit" 
                                        disabled={saving}
                                        className="bg-[#1dbf73] hover:bg-[#19a463] shadow-md flex items-center gap-2 px-6 h-10 text-xs"
                                    >
                                        {saving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                                        SIMPAN SISTEM
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </form>
                </div>

                {/* Profile & Password (Right) */}
                <div className="space-y-6">
                    {/* My Profile */}
                    <form onSubmit={handleProfileSave}>
                        <Card className="shadow-lg border-none ring-1 ring-gray-200">
                            <h3 className="font-black text-lg text-[#404145] mb-6 flex items-center gap-2 px-2">
                                <User size={20} className="text-[#1dbf73]" /> Profil Saya
                            </h3>
                            
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-20 h-20 rounded-full border-4 border-gray-50 overflow-hidden mb-3 bg-gray-50 flex items-center justify-center relative group">
                                    {profilePreview ? (
                                        <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon size={24} className="text-gray-300" />
                                    )}
                                    <label className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer text-white text-[10px] font-black transition-opacity">
                                        GANTI
                                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                    </label>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Avatar Admin</p>
                            </div>

                            <div className="space-y-4 px-2">
                                <Input 
                                    label="Username" 
                                    value={profileForm.email?.split('@')[0] || ''} 
                                    readOnly 
                                    disabled 
                                    helperText="Username tidak dapat diubah"
                                />

                                <Input 
                                    label="Nama Lengkap" 
                                    placeholder="Masukkan nama lengkap Anda"
                                    value={profileForm.nama_lengkap}
                                    onChange={(e) => setProfileForm({ ...profileForm, nama_lengkap: e.target.value })}
                                    required
                                />
                                
                                <div className="flex justify-end pt-2">
                                    <Button 
                                        type="submit" 
                                        disabled={profileSaving}
                                        className="bg-gray-800 hover:bg-black shadow-md flex items-center gap-2 px-6 h-10 text-xs"
                                    >
                                        {profileSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                                        UPDATE PROFIL
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </form>

                    {/* Change Password */}
                    <form onSubmit={handlePasswordSave}>
                        <Card className="shadow-lg border-none ring-1 ring-gray-200">
                            <h3 className="font-black text-lg text-[#404145] mb-6 flex items-center gap-2 px-2">
                                <Key size={20} className="text-[#1dbf73]" /> Keamanan
                            </h3>
                            <div className="space-y-3 px-2">
                                <Input 
                                    label="Password Lama" 
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordForm.old_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                                    required
                                />
                                <Input 
                                    label="Password Baru" 
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordForm.new_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                                    required
                                />
                                <Input 
                                    label="Konfirmasi Password" 
                                    type="password"
                                    placeholder="••••••••"
                                    value={passwordForm.confirm_password}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                                    required
                                />
                                <div className="flex justify-end pt-2">
                                    <Button 
                                        type="submit" 
                                        disabled={passwordSaving}
                                        className="bg-blue-600 hover:bg-blue-700 shadow-md flex items-center gap-2 px-6 h-10 text-xs"
                                    >
                                        {passwordSaving ? <Loader2 className="animate-spin" size={16}/> : <Save size={16}/>}
                                        GANTI PASSWORD
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </form>
                </div>
            </div>

        </div>
    );
};

export default AdminSettings;
