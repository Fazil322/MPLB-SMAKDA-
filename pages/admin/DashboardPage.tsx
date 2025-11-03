
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../App';
import { supabase } from '../../services/supabase';
import { DashboardStats } from '../../types';
import { Spinner } from '../../components/ui/Spinner';

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string; link: string; }> = ({ icon, title, value, link }) => (
    <Link to={link}>
        <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <CardContent className="pt-6 flex items-center space-x-4">
                <div className="p-3 bg-brand-pink-100 rounded-lg text-brand-pink-600">{icon}</div>
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
};


const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_dashboard_stats');
            if (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } else {
                setStats(data);
            }
            setLoading(false);
        };
        fetchStats();
    }, []);

    const userEmail = user?.email;

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-brand-pink-500 to-fuchsia-500 text-white">
                <CardContent className="pt-6">
                    <h1 className="text-3xl font-bold">Selamat Datang, Admin!</h1>
                    <p className="mt-2 text-pink-100">Anda masuk sebagai {userEmail}</p>
                    <p className="mt-1 text-pink-100">Kelola semua kebutuhan jurusan MPLB dari sini.</p>
                </CardContent>
            </Card>

            <h2 className="text-2xl font-bold text-gray-800">Tinjauan Sistem</h2>
            {loading ? <Spinner /> : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <StatCard icon={icons.users} title="Total Pengguna" value={stats?.total_users ?? 0} link="/admin/users" />
                    <StatCard icon={icons.vote} title="Polling Aktif" value={stats?.active_polls ?? 0} link="/admin/voting" />
                    <StatCard icon={icons.files} title="Total Berkas" value={stats?.total_files ?? 0} link="/admin/files" />
                </div>
            )}
        </div>
    );
};

export default AdminDashboardPage;
