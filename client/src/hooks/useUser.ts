import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest } from "@/lib/queryClient";

export interface UserWithPermissions {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profileImageUrl?: string;
  role: string;
  permissions: string[];
}

/**
 * Hook to fetch the full user data with permissions from the backend
 * This combines Supabase auth with the permissions from user_permissions_summary
 */
export function useUser() {
  const { user: supabaseUser, loading: authLoading } = useAuth();
  
  const { data: userData, isLoading, error } = useQuery<UserWithPermissions>({
    queryKey: ["/api/auth/user"],
    enabled: !!supabaseUser && !authLoading,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 3,
  });

  // Log for debugging
  if (userData) {
    console.log('User data loaded:', {
      email: userData.email,
      role: userData.role,
      permissionsCount: userData.permissions?.length || 0,
      permissions: userData.permissions?.slice(0, 5) || [],
    });
  }

  return {
    user: userData || null,
    isLoading: authLoading || isLoading,
    error,
    isAuthenticated: !!supabaseUser,
  };
}