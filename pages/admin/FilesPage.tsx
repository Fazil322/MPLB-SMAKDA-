import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { StoredFile } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Spinner } from '../../components/ui/Spinner';

const FileCard: React.FC<{ file: StoredFile; onDelete: (file: StoredFile) => void; }> = ({ file, onDelete }) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        const downloadUrl = supabase.storage.from('mplb_files').getPublicUrl(file.storage_path);
        setFileUrl(downloadUrl.data.publicUrl);
    }, [file.storage_path]);
    
    const fileIcons: { [key: string]: React.ReactElement } = {
        'image': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
        'pdf': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M2 12h2"/><path d="M2 18h2"/><path d="M7 12h3v6"/><path d="M17 12h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1"/><path d="M12 12h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1"/></svg>,
        'document': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
        'presentation': <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>,
    };
    
    const getIconKey = (type: string) => {
        if (type.startsWith('image')) return 'image';
        if (type.includes('pdf')) return 'pdf';
        if (type.includes('presentation') || type.includes('powerpoint')) return 'presentation';
        return 'document';
    }

    return (
        <Card className="flex flex-col">
            <CardHeader>
                <div className="flex items-start space-x-4">
                    <div className="text-brand-pink-500">{fileIcons[getIconKey(file.file_type)]}</div>
                    <div>
                        <CardTitle className="text-base leading-tight break-all">{file.file_name}</CardTitle>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full mt-2 inline-block bg-brand-pink-100 text-brand-pink-700 capitalize">{file.category}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                <p className="text-sm text-gray-600">{file.description || 'Tidak ada deskripsi.'}</p>
            </CardContent>
            <div className="p-4 pt-0 mt-auto flex space-x-2">
                <a href={fileUrl || '#'} download={file.file_name} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full" disabled={!fileUrl}>Download</Button>
                </a>
                <Button variant="danger" onClick={() => onDelete(file)}>Hapus</Button>
            </div>
        </Card>
    );
};


const AdminFilesPage: React.FC = () => {
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    
    const [newFile, setNewFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('document');

    const fetchFiles = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('files').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching files:', error);
        else setFiles(data || []);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [fetchFiles]);
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewFile(e.target.files[0]);
        }
    };
    
    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFile) return;

        setUploading(true);
        const filePath = `public/${Date.now()}_${newFile.name}`;

        const { error: uploadError } = await supabase.storage
            .from('mplb_files')
            .upload(filePath, newFile);

        if (uploadError) {
            console.error('Error uploading file:', uploadError);
            alert('Gagal mengunggah file.');
            setUploading(false);
            return;
        }

        const { error: insertError } = await supabase.from('files').insert({
            file_name: newFile.name,
            storage_path: filePath,
            description,
            category,
            file_type: newFile.type
        });

        if (insertError) {
            console.error('Error inserting file record:', insertError);
        }

        setUploading(false);
        setIsModalOpen(false);
        setNewFile(null);
        setDescription('');
        setCategory('document');
        fetchFiles();
    };
    
    const handleDelete = async (file: StoredFile) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus file ini?')) {
            const { error: storageError } = await supabase.storage.from('mplb_files').remove([file.storage_path]);
            if (storageError) console.error('Error deleting from storage:', storageError);

            const { error: dbError } = await supabase.from('files').delete().eq('id', file.id);
            if (dbError) console.error('Error deleting from db:', dbError);
            else fetchFiles();
        }
    };

    const fileCategories = ['Semua', ...Array.from(new Set(files.map(f => f.category)))];
    const [activeCategory, setActiveCategory] = useState('Semua');
    const filteredFiles = activeCategory === 'Semua' ? files : files.filter(f => f.category === activeCategory);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Penyimpanan Berkas</h1>
                <Button onClick={() => setIsModalOpen(true)}>+ Unggah File Baru</Button>
            </div>
            
             <div className="flex space-x-2 border-b border-gray-200 overflow-x-auto pb-2">
                {fileCategories.map(cat => (
                    <button key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 font-semibold capitalize transition-colors whitespace-nowrap rounded-md ${activeCategory === cat ? 'bg-brand-pink-100 text-brand-pink-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? <Spinner /> : filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredFiles.map(file => (
                        <FileCard key={file.id} file={file} onDelete={handleDelete} />
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                     <p className="text-gray-500">Tidak ada file dalam kategori ini.</p>
                </Card>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Unggah File Baru">
                 <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pilih File</label>
                        <Input type="file" onChange={handleFileChange} required className="p-0 border-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-brand-pink-100 file:text-brand-pink-700 hover:file:bg-brand-pink-200" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi (Opsional)</label>
                        <Input value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2 border border-brand-pink-200 rounded-lg focus:ring-2 focus:ring-brand-pink-500 focus:border-brand-pink-500 outline-none">
                            <option value="document">Dokumen</option>
                            <option value="presentation">Presentasi</option>
                            <option value="image">Gambar</option>
                            <option value="other">Lainnya</option>
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2">
                         <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                         <Button type="submit" isLoading={uploading}>{uploading ? 'Mengunggah...' : 'Unggah'}</Button>
                    </div>
                 </form>
            </Modal>
        </div>
    );
};

export default AdminFilesPage;
