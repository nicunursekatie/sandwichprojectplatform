// API Configuration for production/development
const isDevelopment = import.meta.env.DEV;

export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5001' 
  : (import.meta.env.VITE_API_URL || 'https://sandwich-project-api.onrender.com');

export const WS_BASE_URL = isDevelopment
  ? 'ws://localhost:5001'
  : API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');

export const getApiUrl = (path: string) => {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};

export const config = {
  api: {
    baseUrl: API_BASE_URL,
    wsUrl: WS_BASE_URL,
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
};