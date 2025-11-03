
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { Announcement } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input, TextArea } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const PinIcon: React.FC<{isPinned: boolean}> = ({ isPinned }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
    </svg>
);


const AnnouncementCard: React.FC<{ announcement: Announcement; onDelete: (id: string) => void; onEdit: (announcement: Announcement) => void; onTogglePin: (announcement: Announcement) => void; }> = ({ announcement, onDelete, onEdit, onTogglePin }) => {
    return (
        <Card className={`${announcement.is_pinned ? 'bg-brand-pink-50 border-brand-pink-200' : ''}`}>
            <CardHeader className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2">
                        {announcement.is_pinned && <span className="text-brand-pink-500" title="Disematkan"><PinIcon isPinned={true} /></span>}
                        <CardTitle>{announcement.title}</CardTitle>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Diposting pada {new Date(announcement.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex space-x-2 items-center">
                    <button onClick={() => onTogglePin(announcement)} className={`p-1 rounded-full ${announcement.is_pinned ? 'text-brand-pink-600' : 'text-gray-400'} hover:bg-brand-pink-100 transition-colors`} title={announcement.is_pinned ? 'Lepas Sematan' : 'Sematkan'}>
                        <PinIcon isPinned={announcement.is_pinned} />
                    </button>
                    <button onClick={() => onEdit(announcement)} className="text-blue-500 hover:text-blue-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button onClick={() => onDelete(announcement.id)} className="text-red-500 hover:text-red-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
            </CardContent>
        </Card>
    );
};

const AdminAnnouncementsPage: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement>>({});

    const fetchAnnouncements = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('announcements').select('*').order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching announcements:', error.message);
            toast.error("Gagal memuat pengumuman.");
        } else {
            setAnnouncements(data);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchAnnouncements();
    }, [fetchAnnouncements]);

    const handleOpenModal = (announcement: Announcement | null = null) => {
        if (announcement) {
            setIsEditing(true);
            setCurrentAnnouncement(announcement);
        } else {
            setIsEditing(false);
            setCurrentAnnouncement({});
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentAnnouncement({});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const { title, content } = currentAnnouncement;
        const promise = isEditing 
            ? supabase.from('announcements').update({ title, content }).eq('id', currentAnnouncement.id)
            : supabase.from('announcements').insert([{ title, content }]);
            
        toast.promise(promise, {
            loading: 'Menyimpan...',
            success: () => {
                fetchAnnouncements();
                handleCloseModal();
                return `Pengumuman berhasil ${isEditing ? 'diperbarui' : 'diterbitkan'}!`;
            },
            error: `Gagal ${isEditing ? 'memperbarui' : 'menerbitkan'} pengumuman.`
        });
    };
    
    const handleTogglePin = async (announcement: Announcement) => {
        const promise = supabase.from('announcements').update({ is_pinned: !announcement.is_pinned }).eq('id', announcement.id);
        toast.promise(promise, {
            loading: 'Memperbarui status...',
            success: () => {
                fetchAnnouncements();
                return `Pengumuman berhasil ${!announcement.is_pinned ? 'disematkan' : 'dilepas'}.`;
            },
            error: 'Gagal mengubah status sematan.'
        });
    }

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
            const promise = supabase.from('announcements').delete().eq('id', id);
            toast.promise(promise, {
                loading: 'Menghapus...',
                success: () => {
                    fetchAnnouncements();
                    return 'Pengumuman berhasil dihapus.';
                },
                error: 'Gagal menghapus pengumuman.'
            });
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengumuman</h1>
                <Button onClick={() => handleOpenModal()}>+ Buat Pengumuman Baru</Button>
            </div>
            
            {loading ? <Spinner /> : (
                announcements.length > 0 ? (
                    <div className="space-y-4">
                        {announcements.map(ann => (
                            <AnnouncementCard key={ann.id} announcement={ann} onDelete={handleDelete} onEdit={handleOpenModal} onTogglePin={handleTogglePin} />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12 flex flex-col items-center justify-center">
                         <div className="p-4 bg-brand-pink-100 text-brand-pink-600 rounded-full mb-4">
                             <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                         </div>
                        <h3 className="text-xl font-bold text-gray-700">Belum Ada Pengumuman</h3>
                        <p className="text-gray-500 mt-2">Buat pengumuman pertama Anda untuk dibagikan kepada siswa.</p>
                        <Button onClick={() => handleOpenModal()} className="mt-4">+ Buat Pengumuman</Button>
                    </Card>
                )
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isEditing ? 'Edit Pengumuman' : 'Buat Pengumuman Baru'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Judul</label>
                        <Input 
                            id="title"
                            value={currentAnnouncement.title || ''}
                            onChange={e => setCurrentAnnouncement({...currentAnnouncement, title: e.target.value})}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Isi Pengumuman</label>
                        <TextArea 
                            id="content"
                            rows={5}
                            value={currentAnnouncement.content || ''}
                            onChange={e => setCurrentAnnouncement({...currentAnnouncement, content: e.target.value})}
                            required
                        />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={handleCloseModal}>Batal</Button>
                        <Button type="submit">{isEditing ? 'Simpan Perubahan' : 'Terbitkan'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminAnnouncementsPage;
