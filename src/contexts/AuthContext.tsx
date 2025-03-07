
import { createContext, useContext, useState } from 'react';
import type { User, Role, RolePermission } from '@/types/auth';
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
  // In development mode, create a default super admin user
  const [user] = useState<User | null>({
    id: '1',
    email: 'admin@example.com',
    profile: {
      id: '1',
      email: 'admin@example.com',
      role_id: '1',
      roles: {
        id: '1',
        name: 'Super Admin',
        description: 'Has access to all system features',
        role_level: 'admin',
      }
    },
    role: {
      id: '1',
      name: 'Super Admin',
      description: 'Has access to all system features',
      role_level: 'admin',
    },
    permissions: [
      { id: '1', role_id: '1', resource: '*', action: 'create' },
      { id: '2', role_id: '1', resource: '*', action: 'read' },
      { id: '3', role_id: '1', resource: '*', action: 'update' },
      { id: '4', role_id: '1', resource: '*', action: 'delete' }
    ]
  });
  const [loading] = useState(false);

  // Check if user has Super Admin role
  const isSuperAdmin = () => {
    if (!user) return false;
    return user.role.role_level === 'admin';
  };

  // These functions are placeholders since authentication is bypassed in development
  const signIn = async (_email: string, _password: string) => {
    // In a production environment, this would be implemented with Supabase Auth
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: _email,
    //   password: _password,
    // });
    // if (error) throw error;
    console.log("Sign in attempted with:", _email);
  };

  const signUp = async (_email: string, _password: string) => {
    // In a production environment, this would be implemented with Supabase Auth
    // const { data, error } = await supabase.auth.signUp({
    //   email: _email,
    //   password: _password,
    // });
    // if (error) throw error;
    console.log("Sign up attempted with:", _email);
  };

  const signOut = async () => {
    // In a production environment, this would be implemented with Supabase Auth
    // const { error } = await supabase.auth.signOut();
    // if (error) throw error;
    console.log("Sign out attempted");
  };

  // Check if user has permission for a specific resource and action
  const hasPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (isSuperAdmin()) return true;
    
    // Check specific permissions
    return user.permissions.some(
      permission => 
        (permission.resource === resource || permission.resource === '*') && 
        permission.action === action
    );
  };

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
