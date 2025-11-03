import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { useAuth } from '../../App';
import { Spinner } from '../../components/ui/Spinner';

const AdminLoginPage: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (code !== 'MPLB') {
        setError('Kode akses admin salah.');
        setIsLoading(false);
        return;
    }

    try {
      const adminEmail = 'admin.mplbhub@smklppmri2.sch.id';
      const adminPassword = 'password-mplb-aman';

      const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: adminEmail, 
          password: adminPassword 
        });
      
      if (signInError) {
          throw new Error('Gagal mengotentikasi akun admin. Pastikan akun sudah dibuat.');
      }

      navigate('/', { replace: true });

    } catch (error: any) {
      setError(error.message || 'Terjadi kesalahan saat login.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (authLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-100"><Spinner /></div>;
  }

  return (
    <div 
        className="min-h-screen bg-slate-100 flex items-center justify-center p-4"
        style={{
            backgroundImage: `
                radial-gradient(circle at 1px 1px, #e2e8f0 1px, transparent 0),
                radial-gradient(circle at 10px 10px, #e2e8f0 1px, transparent 0)
            `,
            backgroundSize: '20px 20px'
        }}
    >
      <Card className="w-full max-w-sm animate-fade-in-up">
         <CardHeader>
           <div className="text-center">
                <div className="inline-block bg-brand-pink-500 p-3 rounded-2xl mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><shield-check stroke-width="2.5" /><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h1 className="text-3xl font-bold text-brand-pink-600">Portal Admin</h1>
                <p className="text-gray-500 mt-2">Masukkan kode akses untuk melanjutkan</p>
            </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input
              type="password"
              placeholder="Kode Akses Admin"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
            />
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLoading ? 'Memvalidasi...' : 'Login Admin'}
            </Button>
          </form>
           <p className="text-center text-xs text-gray-400 mt-4">
            <Link
              to="/login"
              className="hover:underline"
            >
              Masuk sebagai Siswa
            </Link>
          </p>
        </CardContent>
      </Card>
       <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default AdminLoginPage;