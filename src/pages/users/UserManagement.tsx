
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Profile } from "@/integrations/supabase/client-types";
import { mapToProfile, mapToRole } from "@/utils/typeUtils";

interface Role {
  id: string;
  name: string;
  description?: string;
  role_level: string;
}

interface ProfileWithRole extends Profile {
  roles?: Role | null;
}

const UserManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProfileWithRole | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { isSuperAdmin } = useAuth();

  const { data: users = [], refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }
        
        // Map profiles to the correct type
        const mappedProfiles: Profile[] = profiles.map(profile => mapToProfile(profile));
        
        // For each profile, fetch associated role
        const profilesWithRoles: ProfileWithRole[] = await Promise.all(
          mappedProfiles.map(async (profile) => {
            if (profile.role_id) {
              try {
                const { data: role, error: roleError } = await supabase
                  .from('roles')
                  .select('*')
                  .eq('id', profile.role_id)
                  .single();
                  
                if (roleError) {
                  console.error("Error fetching role for profile:", profile.id, roleError);
                  return { ...profile, roles: null };
                }
                
                return { ...profile, roles: mapToRole(role) };
              } catch (error) {
                console.error("Error processing role:", error);
                return { ...profile, roles: null };
              }
            }
            return { ...profile, roles: null };
          })
        );
        
        return profilesWithRoles;
      } catch (error) {
        console.error("Error in users query:", error);
        throw error;
      }
    }
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      if (error) {
        console.error("Error fetching roles:", error);
        throw error;
      }
      return data.map(role => mapToRole(role));
    }
  });

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const roleId = formData.get('role') as string;

    // Validate form
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      console.log("Creating new user with email:", email);
      
      // Step 1: Create the user in auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error("Error creating user:", error);
        throw error;
      }

      // Step 2: Update the user's profile with the selected role
      if (data.user) {
        console.log("User created, updating profile with role:", roleId);
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ role_id: roleId })
          .eq('id', data.user.id);
        
        if (profileError) {
          console.error("Error updating profile:", profileError);
          throw profileError;
        }
      }

      toast({
        title: "Success",
        description: "User created successfully",
      });
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Full error:", error);
      setError(error.message || "Failed to create user");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const roleId = formData.get('role') as string;

    if (!selectedUser) return;

    try {
      console.log("Updating user:", selectedUser.id, "with role:", roleId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: roleId })
        .eq('id', selectedUser.id);
      
      if (error) {
        console.error("Error updating user role:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Full error:", error);
      setError(error.message || "Failed to update user");
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isSuperAdmin()) {
      toast({
        title: "Permission Denied",
        description: "Only super admins can delete users",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Note: This needs admin privileges
      // For proper implementation, this should be done via a Supabase Edge Function with admin rights
      toast({
        title: "Info",
        description: "User deletion requires admin API. Please contact system administrator.",
      });
      
      // In a real implementation, you would call a secure Edge Function:
      // const { data, error } = await supabase.functions.invoke('delete-user', { userId });
      
      // Refresh the user list to see changes
      refetch();
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditMode(false);
              setSelectedUser(null);
              setError(null);
            }}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit User' : 'Create New User'}</DialogTitle>
            </DialogHeader>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={isEditMode ? handleUpdateUser : handleCreateUser} className="space-y-4">
              {!isEditMode && (
                <>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required 
                           minLength={6} />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="role">Role</Label>
                <Select name="role" defaultValue={selectedUser?.role_id}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                {isEditMode ? 'Update User' : 'Create User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>List of users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.roles?.name || 'No role'}</TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsEditMode(true);
                    setSelectedUser(user);
                    setError(null);
                    setIsOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagement;
