import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { getDefaultPermissionsForRole } from '@shared/auth-utils';

interface EnhancedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

interface EnhancedAuthContextType {
  user: EnhancedUser | null;
  loading: boolean;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (!context) {
    throw new Error('useEnhancedAuth must be used within an EnhancedAuthProvider');
  }
  return context;
};

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: supabaseUser, loading: supabaseLoading } = useAuth();
  const [enhancedUser, setEnhancedUser] = useState<EnhancedUser | null>(null);

  // Fetch user data from API which includes permissions
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['/api/auth/user', supabaseUser?.id],
    enabled: !!supabaseUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (userData && typeof userData === 'object') {
      const user = userData as any;
      setEnhancedUser({
        id: user.id,
        email: user.email,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        role: user.role || 'viewer',
        permissions: user.permissions || []
      });
    } else if (!supabaseUser) {
      setEnhancedUser(null);
    }
  }, [userData, supabaseUser]);

  const value = {
    user: enhancedUser,
    loading: supabaseLoading || userLoading,
  };

  return <EnhancedAuthContext.Provider value={value}>{children}</EnhancedAuthContext.Provider>;
};

// Export a hook that provides backward compatibility
export const useAuthWithPermissions = () => {
  const { user } = useEnhancedAuth();
  const { session, signIn, signUp, signOut, resetPassword } = useAuth();
  
  return {
    user,
    session,
    loading: false,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
};