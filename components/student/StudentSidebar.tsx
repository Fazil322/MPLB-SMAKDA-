import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../App';

const NavItem: React.FC<{ to: string; icon: React.ReactElement; label: string; onClick?: () => void }> = ({ to, icon, label, onClick }) => (
    <NavLink
        to={`/student${to === '/' ? '' : to}`}
        onClick={onClick}
        end
        className={({ isActive }) =>
            `flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                isActive
                    ? 'bg-brand-pink-500 text-white shadow-lg shadow-brand-pink-500/30'
                    : 'text-gray-600 hover:bg-brand-pink-100 hover:text-brand-pink-700'
            }`
        }
    >
        {icon}
        <span className="font-semibold">{label}</span>
    </NavLink>
);

const icons = {
  home: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  announcement: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>,
  vote: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="m9 16 2 2 4-4"/></svg>,
  files: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>,
  profile: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  close: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
}

const StudentSidebar: React.FC<{ sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }> = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const userName = user?.app_metadata?.full_name || 'Siswa';

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: icons.home, label: 'Dashboard' },
        { to: '/announcements', icon: icons.announcement, label: 'Pengumuman' },
        { to: '/voting', icon: icons.vote, label: 'Voting' },
        { to: '/files', icon: icons.files, label: 'Penyimpanan Berkas' },
    ];
    
    const sidebarContent = (
      <div className="flex flex-col h-full bg-white p-4">
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-2">
                <div className="bg-brand-pink-500 p-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 2v20"/><path d="M12 18a4 4 0 0 0 0-12"/><path d="M12 6a4 4 0 0 1 0 12"/></svg>
                </div>
                <h1 className="text-2xl font-bold text-brand-pink-600">MPLB Hub</h1>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-brand-pink-600">
                {icons.close}
            </button>
        </div>

        <nav className="flex-1 space-y-2">
            {navItems.map(item => <NavItem key={item.to} {...item} onClick={() => setSidebarOpen(false)} />)}
        </nav>

        <div className="mt-auto space-y-2">
            <div className="text-center mb-2 p-3 bg-brand-pink-50 rounded-lg">
                <p className="text-sm font-bold text-brand-pink-800 truncate">{userName}</p>
                 <NavLink to="/student/profile" onClick={() => setSidebarOpen(false)} className="text-xs text-brand-pink-600 hover:underline">Lihat Profil</NavLink>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-700 w-full transition-colors duration-200"
            >
                {icons.logout}
                <span className="font-semibold">Logout</span>
            </button>
        </div>
    </div>
    )

    return (
      <>
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 bg-black bg-opacity-30 z-40 lg:hidden transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}></div>
        <div className={`fixed inset-y-0 left-0 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out z-50`}>
          {sidebarContent}
        </div>
        
        {/* Desktop sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="h-full">
            {sidebarContent}
          </div>
        </div>
      </>
    );
};

export default StudentSidebar;