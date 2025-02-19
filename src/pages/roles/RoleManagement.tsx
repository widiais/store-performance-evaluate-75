
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Pencil, Trash2 } from "lucide-react";
import type { PermissionType } from "@/types/auth";

const RESOURCES = ['users', 'roles', 'stores', 'reports', 'evaluations'];
const PERMISSIONS: PermissionType[] = ['create', 'read', 'update', 'delete'];

const RoleManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const { toast } = useToast();

  const { data: roles, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select('*, role_permissions(*)');
      if (error) throw error;
      return data;
    }
  });

  const handleCreateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({ name, description })
        .select()
        .single();

      if (roleError) throw roleError;

      // Insert permissions
      const permissions = [];
      for (const resource of RESOURCES) {
        for (const permission of PERMISSIONS) {
          const isChecked = formData.get(`${resource}-${permission}`);
          if (isChecked) {
            permissions.push({
              role_id: role.id,
              resource,
              permission,
            });
          }
        }
      }

      if (permissions.length > 0) {
        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissions);
        
        if (permError) throw permError;
      }

      toast({
        title: "Success",
        description: "Role created successfully",
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

  const handleUpdateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      // Update role
      const { error: roleError } = await supabase
        .from('roles')
        .update({ name, description })
        .eq('id', selectedRole.id);

      if (roleError) throw roleError;

      // Delete existing permissions
      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', selectedRole.id);

      if (deleteError) throw deleteError;

      // Insert new permissions
      const permissions = [];
      for (const resource of RESOURCES) {
        for (const permission of PERMISSIONS) {
          const isChecked = formData.get(`${resource}-${permission}`);
          if (isChecked) {
            permissions.push({
              role_id: selectedRole.id,
              resource,
              permission,
            });
          }
        }
      }

      if (permissions.length > 0) {
        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissions);
        
        if (permError) throw permError;
      }

      toast({
        title: "Success",
        description: "Role updated successfully",
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

  const handleDeleteRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Role deleted successfully",
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

  const hasPermission = (role: any, resource: string, permission: PermissionType) => {
    return role.role_permissions?.some((p: any) => 
      p.resource === resource && p.permission === permission
    );
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditMode(false);
              setSelectedRole(null);
            }}>
              <Shield className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={isEditMode ? handleUpdateRole : handleCreateRole} className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  defaultValue={selectedRole?.name}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  name="description" 
                  defaultValue={selectedRole?.description}
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        {PERMISSIONS.map(permission => (
                          <TableHead key={permission}>{permission}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {RESOURCES.map(resource => (
                        <TableRow key={resource}>
                          <TableCell className="font-medium">{resource}</TableCell>
                          {PERMISSIONS.map(permission => (
                            <TableCell key={`${resource}-${permission}`}>
                              <Checkbox
                                name={`${resource}-${permission}`}
                                defaultChecked={selectedRole && hasPermission(selectedRole, resource, permission)}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <Button type="submit" className="w-full">
                {isEditMode ? 'Update Role' : 'Create Role'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>List of roles</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles?.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell className="flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setIsEditMode(true);
                    setSelectedRole(role);
                    setIsOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteRole(role.id)}
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

export default RoleManagement;
