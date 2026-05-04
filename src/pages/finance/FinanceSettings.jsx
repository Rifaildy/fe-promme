import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { fetchApi } from '../../utils/api';
import { User, Key, Save, Loader2, Image as ImageIcon, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

const FinanceSettings = () => {
    const [loading, setLoading] = useState(true);
    
    // Profile State
    const [profileForm, setProfileForm] = useState({ nama_lengkap: '', profile_picture_url: '', email: '' });
    const [profileFile, setProfileFile] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);
    const [profileSaving, setProfileSaving] = useState(false);

    // Password State
    const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
    const [passwordSaving, setPasswordSaving] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const res = await fetchApi('/auth/me');
                if (res.data) {
                    setProfileForm({
                        nama_lengkap: res.data.nama_lengkap || '',
                        profile_picture_url: res.data.profile_picture_url || '',
                        email: res.data.email || ''
                    });
                    setProfilePreview(res.data.profile_picture_url);
                }
            } catch (err) {
                console.error("Gagal memuat profil:", err);
            } finally {
                setLoading(false);
            }
        };
        loadProfile();
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-[#1dbf73]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-[#404145] flex items-center gap-2">
                    <ShieldCheck className="text-[#1dbf73]" size={24} /> Pengaturan Akun Finance
                </h2>
                <p className="text-sm text-gray-500 mt-1">Kelola informasi profil dan keamanan akun divisi finansial.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
                {/* My Profile */}
                <form onSubmit={handleProfileSave}>
                    <Card className="shadow-lg border-none ring-1 ring-gray-200">
                        <h3 className="font-black text-lg text-[#404145] mb-6 flex items-center gap-2 px-2">
                            <User size={20} className="text-[#1dbf73]" /> Profil Finance
                        </h3>
                        
                        <div className="flex flex-col items-center mb-6">
                            <div className="w-24 h-24 rounded-full border-4 border-gray-50 overflow-hidden mb-3 bg-gray-50 flex items-center justify-center relative group">
                                {profilePreview ? (
                                    <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={32} className="text-gray-300" />
                                )}
                                <label className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer text-white text-xs font-black transition-opacity">
                                    GANTI
                                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Financial Officer</p>
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
                                placeholder="Nama lengkap Anda"
                                value={profileForm.nama_lengkap}
                                onChange={(e) => setProfileForm({ ...profileForm, nama_lengkap: e.target.value })}
                                required
                            />
                            
                            <div className="flex justify-end pt-2">
                                <Button 
                                    type="submit" 
                                    disabled={profileSaving}
                                    className="bg-[#1dbf73] hover:bg-[#19a463] shadow-md flex items-center gap-2 px-8 h-12"
                                >
                                    {profileSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={18}/>}
                                    SIMPAN PROFIL
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>

                {/* Change Password */}
                <form onSubmit={handlePasswordSave}>
                    <Card className="shadow-lg border-none ring-1 ring-gray-200 h-full">
                        <h3 className="font-black text-lg text-[#404145] mb-6 flex items-center gap-2 px-2">
                            <Key size={20} className="text-[#1dbf73]" /> Keamanan Akun
                        </h3>
                        <div className="space-y-4 px-2">
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
                                    className="bg-gray-800 hover:bg-black shadow-md flex items-center gap-2 px-8 h-12"
                                >
                                    {passwordSaving ? <Loader2 className="animate-spin" size={20}/> : <Save size={18}/>}
                                    GANTI PASSWORD
                                </Button>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </div>
    );
};

export default FinanceSettings;
