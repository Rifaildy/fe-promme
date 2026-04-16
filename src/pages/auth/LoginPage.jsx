// --- src/pages/auth/LoginPage.jsx ---
import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Topbar from '../../components/layout/Topbar';
import { fetchApi } from '../../utils/api';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // Panggil API Backend
      const response = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      // Simpan token ke localStorage
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user_role', response.data.role);

      // Panggil fungsi onLogin dari App.jsx
      onLogin({
        email: email,
        role: response.data.role.toLowerCase(), // Jadikan lowercase untuk routing internal frontend
        name: email.split('@')[0] // Fallback nama dari email
      });

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col w-full">
      <Topbar onNavigate={onNavigate} />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#404145]">Sign In</h2>
            <p className="text-[#7a7d85] mt-2">Masuk ke akun Promme Anda</p>
          </div>
          
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <Input 
              label="Email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <div className="pt-4">
              <Button type="submit" className="w-full py-3 text-lg" disabled={loading}>
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </div>
          </form>

          {/* Bagian yang ditambahkan */}
          <div className="mt-6 text-center text-sm text-[#7a7d85]">
            Belum punya akun? <span onClick={() => onNavigate('register')} className="text-[#1dbf73] cursor-pointer hover:underline font-bold">Daftar sekarang</span>
          </div>

        </Card>
      </div>
    </div>
  );
};

export default LoginPage;