
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [fullName, setFullName] = useState(user?.app_metadata?.full_name || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingProfile(true);

        const { error } = await supabase.auth.updateUser({
            data: { full_name: fullName }
        });

        if (error) {
            toast.error(`Gagal memperbarui profil: ${error.message}`);
        } else {
            toast.success('Profil berhasil diperbarui!');
        }
        setLoadingProfile(false);
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Password tidak cocok.');
            return;
        }
        if (password.length < 6) {
             toast.error('Password harus minimal 6 karakter.');
            return;
        }

        setLoadingPassword(true);

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            toast.error(`Gagal memperbarui password: ${error.message}`);
        } else {
            toast.success('Password berhasil diubah!');
            setPassword('');
            setConfirmPassword('');
        }
        setLoadingPassword(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-gray-800">Profil Saya</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Profile Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Akun</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input type="email" value={user?.email || ''} disabled className="bg-gray-100 cursor-not-allowed" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <Input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" isLoading={loadingProfile}>
                                Simpan Perubahan
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle>Ubah Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password Baru</label>
                                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Minimal 6 karakter" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password Baru</label>
                                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                            </div>
                            <Button type="submit" className="w-full" isLoading={loadingPassword}>
                                Ubah Password
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;
