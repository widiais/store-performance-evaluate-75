
import { createContext, useContext, useState } from 'react';
import type { User, Role, RolePermission } from '@/types/auth';

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
  // Create a default super admin user to bypass authentication
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
    permissions: []
  });
  const [loading] = useState(false);

  const isSuperAdmin = () => true;

  // These functions are placeholders since authentication is bypassed
  const signIn = async (_email: string, _password: string) => {};
  const signUp = async (_email: string, _password: string) => {};
  const signOut = async () => {};

  // Always return true for permissions since authentication is bypassed
  const hasPermission = (_resource: string, _action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    return true;
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
