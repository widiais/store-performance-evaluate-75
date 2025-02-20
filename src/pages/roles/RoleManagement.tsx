import { useState, useEffect } from "react";
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

const SETUP_RESOURCES = [
  'setup-store',
  'setup-champs',
  'setup-cleanliness',
  'setup-service',
  'setup-product-quality',
  'setup-complain'
];

const PERMISSIONS: PermissionType[] = ['create', 'read', 'update', 'delete'];

const RoleManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [permissionState, setPermissionState] = useState<Record<string, Record<string, boolean>>>({});
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

  useEffect(() => {
    if (isOpen) {
      const initialState: Record<string, Record<string, boolean>> = {};
      SETUP_RESOURCES.forEach(resource => {
        initialState[resource] = {
          create: false,
          read: false,
          update: false,
          delete: false
        };
      });

      if (isEditMode && selectedRole) {
        selectedRole.role_permissions?.forEach((perm: any) => {
          if (initialState[perm.resource]) {
            initialState[perm.resource][perm.permission] = true;
          }
        });
      }

      setPermissionState(initialState);
    }
  }, [isOpen, isEditMode, selectedRole]);

  const handlePermissionChange = (resource: string, permission: PermissionType, checked: boolean) => {
    setPermissionState(prev => {
      const newState = { ...prev };
      
      if (checked && permission !== 'read') {
        newState[resource] = {
          ...newState[resource],
          [permission]: checked,
          read: true
        };
      }
      else if (!checked && permission === 'read') {
        newState[resource] = {
          create: false,
          read: false,
          update: false,
          delete: false
        };
      }
      else {
        newState[resource] = {
          ...newState[resource],
          [permission]: checked
        };
      }
      
      return newState;
    });
  };

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

      const permissions = [];
      for (const resource of SETUP_RESOURCES) {
        for (const permission of PERMISSIONS) {
          if (permissionState[resource]?.[permission]) {
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
      const { error: roleError } = await supabase
        .from('roles')
        .update({ name, description })
        .eq('id', selectedRole.id);

      if (roleError) throw roleError;

      const { error: deleteError } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', selectedRole.id);

      if (deleteError) throw deleteError;

      const permissions = [];
      for (const resource of SETUP_RESOURCES) {
        for (const permission of PERMISSIONS) {
          if (permissionState[resource]?.[permission]) {
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

  const getResourceDisplayName = (resource: string) => {
    return resource
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
                <Label>Setup Permissions</Label>
                <div className="mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Resource</TableHead>
                        <TableHead>Create</TableHead>
                        <TableHead>Read</TableHead>
                        <TableHead>Update</TableHead>
                        <TableHead>Delete</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {SETUP_RESOURCES.map(resource => (
                        <TableRow key={resource}>
                          <TableCell className="font-medium">
                            {getResourceDisplayName(resource)}
                          </TableCell>
                          {PERMISSIONS.map(permission => (
                            <TableCell key={`${resource}-${permission}`}>
                              <Checkbox
                                checked={permissionState[resource]?.[permission] || false}
                                onCheckedChange={(checked) => 
                                  handlePermissionChange(resource, permission, checked as boolean)
                                }
                                disabled={
                                  permission !== 'read' && 
                                  !permissionState[resource]?.['read']
                                }
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
