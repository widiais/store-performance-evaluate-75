
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
import { UserPlus, Pencil, Lock, AlertCircle, UserX, UserCheck, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Profile, Role } from "@/types/auth";
import { ScrollArea } from "@/components/ui/scroll-area";

const UserManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const { toast } = useToast();
  const { user: currentUser, isSuperAdmin } = useAuth();

  const { data: users, refetch, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Fetch roles for each profile in a separate query
      const profilesWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          if (profile.role_id) {
            const { data: roleData, error: roleError } = await supabase
              .from('roles')
              .select('*')
              .eq('id', profile.role_id)
              .single();
            
            if (roleError) {
              return { ...profile, roles: null };
            }
            
            return { ...profile, roles: roleData as Role };
          }
          return { ...profile, roles: null };
        })
      );

      return profilesWithRoles as Profile[];
    }
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      if (error) throw error;
      return data;
    }
  });

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const roleId = formData.get('role') as string;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            role_id: roleId, 
            is_active: true 
          })
          .eq('id', data.user.id);
        
        if (profileError) throw profileError;
      }

      toast({
        title: "Success",
        description: "User created successfully. They will need to confirm their email.",
      });
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const roleId = formData.get('role') as string;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role_id: roleId })
        .eq('id', selectedUser?.id);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "User updated successfully",
      });
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get('password') as string;

    try {
      if (currentUser?.id === selectedUser?.id) {
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        
        if (error) throw error;
      } else {
        toast({
          title: "Information",
          description: "Password reset email has been sent to the user's email address.",
        });
        
        await supabase.auth.resetPasswordForEmail(selectedUser?.email || '', {
          redirectTo: window.location.origin,
        });
      }

      toast({
        title: "Success",
        description: "Password change process initiated successfully",
      });
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: false
        })
        .eq('id', userId);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "User has been deactivated",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_active: true
        })
        .eq('id', userId);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "User has been reactivated",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Filter users based on permissions
  const displayUsers = isSuperAdmin() 
    ? users 
    : users?.filter(user => user.id === currentUser?.id);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Badge variant="outline" className="ml-2">
            <Users className="h-4 w-4 mr-1" />
            {users?.length || 0} Registered Users
          </Badge>
        </div>
        {isSuperAdmin() && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setIsEditMode(false);
                setIsPasswordMode(false);
                setSelectedUser(null);
              }}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isPasswordMode ? 'Change Password' : isEditMode ? 'Edit User' : 'Create New User'}
                </DialogTitle>
              </DialogHeader>
              {isPasswordMode ? (
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <Label htmlFor="password">New Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                  <Button type="submit" className="w-full">
                    Change Password
                  </Button>
                </form>
              ) : (
                <form onSubmit={isEditMode ? handleUpdateUser : handleCreateUser} className="space-y-4">
                  {!isEditMode && (
                    <>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required />
                      </div>
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" required />
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
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <p>Loading users...</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <Table>
            <TableCaption>List of users in the system</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                {isSuperAdmin() && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUsers?.length ? (
                displayUsers.map((user) => (
                  <TableRow key={user.id} className={user.is_active === false ? "bg-gray-100" : ""}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.roles?.name || 'No role'}</TableCell>
                    <TableCell>
                      {user.is_active === false ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" /> Inactive
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    {isSuperAdmin() && (
                      <TableCell className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setIsEditMode(true);
                            setIsPasswordMode(false);
                            setSelectedUser(user);
                            setIsOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setIsPasswordMode(true);
                            setIsEditMode(false);
                            setSelectedUser(user);
                            setIsOpen(true);
                          }}
                        >
                          <Lock className="h-4 w-4" />
                        </Button>
                        {user.is_active === false ? (
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-green-600 hover:text-green-800 border-green-200 hover:border-green-400"
                            onClick={() => handleReactivateUser(user.id)}
                          >
                            <UserCheck className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isSuperAdmin() ? 4 : 3} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
};

export default UserManagement;
