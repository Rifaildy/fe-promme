// Contoh konsep halaman penangkap URL Callback
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
   const location = useLocation();
   const navigate = useNavigate();

   useEffect(() => {
      // 1. Ambil query parameter dari URL
      const searchParams = new URLSearchParams(location.search);
      const code = searchParams.get('code');
      const state = searchParams.get('state');

      if (code && state) {
         // 2. Parse state (untuk tahu platform apa yang tadi di klik)
         const { platform } = JSON.parse(decodeURIComponent(state));
         
         // 3. Tembak API backend Anda (seperti handleConnectSocial sebelumnya)
         // fetchApi('/creators/social-accounts/connect', { body: JSON.stringify({ platform, auth_code: code }) })
         //   .then(() => navigate('/dashboard/settings'))
      }
   }, []);

   return <div>Memproses Otorisasi... Mohon Tunggu.</div>;
}