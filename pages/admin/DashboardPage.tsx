

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../App';
import { supabase } from '../../services/supabase';
import { Announcement, DashboardStats, StoredFile } from '../../types';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; link: string; }> = ({ icon, title, value, link }) => (
    <Link to={link} className="block">
        <Card className="hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <CardContent className="pt-6 flex items-center space-x-4">
                <div className="p-4 bg-gradient-to-br from-brand-pink-100 to-fuchsia-100 rounded-xl text-brand-pink-600 shadow-md">{icon}</div>
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                </div>
            </CardContent>
        </Card>
    </Link>
);


const icons = {
  users: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  vote: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>,
  files: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  announcement: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>,
};


const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
    const [recentFiles, setRecentFiles] = useState<StoredFile[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const [statsRes, annRes, filesRes] = await Promise.all([
            supabase.rpc('get_dashboard_stats'),
            supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(3),
            supabase.from('files').select('*').order('created_at', { ascending: false }).limit(3)
        ]);

        if (statsRes.error) {
            console.error("Failed to fetch dashboard stats:", statsRes.error.message);
            if (statsRes.error.message.includes('Could not find the function')) {
                toast.error("Gagal memuat statistik: Fungsi 'get_dashboard_stats' tidak ditemukan. Pastikan Anda telah menjalankan skrip SQL dari file 'services/supabase.ts' (Bagian 8).", { duration: 8000 });
            } else {
                toast.error(`Gagal memuat statistik: ${statsRes.error.message}`);
            }
        }
        else setStats(statsRes.data);
        
        if (annRes.error) console.error("Failed to fetch announcements:", annRes.error.message);
        else setRecentAnnouncements(annRes.data);

        if (filesRes.error) console.error("Failed to fetch files:", filesRes.error.message);
        else setRecentFiles(filesRes.data);

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const userEmail = user?.email;

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-brand-pink-500 via-fuchsia-500 to-purple-500 text-white shadow-2xl">
                <CardContent className="pt-6">
                    <h1 className="text-3xl font-bold">Selamat Datang, Admin! 👨‍💼</h1>
                    <p className="mt-2 text-pink-50">Anda masuk sebagai {userEmail}</p>
                    <p className="mt-1 text-pink-50">Kelola semua kebutuhan jurusan MPLB dari sini.</p>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold text-gray-800">Tinjauan Sistem</h2>
            {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard icon={icons.users} title="Total Pengguna" value={stats?.total_users ?? 0} link="/admin/users" />
                    <StatCard icon={icons.vote} title="Polling Aktif" value={stats?.active_polls ?? 0} link="/admin/voting" />
                    <StatCard icon={icons.files} title="Total Berkas" value={stats?.total_files ?? 0} link="/admin/files" />
                </div>
            )}
            
            <Card>
                <CardHeader>
                    <CardTitle>Aktivitas Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <div className="flex justify-center py-8"><Spinner /></div> : (
                        <div className="space-y-4">
                            {(recentAnnouncements.length === 0 && recentFiles.length === 0) ? (
                                <p className="text-gray-500 text-center py-4">Tidak ada aktivitas terbaru.</p>
                            ) : (
                                <>
                                    {recentAnnouncements.map(ann => (
                                        <div key={`ann-${ann.id}`} className="flex items-center space-x-3 text-sm">
                                            <span className="flex-shrink-0 text-yellow-500">{icons.announcement}</span>
                                            <p className="text-gray-600">
                                                Pengumuman baru: <span className="font-semibold text-gray-800">{ann.title}</span>
                                            </p>
                                            <Link to="/admin/announcements" className="ml-auto text-brand-pink-500 hover:underline text-xs font-semibold">Lihat</Link>
                                        </div>
                                    ))}
                                    {recentFiles.map(file => (
                                        <div key={`file-${file.id}`} className="flex items-center space-x-3 text-sm">
                                            <span className="flex-shrink-0 text-blue-500">{icons.files}</span>
                                            <p className="text-gray-600 truncate">
                                                Berkas diunggah: <span className="font-semibold text-gray-800">{file.file_name}</span>
                                            </p>
                                             <Link to="/admin/files" className="ml-auto text-brand-pink-500 hover:underline text-xs font-semibold">Lihat</Link>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminDashboardPage;
