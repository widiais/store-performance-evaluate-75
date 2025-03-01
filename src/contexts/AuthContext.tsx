
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { loginWithMontaz } from '@/integrations/montaz/client';
import type { User, Role, RolePermission } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  hasPermission: (resource: string, action: 'create' | 'read' | 'update' | 'delete') => boolean;
  isSuperAdmin: () => boolean;
  signInWithMontaz: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isSuperAdmin = () => {
    return user?.profile?.email === 'widi@admin.com';
  };

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
      // Check if the profiles table exists and has the necessary columns
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          role_id,
          is_active,
          montaz_id,
          montaz_data,
          montaz_password,
          last_montaz_login
        `)
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // Even if there's an error, continue with default values
        setUser({
          id: userId,
          profile: {
            id: userId,
            email: '',
            is_active: true
          }
        });
        setLoading(false);
        return;
      }

      let roleData: Role | null = null;
      let permissionsData: RolePermission[] = [];

      if (profileData.role_id) {
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .eq('id', profileData.role_id)
          .single();

        if (roleError) {
          console.error('Role fetch error:', roleError);
        } else {
          roleData = role;

          const { data: permissions, error: permissionsError } = await supabase
            .from('role_permissions')
            .select('*')
            .eq('role_id', profileData.role_id);

          if (permissionsError) {
            console.error('Permissions fetch error:', permissionsError);
          } else {
            permissionsData = permissions;
          }
        }
      }

      setUser({
        id: userId,
        email: profileData.email,
        profile: {
          id: profileData.id,
          email: profileData.email,
          role_id: profileData.role_id,
          roles: roleData,
          is_active: profileData.is_active,
          montaz_id: profileData.montaz_id,
          montaz_data: profileData.montaz_data,
          last_montaz_login: profileData.last_montaz_login,
          montaz_password: profileData.montaz_password
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

  const changePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error changing password",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const hasPermission = (resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (!user?.permissions) return false;
    if (isSuperAdmin()) return true;
    
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

  const signInWithMontaz = async (email: string, password: string) => {
    try {
      setLoading(true);
      const montazData = await loginWithMontaz(email, password);
      
      if (!montazData || !montazData.user) {
        throw new Error('Invalid response from Montaz API');
      }
      
      // First check if there's a profile with this email
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', montazData.user.email)
        .maybeSingle();

      let authUser;
      
      if (!existingProfile) {
        // If profile doesn't exist, create a new user
        const randomPassword = `Montaz${Date.now()}`;
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: montazData.user.email,
          password: randomPassword,
          options: {
            data: {
              montaz_id: montazData.user.id,
              first_name: montazData.user.first_name || '',
              last_name: montazData.user.last_name || '',
            }
          }
        });
        
        if (signUpError) throw signUpError;
        authUser = signUpData.user;
        
        if (authUser) {
          await supabase
            .from('profiles')
            .update({
              montaz_id: montazData.user.id,
              montaz_data: montazData.user,
              montaz_password: randomPassword,
              last_montaz_login: new Date().toISOString()
            })
            .eq('id', authUser.id);
        }
      } else {
        // If profile exists, sign in with existing credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: montazData.user.email,
          password: existingProfile.montaz_password || `Montaz${Date.now()}`
        });
        
        if (signInError) throw signInError;
        authUser = signInData.user;
        
        if (authUser) {
          await supabase
            .from('profiles')
            .update({
              montaz_id: montazData.user.id,
              montaz_data: montazData.user,
              last_montaz_login: new Date().toISOString()
            })
            .eq('id', authUser.id);
        }
      }
      
      toast({
        title: "Success",
        description: "Logged in with Montaz successfully",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error signing in with Montaz",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      changePassword,
      hasPermission,
      isSuperAdmin,
      signInWithMontaz
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
