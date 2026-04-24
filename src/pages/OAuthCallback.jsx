import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/api';
import Swal from 'sweetalert2';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const OAuthCallback = () => {
   const [searchParams] = useSearchParams();
   const navigate = useNavigate();
   const [status, setStatus] = useState('processing');
   const [errorMsg, setErrorMsg] = useState('');
   const isProcessing = useRef(false); // Mencegah double-execution di React Strict Mode

   useEffect(() => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      
      const processOAuth = async () => {
         if (isProcessing.current) return;
         isProcessing.current = true;

         // Handle OAuth provider error
         if (error) {
            setStatus('error');
            const errorMsg = errorDescription || `Provider error: ${error}`;
            setErrorMsg(errorMsg);
            console.error('[OAuth Error]', error, errorDescription);
            return;
         }

         if (!code) {
             setStatus('error');
             setErrorMsg('Authorization code tidak ditemukan. Proses otorisasi mungkin dibatalkan oleh pengguna.');
             console.warn('[OAuth] Authorization code missing');
             return;
         }

         // Mengambil platform yang disimpan sebelumnya sebelum redirect
         const platform = sessionStorage.getItem('oauth_platform');
         if (!platform) {
             setStatus('error');
             setErrorMsg('Informasi platform tidak ditemukan. Sesi mungkin telah kadaluarsa, silakan coba lagi dari menu Pengaturan Akun.');
             console.warn('[OAuth] Platform not found in session storage');
             return;
         }

         try {
            console.log(`[OAuth] Processing ${platform} authorization code`);
            
            // Mengirim Auth Code ke Backend untuk ditukar dengan Access Token
            const response = await fetchApi('/creators/social-accounts/connect', {
               method: 'POST',
               body: JSON.stringify({
                  platform: platform.toUpperCase(),
                  auth_code: code
               })
            });

            console.log('[OAuth] Connection successful:', response.data);
            setStatus('success');
            sessionStorage.removeItem('oauth_platform');
            
            await Swal.fire({
               icon: 'success',
               title: 'Berhasil Terhubung!',
               text: `Akun ${platform} Anda berhasil dihubungkan ke sistem.`,
               confirmButtonColor: '#1dbf73'
            });

            navigate('/dashboard/settings', { replace: true });

         } catch (error) {
            setStatus('error');
            const errorMessage = error.message || 'Gagal menghubungkan akun sosial media.';
            setErrorMsg(errorMessage);
            console.error('[OAuth] Connection failed:', errorMessage, error);
            
            await Swal.fire({
               icon: 'error',
               title: 'Otorisasi Gagal',
               text: errorMessage,
               confirmButtonColor: '#d33'
            });

            navigate('/dashboard/settings', { replace: true });
         }
      };

      processOAuth();
   }, [searchParams, navigate]);

   return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
            {status === 'processing' && (
               <div className="flex flex-col items-center justify-center py-6">
                  <div className="relative">
                     <div className="absolute inset-0 bg-[#1dbf73] rounded-full blur-xl opacity-20 animate-pulse"></div>
                     <Loader2 className="animate-spin text-[#1dbf73] relative z-10 mb-6" size={56} />
                  </div>
                  <h2 className="text-2xl font-black text-[#404145] mb-2">Memproses Otorisasi</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                     Harap tunggu sebentar, kami sedang menghubungkan akun media sosial Anda dengan aman. Jangan tutup halaman ini.
                  </p>
               </div>
            )}

            {status === 'success' && (
               <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
                  <CheckCircle className="text-[#1dbf73] mb-4" size={56} />
                  <h2 className="text-2xl font-black text-[#404145] mb-2">Otorisasi Berhasil</h2>
                  <p className="text-gray-500 text-sm">Mengalihkan kembali ke dashboard...</p>
               </div>
            )}

            {status === 'error' && (
               <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
                  <AlertCircle className="text-red-500 mb-4" size={56} />
                  <h2 className="text-2xl font-black text-[#404145] mb-2">Terjadi Kesalahan</h2>
                  <p className="text-gray-500 text-sm mb-6">{errorMsg}</p>
                  <button 
                     onClick={() => navigate('/dashboard/settings', { replace: true })}
                     className="bg-gray-900 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-black transition-colors"
                  >
                     Kembali ke Pengaturan
                  </button>
               </div>
            )}
         </div>
      </div>
   );
};

export default OAuthCallback;
