import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
// FIX: Add Outlet to react-router-dom import for layout routes.
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from './services/supabase';
import { UserRole } from './types';
import { Toaster } from 'react-hot-toast';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/auth/AdminLoginPage';
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

// FIX: Make children optional to resolve type errors where the compiler doesn't recognize JSX children.
export function AuthProvider({ children }: { children?: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            const currentUser = session?.user;
            setUser(currentUser ?? null);
            setUserRole((currentUser?.app_metadata?.user_role as UserRole) || 'student');
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ session, user, userRole, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

const FullScreenSpinner = () => (
    <div className="h-screen w-screen flex items-center justify-center bg-brand-pink-50">
        <Spinner />
    </div>
);

// Component untuk mengalihkan pengguna berdasarkan peran mereka saat mengunjungi rute root
const RoleBasedRedirect = () => {
    const { userRole, loading } = useAuth();

    if (loading) {
        return <FullScreenSpinner />;
    }

    if (userRole === 'admin') {
        return <Navigate to="/admin" replace />;
    }
    // Secara default, arahkan ke siswa, atau jika tidak ada peran, akan ditangani oleh ProtectedRoute
    return <Navigate to="/student" replace />;
}

// Melindungi rute yang memerlukan otentikasi
// FIX: Make children optional to resolve type errors where the compiler doesn't recognize JSX children.
type ProtectedRouteProps = {
    children?: React.ReactElement;
    allowedRoles: UserRole[];
};
function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { session, loading, userRole } = useAuth();
    const location = useLocation();

    if (loading) {
        return <FullScreenSpinner />;
    }
    
    if (!session) {
         return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        // Jika pengguna mencoba mengakses rute yang tidak sah, arahkan mereka
        return <Navigate to="/" replace />;
    }

    // FIX: Return children or null since it's now optional.
    return children ?? null;
}

// Melindungi rute publik (misalnya, /login) dari pengguna yang sudah masuk
// FIX: Make children optional to resolve type errors where the compiler doesn't recognize JSX children.
const PublicRoute = ({ children }: { children?: React.ReactElement }) => {
    const { session, loading } = useAuth();
    if (loading) {
        // FIX: Corrected typo from FullScreenScreenSpinner to FullScreenSpinner.
        return <FullScreenSpinner />;
    }
    // FIX: Return children or null since it's now optional.
    return session ? <Navigate to="/" replace /> : (children ?? null);
};

// FIX: Create wrapper components for Admin and Student layouts to use with React Router v6 Outlet.
const AdminLayoutWrapper = () => (
    <ProtectedRoute allowedRoles={['admin']}>
        <AdminLayout>
            <Outlet />
        </AdminLayout>
    </ProtectedRoute>
);

const StudentLayoutWrapper = () => (
    <ProtectedRoute allowedRoles={['student']}>
        <StudentLayout>
            <Outlet />
        </StudentLayout>
    </ProtectedRoute>
);


const App = () => {
    return (
        <AuthProvider>
            <Toaster position="top-center" reverseOrder={false} />
            <HashRouter>
                <Routes>
                    {/* --- RUTE PUBLIK (Hanya dapat diakses saat logout) --- */}
                    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
                    <Route path="/login-admin" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />
                    
                    {/* --- Pengalihan Root --- */}
                    <Route path="/" element={<RoleBasedRedirect />} />

                    {/* --- RUTE ADMIN --- */}
                    {/* FIX: Refactored admin routes to use a layout route, which is the correct pattern for React Router v6. */}
                    <Route path="/admin" element={<AdminLayoutWrapper />}>
                        <Route index element={<AdminDashboardPage />} />
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="announcements" element={<AdminAnnouncementsPage />} />
                        <Route path="voting" element={<AdminVotingPage />} />
                        <Route path="files" element={<AdminFilesPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                    </Route>

                    {/* --- RUTE SISWA --- */}
                    {/* FIX: Refactored student routes to use a layout route, which is the correct pattern for React Router v6. */}
                    <Route path="/student" element={<StudentLayoutWrapper />}>
                        <Route index element={<StudentDashboardPage />} />
                        <Route path="dashboard" element={<StudentDashboardPage />} />
                        <Route path="announcements" element={<StudentAnnouncementsPage />} />
                        <Route path="voting" element={<StudentVotingPage />} />
                        <Route path="files" element={<StudentFilesPage />} />
                        <Route path="profile" element={<ProfilePage />} />
                        <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
                    </Route>

                     {/* Fallback untuk rute yang tidak cocok */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;