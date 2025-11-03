import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../services/supabase';
import { ManagedUser } from '../../types';
import { useAuth } from '../../App';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';

const AdminUsersPage: React.FC = () => {
    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_all_users');
        if (error) {
            console.error('Error fetching users:', error);
            alert(`Gagal memuat pengguna: ${error.message}`);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (targetUserId: string, newRole: 'admin' | 'student') => {
        setActionLoading(prev => ({ ...prev, [targetUserId]: true }));
        const { error } = await supabase.rpc('update_user_role', { target_user_id: targetUserId, new_role: newRole });
        if (error) {
            console.error('Error updating role:', error);
            alert(`Gagal mengubah peran: ${error.message}`);
        } else {
            alert('Peran pengguna berhasil diubah.');
            fetchUsers();
        }
        setActionLoading(prev => ({ ...prev, [targetUserId]: false }));
    };
    
    const handleDeleteUser = async (targetUserId: string) => {
        if (window.confirm('PERINGATAN: Anda akan menghapus pengguna ini secara permanen. Aksi ini tidak dapat dibatalkan. Lanjutkan?')) {
            setActionLoading(prev => ({ ...prev, [targetUserId]: true }));
            const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: targetUserId });
            if (error) {
                console.error('Error deleting user:', error);
                alert(`Gagal menghapus pengguna: ${error.message}`);
            } else {
                alert('Pengguna berhasil dihapus.');
                fetchUsers();
            }
            setActionLoading(prev => ({ ...prev, [targetUserId]: false }));
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Manajemen Pengguna</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna Terdaftar</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? <Spinner /> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peran</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal Daftar</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.full_name || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.user_role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {u.user_role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                {u.id !== adminUser?.id ? (
                                                    <>
                                                        {u.user_role === 'student' ? (
                                                            <Button size="sm" variant="secondary" onClick={() => handleRoleChange(u.id, 'admin')} isLoading={actionLoading[u.id]}>Jadikan Admin</Button>
                                                        ) : (
                                                            <Button size="sm" variant="secondary" onClick={() => handleRoleChange(u.id, 'student')} isLoading={actionLoading[u.id]}>Jadikan Siswa</Button>
                                                        )}
                                                        <Button size="sm" variant="danger" onClick={() => handleDeleteUser(u.id)} isLoading={actionLoading[u.id]}>Hapus</Button>
                                                    </>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Ini Anda</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUsersPage;
