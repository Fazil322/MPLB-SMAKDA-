
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import { UserRole } from './types';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/auth/AdminLoginPage'; // <-- IMPORT BARU
import { Spinner } from './components/ui/Spinner';

// Admin Imports
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminAnnouncementsPage from './pages/admin/AnnouncementsPage';
import AdminVotingPage from './pages/admin/VotingPage';
import AdminFilesPage from './pages/admin/FilesPage';
import AdminUsersPage from './pages/admin/UsersPage';

// Student Imports
import StudentLayout from './components/student/StudentLayout';
import StudentDashboardPage from './pages/student/DashboardPage';
import StudentAnnouncementsPage from './pages/student/AnnouncementsPage';
import StudentVotingPage from './pages/student/VotingPage';
import StudentFilesPage from './pages/student/FilesPage';


interface AuthContextType {
    session: Session | null;
    user: User | null;
    userRole: UserRole;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ session: null, user: null, userRole: null, loading: true });

type AuthProviderProps = {
    children: ReactNode;
};
export function AuthProvider({ children }: AuthProviderProps) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setUserRole((session?.user?.app_metadata?.user_role as UserRole) || null);
            setLoading(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setUserRole((session?.user?.app_metadata?.user_role as UserRole) || null);
            if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED') {
                 setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, userRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    return useContext(AuthContext);
};

const RoleBasedRedirect = () => {
    const { userRole, loading } = useAuth();

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-brand-pink-50"><Spinner /></div>;
    }

    if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
    }
    if (userRole === 'student') {
        return <Navigate to="/student" replace />;
    }
    return <Navigate to="/login" replace />;
}

type ProtectedRouteProps = {
    children: React.ReactElement;
    allowedRoles: UserRole[];
};
function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { session, loading, userRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="h-screen w-screen flex items-center justify-center bg-brand-pink-50"><Spinner /></div>;
    }
    
    if (!session) {
         return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return allowedRoles.includes(userRole) ? children : <Navigate to="/login" replace />;
}

// FIX: Removed unnecessary wrapper components AdminRoute and StudentRoute and their corresponding type.
// The ProtectedRoute component will be used directly.

const App = () => {
    return (
        <AuthProvider>
            <HashRouter>
                <Routes>
                    {/* --- RUTE OTENTIKASI --- */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login-admin" element={<AdminLoginPage />} /> {/* <-- RUTE TERSEMBUNYI BARU */}
                    
                    <Route path="/" element={<RoleBasedRedirect />} />

                    {/* --- RUTE ADMIN --- */}
                    <Route
                        path="/admin/*"
                        element={
                            // FIX: Replaced AdminRoute with a direct implementation of ProtectedRoute.
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminLayout>
                                    <Routes>
                                        <Route path="/" element={<AdminDashboardPage />} />
                                        <Route path="/dashboard" element={<AdminDashboardPage />} />
                                        <Route path="/announcements" element={<AdminAnnouncementsPage />} />
                                        <Route path="/voting" element={<AdminVotingPage />} />
                                        <Route path="/files" element={<AdminFilesPage />} />
                                        <Route path="/users" element={<AdminUsersPage />} />
                                        <Route path="/profile" element={<ProfilePage />} />
                                        <Route path="*" element={<Navigate to="/admin" />} />
                                    </Routes>
                                </AdminLayout>
                            </ProtectedRoute>
                        }
                    />

                    {/* --- RUTE SISWA --- */}
                    <Route
                        path="/student/*"
                        element={
                            // FIX: Replaced StudentRoute with a direct implementation of ProtectedRoute.
                            <ProtectedRoute allowedRoles={['student']}>
                                <StudentLayout>
                                    <Routes>
                                        <Route path="/" element={<StudentDashboardPage />} />
                                        <Route path="/dashboard" element={<StudentDashboardPage />} />
                                        <Route path="/announcements" element={<StudentAnnouncementsPage />} />
                                        <Route path="/voting" element={<StudentVotingPage />} />
                                        <Route path="/files" element={<StudentFilesPage />} />
                                        <Route path="/profile" element={<ProfilePage />} />
                                        <Route path="*" element={<Navigate to="/student" />} />
                                    </Routes>
                                </StudentLayout>
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;
