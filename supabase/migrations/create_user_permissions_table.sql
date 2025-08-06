-- Create user_permissions table for granular permission management
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, permission)
);

-- Create indexes for better query performance
CREATE INDEX idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON public.user_permissions(permission);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read their own permissions
CREATE POLICY "Users can view own permissions" ON public.user_permissions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to manage all permissions
CREATE POLICY "Admins can manage all permissions" ON public.user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_permissions 
      WHERE user_id = auth.uid() 
      AND permission = 'manage_users'
    )
  );

-- Create a function to get all permissions for a user
CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN ARRAY(
    SELECT permission 
    FROM public.user_permissions 
    WHERE user_id = p_user_id
  );
END;
$$;

-- Create a function to check if user has a specific permission
CREATE OR REPLACE FUNCTION public.user_has_permission(p_user_id UUID, p_permission TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_permissions 
    WHERE user_id = p_user_id 
    AND permission = p_permission
  );
END;
$$;

-- Grant initial permissions to admin users
DO $$
DECLARE
  admin_user RECORD;
  all_permissions TEXT[] := ARRAY[
    'admin_access',
    'manage_users',
    'manage_announcements',
    'access_directory',
    'access_hosts',
    'access_recipients',
    'access_drivers',
    'access_collections',
    'access_chat',
    'access_messages',
    'access_toolkit',
    'access_meetings',
    'access_analytics',
    'access_reports',
    'access_projects',
    'access_role_demo',
    'access_suggestions',
    'access_sandwich_data',
    'access_governance',
    'access_work_logs',
    'manage_hosts',
    'manage_recipients',
    'manage_drivers',
    'manage_meetings',
    'manage_suggestions',
    'submit_suggestions',
    'create_suggestions',
    'edit_all_suggestions',
    'delete_all_suggestions',
    'manage_collections',
    'create_projects',
    'edit_all_projects',
    'delete_all_projects',
    'create_collections',
    'edit_all_collections',
    'delete_all_collections',
    'create_work_logs',
    'view_all_work_logs',
    'edit_all_work_logs',
    'delete_all_work_logs',
    'export_data',
    'import_data',
    'schedule_reports',
    'send_messages',
    'moderate_messages',
    'direct_messages',
    'group_messages',
    'general_chat',
    'committee_chat',
    'host_chat',
    'driver_chat',
    'recipient_chat',
    'core_team_chat'
  ];
  perm TEXT;
BEGIN
  -- Find admin users by email
  FOR admin_user IN 
    SELECT id 
    FROM auth.users 
    WHERE email IN ('admin@sandwich.project', 'katielong2316@gmail.com')
  LOOP
    -- Grant all permissions to admin users
    FOREACH perm IN ARRAY all_permissions
    LOOP
      INSERT INTO public.user_permissions (user_id, permission)
      VALUES (admin_user.id, perm)
      ON CONFLICT (user_id, permission) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Create a view for easier permission management
CREATE OR REPLACE VIEW public.user_permissions_summary AS
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'role' as role,
  ARRAY_AGG(up.permission ORDER BY up.permission) as permissions,
  COUNT(up.permission) as permission_count
FROM auth.users u
LEFT JOIN public.user_permissions up ON u.id = up.user_id
GROUP BY u.id, u.email, u.raw_user_meta_data;