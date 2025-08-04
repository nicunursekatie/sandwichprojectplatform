# Supabase Auth Migration Guide

## 🔐 Step 1: Get Your Supabase Keys

1. Go to: https://supabase.com/dashboard/project/mifquzfaqtcyboqntfyn/settings/api
2. Copy the **anon public** key (starts with `eyJ...`)
3. Add to your `.env` file:
   ```
   VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key_here...
   ```

## 🛠 Step 2: Configure Supabase Auth Settings

1. Go to: https://supabase.com/dashboard/project/mifquzfaqtcyboqntfyn/auth/settings
2. Configure these settings:

### Email Templates
- **Enable Email Confirmations**: Toggle ON if you want email verification
- **Site URL**: Set to `http://localhost:5001` for development
- **Redirect URLs**: Add:
  - `http://localhost:5001/*`
  - `http://localhost:5001/reset-password`
  - `http://localhost:5001/dashboard`
  - Your production URL when you deploy

### Email Settings
- **Enable Email Provider**: Make sure it's enabled
- **Sender Name**: "The Sandwich Project"
- **Sender Email**: Use your verified email

### Password Settings
- **Minimum Password Length**: 8 (or your preference)
- **Enable Password Recovery**: ON

## 🔄 Step 3: Migrate Existing Users

Since you have existing users with passwords stored in your database, we need to migrate them to Supabase Auth.

### Option A: Manual Migration (Recommended for small user base)
1. Export user emails from your database
2. Use Supabase Dashboard to create users
3. Send password reset emails to all users

### Option B: Automated Migration Script
Run this script to migrate users (we'll create this after you update the keys):

```bash
npm run migrate-users
```

## 📝 Step 4: Update Your Application

The application is already set up with:
- ✅ Supabase client configuration (`/client/src/lib/supabase.ts`)
- ✅ Auth helper functions (signIn, signUp, resetPassword, etc.)
- 🔄 Need to create: Auth context and components

## 🎯 Features You'll Get

Once configured, you'll have:
- ✅ Email/Password authentication
- ✅ Magic link authentication
- ✅ Password reset via email
- ✅ Email verification
- ✅ Session management
- ✅ Secure token-based auth
- ✅ Rate limiting protection

## ⚠️ Important Security Notes

1. **Never commit the service role key** - It should only be used server-side
2. **The anon key is safe to expose** - It's meant for client-side use
3. **Enable Row Level Security (RLS)** on your database tables
4. **Use HTTPS in production** - Required for secure cookies

## 🚀 Next Steps

After updating your `.env` with the correct anon key:

1. Restart your dev server
2. Test the auth functions
3. Update your login/signup pages to use Supabase Auth
4. Migrate existing users
5. Enable RLS on database tables

Need help? Check the Supabase Auth docs: https://supabase.com/docs/guides/auth