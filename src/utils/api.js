// --- src/utils/api.js ---
const BASE_URL = 'http://localhost:3000/api/v1';

export const fetchApi = async (endpoint, options = {}) => {
  // Ambil token dari local storage jika user sudah login
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

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