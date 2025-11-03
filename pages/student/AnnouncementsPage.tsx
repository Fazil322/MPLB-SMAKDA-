
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Announcement } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

const PinIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
);


const StudentAnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('announcements').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching announcements:', error);
        } else {
            setAnnouncements(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">Semua Pengumuman</h1>
                <p className="text-gray-500 mt-2">Tetap terinformasi dengan berita terbaru dari jurusan.</p>
            </div>
            
            {loading ? <Spinner /> : (
                announcements.length > 0 ? (
                    <div className="space-y-4">
                        {announcements.map(ann => (
                           <Card key={ann.id} className={`${ann.is_pinned ? 'bg-brand-pink-50 border-brand-pink-200' : ''}`}>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        {ann.is_pinned && <span className="text-brand-pink-500" title="Disematkan"><PinIcon /></span>}
                                        <CardTitle>{ann.title}</CardTitle>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Diposting pada {new Date(ann.created_at).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-700 whitespace-pre-wrap">{ann.content}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                     <Card className="text-center py-12 flex flex-col items-center justify-center">
                         <div className="p-4 bg-brand-pink-100 text-brand-pink-600 rounded-full mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                         </div>
                        <h3 className="text-xl font-bold text-gray-700">Belum Ada Pengumuman</h3>
                        <p className="text-gray-500 mt-2">Tidak ada pengumuman yang dipublikasikan saat ini. Cek kembali nanti!</p>
                    </Card>
                )
            )}
        </div>
    );
};

export default StudentAnnouncementsPage;
