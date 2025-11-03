import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Announcement, Poll } from '../../types';

const StudentDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);

    const userName = user?.app_metadata?.full_name?.split(' ')[0] || 'Siswa';

    const fetchData = useCallback(async () => {
        setLoading(true);
        // Fetch latest 3 announcements
        const { data: annData, error: annError } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);
        if (annError) console.error(annError);
        else setAnnouncements(annData);

        // Fetch active polls
        const { data: pollData, error: pollError } = await supabase
            .from('polls')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (pollError) console.error(pollError);
        else setPolls(pollData);

        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-8">
            <div>
                 <h1 className="text-4xl font-bold text-gray-800">Hai, {userName}! 👋</h1>
                 <p className="text-gray-500 mt-2 text-lg">Selamat datang di MPLB Hub, ini informasi terbaru untukmu.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Announcements Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Pengumuman Terbaru</h2>
                        <Link to="/student/announcements" className="text-brand-pink-500 font-semibold hover:underline">
                            Lihat Semua
                        </Link>
                    </div>

                    {loading ? <Spinner /> : announcements.length > 0 ? (
                        <div className="space-y-4">
                            {announcements.map(ann => (
                                <Card key={ann.id} className="transition-all hover:shadow-lg">
                                    <CardHeader>
                                        <CardTitle>{ann.title}</CardTitle>
                                        <p className="text-sm text-gray-400 pt-1">{new Date(ann.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 line-clamp-2">{ann.content}</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-10">
                            <p className="text-gray-500">Tidak ada pengumuman baru saat ini.</p>
                        </Card>
                    )}
                </div>

                {/* Voting Section */}
                <div className="space-y-6">
                     <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-800">Voting Aktif</h2>
                        <Link to="/student/voting" className="text-brand-pink-500 font-semibold hover:underline">
                            Lihat Semua
                        </Link>
                    </div>
                     {loading ? <Spinner /> : polls.length > 0 ? (
                        <div className="space-y-4">
                            {polls.map(poll => (
                                <Card key={poll.id} className="bg-gradient-to-br from-brand-pink-400 to-fuchsia-400 text-white">
                                    <CardContent className="pt-6">
                                        <p className="font-semibold">{poll.question}</p>
                                        <Link to="/student/voting">
                                            <button className="mt-4 w-full bg-white/30 text-white font-bold py-2 px-4 rounded-lg hover:bg-white/40 transition-colors">
                                                Ikut Voting
                                            </button>
                                        </Link>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="text-center py-10">
                            <p className="text-gray-500">Tidak ada voting yang aktif.</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardPage;
