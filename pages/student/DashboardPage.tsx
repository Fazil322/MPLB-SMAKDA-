

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { Announcement, Poll, StoredFile } from '../../types';
import { Button } from '../../components/ui/Button';

const QuickFile: React.FC<{ file: StoredFile }> = ({ file }) => {
    const fileUrl = supabase.storage.from('mplb_files').getPublicUrl(file.storage_path).data.publicUrl;
    return (
        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-brand-pink-50 to-fuchsia-50 rounded-lg hover:shadow-md transition-all duration-300 border border-brand-pink-100">
            <div className="truncate flex items-center space-x-3">
                <div className="w-10 h-10 bg-brand-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"/></svg>
                </div>
                <div>
                    <p className="font-semibold text-sm text-brand-pink-800 truncate">{file.file_name}</p>
                    <p className="text-xs text-brand-pink-600 capitalize">{file.category}</p>
                </div>
            </div>
            <a href={fileUrl} download={file.file_name} target="_blank" rel="noopener noreferrer">
                <Button size="sm">Unduh</Button>
            </a>
        </div>
    );
};


const StudentDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [latestFiles, setLatestFiles] = useState<StoredFile[]>([]);
    const [loading, setLoading] = useState(true);

    const userName = user?.app_metadata?.full_name?.split(' ')[0] || 'Siswa';

    const fetchData = useCallback(async () => {
        setLoading(true);
        // Fetch latest 3 announcements
        const { data: annData, error: annError } = await supabase
            .from('announcements')
            .select('*')
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false })
            .limit(3);
        if (annError) console.error("Error fetching announcements:", annError.message);
        else setAnnouncements(annData);

        // Fetch active polls
        const { data: pollData, error: pollError } = await supabase
            .from('polls')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        if (pollError) console.error("Error fetching polls:", pollError.message);
        else setPolls(pollData);

        // Fetch latest 3 files
        const { data: filesData, error: filesError } = await supabase
            .from('files')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);
        if (filesError) console.error("Error fetching files:", filesError.message);
        else setLatestFiles(filesData);


        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-brand-pink-500 to-fuchsia-500 rounded-2xl p-8 text-white shadow-xl">
                 <h1 className="text-4xl font-bold">Hai, {userName}! 👋</h1>
                 <p className="mt-2 text-lg text-brand-pink-50">Selamat datang di MPLB Hub, ini informasi terbaru untukmu.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Announcements and Polls */}
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
                                <Card key={ann.id} className={`transition-all hover:shadow-2xl transform hover:-translate-y-1 ${ann.is_pinned ? 'bg-gradient-to-br from-brand-pink-50 to-fuchsia-50 border-2 border-brand-pink-200' : ''}`}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <CardTitle className="flex-1">{ann.title}</CardTitle>
                                            {ann.is_pinned && <span className="px-3 py-1 bg-brand-pink-500 text-white text-xs rounded-full font-semibold">Penting</span>}
                                        </div>
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

                {/* Sidebar Content: Voting and Quick Files */}
                <div className="space-y-8">
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Voting Aktif</h2>
                        {loading ? <Spinner /> : polls.length > 0 ? (
                            <div className="space-y-4">
                                {polls.map(poll => (
                                    <Card key={poll.id} className="bg-gradient-to-br from-brand-pink-500 via-brand-pink-400 to-fuchsia-500 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                                        <CardContent className="pt-6">
                                            <div className="flex items-start">
                                                <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>
                                                <p className="font-semibold text-lg">{poll.question}</p>
                                            </div>
                                            <Link to="/student/voting">
                                                <button className="mt-4 w-full bg-white text-brand-pink-600 font-bold py-3 px-4 rounded-lg hover:bg-brand-pink-50 transition-all duration-300 shadow-lg">
                                                    Ikut Voting Sekarang
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
                     <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800">Akses Cepat Berkas</h2>
                         {loading ? <Spinner /> : latestFiles.length > 0 ? (
                            <Card>
                                <CardContent className="p-3 space-y-2">
                                    {latestFiles.map(file => <QuickFile key={file.id} file={file} />)}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="text-center py-10">
                                <p className="text-gray-500">Belum ada berkas baru.</p>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboardPage;
