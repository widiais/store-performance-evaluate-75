
import { createContext, useContext, useState } from 'react';
import type { User } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  // In development mode, create a default user
  const [user] = useState<User | null>({
    id: '1',
    email: 'admin@example.com',
    profile: {
      id: '1',
      email: 'admin@example.com'
    },
    role: {
      id: '1',
      name: 'User',
      description: 'Regular user',
      role_level: 'staff',
    },
    permissions: []
  });
  const [loading] = useState(false);

  // Always return true for admin status to allow all access
  const isSuperAdmin = () => true;

  const signIn = async (_email: string, _password: string) => {
    console.log("Sign in attempted with:", _email);
  };

  const signUp = async (_email: string, _password: string) => {
    console.log("Sign up attempted with:", _email);
  };

  const signOut = async () => {
    console.log("Sign out attempted");
  };

  // Always return true for permissions to allow all access
  const hasPermission = (): boolean => true;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      hasPermission,
      isSuperAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
