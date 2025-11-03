
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // Pengalihan ditangani oleh router utama berdasarkan peran
      navigate('/');
    } catch (error: any) {
      setError(error.message || 'Email atau password salah.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
        className="min-h-screen bg-brand-pink-50 flex items-center justify-center p-4"
        style={{
            backgroundImage: `
                radial-gradient(circle at 1px 1px, #fecddf 1px, transparent 0),
                radial-gradient(circle at 10px 10px, #fecddf 1px, transparent 0)
            `,
            backgroundSize: '20px 20px'
        }}
    >
      <Card className="w-full max-w-sm animate-fade-in-up">
         <CardHeader>
           <div className="text-center">
                <div className="inline-block bg-brand-pink-500 p-3 rounded-2xl mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 2v20"/><path d="M12 18a4 4 0 0 0 0-12"/><path d="M12 6a4 4 0 0 1 0 12"/></svg>
                </div>
                <h1 className="text-3xl font-bold text-brand-pink-600">Login Siswa</h1>
                <p className="text-gray-500 mt-2">Masuk untuk mengakses portal MPLB Hub</p>
            </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">{error}</p>}
            <Button type="submit" className="w-full" isLoading={isLoading}>
              {isLoading ? 'Memproses...' : 'Login'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-6">
            Belum punya akun?
            <Link
              to="/register"
              className="font-semibold text-brand-pink-500 hover:underline ml-1"
            >
              Daftar disini
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

export default LoginPage;
