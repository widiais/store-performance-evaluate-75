
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
import { UserPlus, Pencil, Trash2, Lock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPasswordMode, setIsPasswordMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const { data: users, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      const profilesWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          if (profile.role_id) {
            const { data: role } = await supabase
              .from('roles')
              .select('*')
              .eq('id', profile.role_id)
              .single();
            return { ...profile, roles: role };
          }
          return { ...profile, roles: null };
        })
      );

      return profilesWithRoles;
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
      // Use regular signUp instead of admin.createUser
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
          .update({ role_id: roleId })
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
        .eq('id', selectedUser.id);
      
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
      if (currentUser?.id === selectedUser.id) {
        // If changing own password, use updateUser
        const { error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        
        if (error) throw error;
      } else {
        // For other users, inform that direct password reset isn't possible
        toast({
          title: "Information",
          description: "Password reset email has been sent to the user's email address.",
        });
        
        // This would normally trigger a password reset email
        await supabase.auth.resetPasswordForEmail(selectedUser.email, {
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
      // Cannot directly delete users with client credentials
      // Instead, mark the user as inactive or implement a soft delete
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: false })
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

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
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
