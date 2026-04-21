// --- src/utils/api.js ---
const BASE_URL = 'https://be-dinery.vercel.app/api/v1';

export const fetchApi = async (endpoint, options = {}) => {
  // Ambil token dari local storage jika user sudah login
  const token = localStorage.getItem('access_token');
  
  // Ambil headers bawaan jika ada
  const headers = { ...options.headers };

  // [REVISI]: Jangan set application/json jika mengirim FormData (File/Gambar/Video)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  // Jika status bukan 2xx, lempar error agar bisa ditangkap oleh blok catch di komponen
  if (!response.ok) {
    throw new Error(data.message || 'Terjadi kesalahan pada server');
  }

  return data;
};