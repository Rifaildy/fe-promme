// --- src/utils/api.js ---
const BASE_URL = 'http://localhost:3000/api/v1';

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

  try {
    const fullUrl = `${BASE_URL}${endpoint}`;
    console.log(`[API] ${options.method || 'GET'} ${fullUrl}`);

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error(`[API] JSON parse error for ${fullUrl}:`, parseError);
      throw new Error('Response parsing failed - invalid JSON from server');
    }

    // Jika status bukan 2xx, lempar error agar bisa ditangkap oleh blok catch di komponen
    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status}`;
      console.error(`[API] Error ${response.status}:`, errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`[API] Success ${response.status}:`, data);
    return data;
  } catch (error) {
    // Handle network errors
    if (error instanceof TypeError) {
      console.error(`[API] Network error:`, error.message);
      throw new Error('Network error - check backend connection');
    }
    throw error;
  }
};
