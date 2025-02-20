import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { User, Role, RolePermission } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserData(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          role_id
        `)
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      let roleData: Role | null = null;
      let permissionsData: RolePermission[] = [];

      if (profileData.role_id) {
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .eq('id', profileData.role_id)
          .single();

        if (roleError) throw roleError;
        roleData = role;

        const { data: permissions, error: permissionsError } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role_id', profileData.role_id);

        if (permissionsError) throw permissionsError;
        permissionsData = permissions;
      }

      setUser({
        id: userId,
        email: profileData.email,
        profile: {
          id: profileData.id,
          email: profileData.email,
          role_id: profileData.role_id,
          roles: roleData
        },
        role: roleData,
        permissions: permissionsData
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Success",
        description: "Please check your email to confirm your account",
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error signing up",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const hasPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (!user?.permissions) return false;
    const permission = user.permissions.find(p => p.resource === resource);
    if (!permission) return false;
    
    switch (action) {
      case 'create':
        return permission.can_create;
      case 'read':
        return permission.can_read;
      case 'update':
        return permission.can_update;
      case 'delete':
        return permission.can_delete;
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, hasPermission }}>
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
