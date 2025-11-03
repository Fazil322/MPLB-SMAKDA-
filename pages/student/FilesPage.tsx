
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { StoredFile } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { Input } from '../../components/ui/Input';

const FileCard: React.FC<{ file: StoredFile; }> = ({ file }) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);

    useEffect(() => {
        const downloadUrl = supabase.storage.from('mplb_files').getPublicUrl(file.storage_path);
        setFileUrl(downloadUrl.data.publicUrl);
    }, [file.storage_path]);
    
    const fileIcons: { [key: string]: React.ReactElement } = {
        'image': <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>,
        'pdf': <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"/><path d="M14 2v6h6"/><path d="M2 12h2"/><path d="M2 18h2"/><path d="M7 12h3v6"/><path d="M17 12h-1a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h1"/><path d="M12 12h1a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-1"/></svg>,
        'document': <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
        'presentation': <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/></svg>,
        'other': <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
    };
    
    const getIconKey = (type: string) => {
        if (type.startsWith('image')) return 'image';
        if (type.includes('pdf')) return 'pdf';
        if (type.includes('presentation') || type.includes('powerpoint')) return 'presentation';
        if (type.includes('document') || type.includes('word')) return 'document';
        return 'other';
    }

    return (
        <Card className="flex flex-col text-center items-center p-6 space-y-4 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="p-4 bg-brand-pink-100 text-brand-pink-600 rounded-full">
                {fileIcons[getIconKey(file.file_type)]}
            </div>
            <div className="flex-grow">
                <p className="font-bold text-gray-800 break-all">{file.file_name}</p>
                <p className="text-sm text-gray-500 mt-1">{file.description || 'Klik untuk mengunduh'}</p>
            </div>
            <a href={fileUrl || '#'} download={file.file_name} target="_blank" rel="noopener noreferrer" className="w-full">
                <Button className="w-full" disabled={!fileUrl}>Download</Button>
            </a>
        </Card>
    );
};


const StudentFilesPage: React.FC = () => {
    const [files, setFiles] = useState<StoredFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState('Semua');

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
    
    const fileCategories = ['Semua', ...Array.from(new Set(files.map(f => f.category)))];
    
    const filteredFiles = files.filter(file => 
        (activeCategory === 'Semua' || file.category === activeCategory) &&
        file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800">Penyimpanan Berkas</h1>
                <p className="text-gray-500 mt-2">Unduh materi, presentasi, dan dokumen penting lainnya di sini.</p>
            </div>
            
            <div className="sticky top-0 z-10 bg-brand-pink-50/80 backdrop-blur-md py-4 px-2 rounded-xl">
                 <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-grow">
                        <Input 
                            type="text"
                            placeholder="Cari nama berkas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div className="flex space-x-2 border-b sm:border-b-0 border-gray-200 overflow-x-auto pb-2 sm:pb-0 justify-center">
                        {fileCategories.map(cat => (
                            <button key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 font-semibold capitalize transition-colors whitespace-nowrap rounded-md text-sm ${activeCategory === cat ? 'bg-brand-pink-100 text-brand-pink-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? <Spinner /> : filteredFiles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredFiles.map(file => (
                        <FileCard key={file.id} file={file} />
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                     <p className="text-gray-500">Tidak ada file yang cocok dengan kriteria Anda.</p>
                </Card>
            )}
        </div>
    );
};

export default StudentFilesPage;
