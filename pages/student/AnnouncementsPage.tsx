import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Announcement } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';

const StudentAnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
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
                           <Card key={ann.id}>
                                <CardHeader>
                                    <CardTitle>{ann.title}</CardTitle>
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
                    <Card className="text-center py-12">
                        <p className="text-gray-500">Belum ada pengumuman yang dipublikasikan.</p>
                    </Card>
                )
            )}
        </div>
    );
};

export default StudentAnnouncementsPage;
