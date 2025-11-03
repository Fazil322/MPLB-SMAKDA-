import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAuth } from '../../App';

const icons = {
  announcement: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>,
  vote: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>,
  files: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
};


const AdminDashboardPage: React.FC = () => {
    const { user } = useAuth();
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to="/admin/announcements">
                    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        <CardHeader>
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-brand-pink-100 rounded-lg text-brand-pink-600">{icons.announcement}</div>
                                <CardTitle>Pengumuman</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">Buat, edit, dan kelola pengumuman untuk siswa dan guru.</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/admin/voting">
                    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        <CardHeader>
                             <div className="flex items-center space-x-4">
                                <div className="p-3 bg-brand-pink-100 rounded-lg text-brand-pink-600">{icons.vote}</div>
                                <CardTitle>Sistem Voting</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">Adakan pemilihan atau polling secara online dan lihat hasilnya.</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link to="/admin/files">
                    <Card className="hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                        <CardHeader>
                             <div className="flex items-center space-x-4">
                                <div className="p-3 bg-brand-pink-100 rounded-lg text-brand-pink-600">{icons.files}</div>
                                <CardTitle>Penyimpanan Berkas</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">Unggah dan bagikan dokumen, presentasi, dan berkas penting lainnya.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
