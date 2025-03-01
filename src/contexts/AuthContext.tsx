
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { loginWithMontaz } from '@/integrations/montaz/client';
import type { User, Role, RolePermission, SUPER_ADMIN_EMAIL } from '@/types/auth';
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
  needsProfileCompletion: () => boolean;
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

  const needsProfileCompletion = () => {
    if (!user) return false;
    if (isSuperAdmin()) return false; // Super admin never needs profile completion
    
    // Check if user is from Montaz and profile is not completed
    return !!user.profile?.montaz_id && !user.profile.profile_completed;
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
          last_montaz_login,
          assigned_stores,
          profile_completed
        `)
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        
        // Handle the case where the columns don't exist yet or other errors
        setUser({
          id: userId,
          profile: {
            id: userId,
            email: '',
            is_active: true,
            assigned_stores: [],
            profile_completed: false
          }
        });
        setLoading(false);
        return;
      }

      // If user is inactive, sign them out
      if (profileData && profileData.is_active === false) {
        console.log('User account is disabled');
        await signOut();
        toast({
          title: "Access Denied",
          description: "Your account has been disabled. Please contact an administrator.",
          variant: "destructive",
        });
        return;
      }

      let roleData: Role | null = null;
      let permissionsData: RolePermission[] = [];

      if (profileData?.role_id) {
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

      // Ensure assigned_stores is always an array of strings
      const assignedStores = profileData?.assigned_stores 
        ? Array.isArray(profileData.assigned_stores) 
          ? profileData.assigned_stores.map(store => String(store)) 
          : []
        : [];

      setUser({
        id: userId,
        email: profileData?.email || '',
        profile: {
          id: profileData?.id || userId,
          email: profileData?.email || '',
          role_id: profileData?.role_id,
          roles: roleData,
          is_active: profileData?.is_active,
          montaz_id: profileData?.montaz_id,
          montaz_data: profileData?.montaz_data,
          last_montaz_login: profileData?.last_montaz_login,
          montaz_password: profileData?.montaz_password,
          assigned_stores: assignedStores,
          profile_completed: profileData?.profile_completed || false
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
      
      console.log("Montaz login successful, checking if user exists:", montazData.user.email);
      
      // First check if there's a profile with this email
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select(`*, roles(name)`)
        .eq('email', montazData.user.email)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking for existing profile:', checkError);
      }

      // Check if user is disabled
      if (existingProfile && existingProfile.is_active === false) {
        throw new Error('Your account has been disabled. Please contact an administrator.');
      }

      let authUser;
      
      if (!existingProfile) {
        // If profile doesn't exist, create a new user
        console.log("Creating new user for Montaz login:", montazData.user.email);
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
        
        if (signUpError) {
          // If error is "User already registered", try to sign in instead
          if (signUpError.message.includes('User already registered')) {
            console.log("User already exists but no profile found, attempting sign in");
            
            // Try with a default Montaz password pattern
            const defaultPassword = `Montaz${montazData.user.id}`;
            
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: montazData.user.email,
              password: defaultPassword
            });
            
            if (signInError) {
              console.error('Failed automatic sign in, showing error to user:', signInError);
              throw new Error(`This Montaz account exists but we couldn't log you in automatically. Please contact an administrator.`);
            }
            
            authUser = signInData.user;
            
            // Create profile for existing auth user that's missing a profile
            if (authUser) {
              const { error: createProfileError } = await supabase
                .from('profiles')
                .insert({
                  id: authUser.id,
                  email: montazData.user.email,
                  montaz_id: montazData.user.id,
                  montaz_data: montazData.user,
                  montaz_password: defaultPassword,
                  last_montaz_login: new Date().toISOString(),
                  profile_completed: false,
                  assigned_stores: []
                });
                
              if (createProfileError) {
                console.error('Error creating profile for existing auth user:', createProfileError);
              }
            }
          } else {
            console.error('Error signing up new Montaz user:', signUpError);
            throw signUpError;
          }
        } else {
          authUser = signUpData.user;
          
          if (authUser) {
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                montaz_id: montazData.user.id,
                montaz_data: montazData.user,
                montaz_password: randomPassword,
                last_montaz_login: new Date().toISOString(),
                profile_completed: false,
                assigned_stores: []
              })
              .eq('id', authUser.id);
              
            if (updateError) {
              console.error('Error updating new profile:', updateError);
            }
          }
        }
        
        // Automatically navigate to Montaz user management for new users
        toast({
          title: "New Montaz User",
          description: "Your account has been created. An admin will set up your access rights.",
        });
        
        navigate('/montaz-users');
        return;
      } else {
        // If profile exists, sign in with existing credentials
        console.log("Existing user found for Montaz login:", montazData.user.email);
        const password = existingProfile.montaz_password || `Montaz${montazData.user.id}`;
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: montazData.user.email,
          password: password
        });
        
        if (signInError) {
          console.error('Error signing in existing Montaz user:', signInError);
          // If authentication fails with the stored password, create a new one and update it
          const newPassword = `Montaz${Date.now()}`;
          
          // Try to reset password via admin functions
          console.log("Attempting to update password for Montaz user");
          const { data: authUserData, error: authError } = await supabase.auth.admin.updateUserById(
            existingProfile.id,
            { password: newPassword }
          );
          
          if (authError) {
            console.error("Failed to update user password:", authError);
            throw new Error("Failed to authenticate. Please contact an administrator.");
          }
          
          // Try signing in with the new password
          const { data: newSignInData, error: newSignInError } = await supabase.auth.signInWithPassword({
            email: montazData.user.email,
            password: newPassword
          });
          
          if (newSignInError) {
            console.error("Still failed to sign in after password update:", newSignInError);
            throw new Error("Authentication failed. Please contact an administrator.");
          }
          
          authUser = newSignInData.user;
          
          // Update the stored password in profiles
          const { error: updatePassError } = await supabase
            .from('profiles')
            .update({
              montaz_password: newPassword,
              last_montaz_login: new Date().toISOString()
            })
            .eq('id', existingProfile.id);
            
          if (updatePassError) {
            console.error("Failed to update password in profile:", updatePassError);
          }
        } else {
          authUser = signInData.user;
          
          // Update login timestamp
          const { error: updateError } = await supabase
            .from('profiles')
            .update({
              last_montaz_login: new Date().toISOString()
            })
            .eq('id', authUser.id);
            
          if (updateError) {
            console.error('Error updating login timestamp:', updateError);
          }
        }
      }
      
      toast({
        title: "Success",
        description: "Logged in with Montaz successfully",
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Montaz login error in AuthContext:', error);
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
      signInWithMontaz,
      needsProfileCompletion
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
