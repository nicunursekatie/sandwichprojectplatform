# 🥪 The Sandwich Project Platform

A comprehensive volunteer management platform for coordinating food distribution, volunteer activities, and community outreach.

## 🚀 Quick Deploy

### Deploy Frontend to GitHub Pages
[![Deploy to GitHub Pages](https://img.shields.io/badge/Deploy%20to-GitHub%20Pages-black?logo=github)](https://github.com/YOUR_USERNAME/Sandwich-Project-Platform/actions/workflows/deploy.yml)

### Deploy Backend to Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/YOUR_USERNAME/Sandwich-Project-Platform)

## 🌟 Features

- **User Management**: Role-based access control with Supabase authentication
- **Volunteer Coordination**: Track hosts, drivers, and recipients
- **Collections Tracking**: Log sandwich collections and distributions
- **Real-time Chat**: Team communication with WebSocket support
- **Analytics Dashboard**: Visualize impact and track metrics
- **Email Integration**: SendGrid-powered notifications
- **Mobile Responsive**: Works on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Express, PostgreSQL
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Email**: SendGrid
- **Deployment**: GitHub Pages + Render/Vercel

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase account)
- SendGrid account (optional, for emails)
- GitHub account (for deployment)

## 🔧 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Sandwich-Project-Platform.git
   cd Sandwich-Project-Platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed # Optional: add sample data
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Visit [http://localhost:5001](http://localhost:5001)

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Production

1. **Fork this repository**

2. **Set up Supabase**
   - Create project at [supabase.com](https://supabase.com)
   - Copy your project URL and keys

3. **Deploy Backend to Render**
   - Click the "Deploy to Render" button above
   - Add environment variables in Render dashboard

4. **Deploy Frontend to GitHub Pages**
   - Go to Settings → Secrets → Actions
   - Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`
   - Enable GitHub Pages in Settings → Pages
   - Push to main branch to trigger deployment

## 📁 Project Structure

```
├── client/                # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── lib/         # Utilities
│   │   └── contexts/    # React contexts
├── server/               # Express backend
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   └── db/             # Database configuration
├── shared/              # Shared types and utilities
└── migrations/          # Database migrations
```

## 🔑 Environment Variables

Create a `.env` file with:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/sandwich_project

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Email (optional)
SENDGRID_API_KEY=your-sendgrid-key

# Security
JWT_SECRET=generate-random-string
SESSION_SECRET=generate-random-string
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:client` - Build frontend only
- `npm run build:server` - Build backend only
- `npm start` - Start production server
- `npm run deploy:gh-pages` - Deploy frontend to GitHub Pages
- `npm run db:push` - Push database schema
- `npm run check` - TypeScript type checking

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- The Sandwich Project volunteers
- Supabase for authentication and database
- All contributors and supporters

## 📞 Support

For issues and questions:
- Open an [issue](https://github.com/YOUR_USERNAME/Sandwich-Project-Platform/issues)
- Contact: admin@sandwich.project

---

Built with ❤️ for The Sandwich Project community