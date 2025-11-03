import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader } from '../components/ui/Card';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_role: 'student', // Assign 'student' role on signup
          },
        },
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error: any) {
      setError(error.message || 'Gagal membuat akun.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm animate-fade-in-up">
        <CardHeader>
           <div className="text-center">
               <h1 className="text-3xl font-bold text-brand-pink-600">Buat Akun Siswa</h1>
               <p className="text-gray-500 mt-2">Daftar untuk mengakses portal siswa</p>
           </div>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center">
                <p className="text-green-700 bg-green-100 p-4 rounded-lg">Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi (jika diaktifkan), lalu kembali untuk login.</p>
                <Button onClick={() => navigate('/login')} className="w-full mt-4">
                    Kembali ke Login
                </Button>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
               <Input
                type="text"
                placeholder="Nama Lengkap"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password (minimal 6 karakter)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-lg">{error}</p>}
              <Button type="submit" className="w-full" isLoading={isLoading}>
                {isLoading ? 'Memproses...' : 'Daftar'}
              </Button>
            </form>
          )}
          <p className="text-center text-sm text-gray-600 mt-6">
            Sudah punya akun?
            <Link
              to="/login"
              className="font-semibold text-brand-pink-500 hover:underline ml-1"
            >
              Login disini
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

export default RegisterPage;
