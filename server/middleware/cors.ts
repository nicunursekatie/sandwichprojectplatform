import cors from 'cors';

// CORS configuration for production and development
const isDevelopment = process.env.NODE_ENV === 'development';

const allowedOrigins = isDevelopment
  ? ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5001']
  : [
      process.env.CORS_ORIGIN || 'https://your-username.github.io',
      'https://sandwich-project-platform.pages.dev', // If using Cloudflare Pages
      'https://sandwich-project.vercel.app', // If using Vercel
    ].filter(Boolean);

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin && isDevelopment) {
      return callback(null, true);
    }
    
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (isDevelopment) {
      // In development, log but allow the request
      console.log(`CORS: Allowing request from origin: ${origin} (development mode)`);
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24 hours
};

export default cors(corsOptions);