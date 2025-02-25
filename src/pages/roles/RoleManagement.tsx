
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Shield, Pencil, Trash2, Info } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { menuSections } from "@/config/menuItems";
import type { Role, RolePermission } from "@/types/auth";

// Flatten menu items for permissions
const ALL_MENU_ITEMS = menuSections.flatMap(section => 
  section.items.map(item => ({
    resource: item.resource,
    label: item.label,
    section: section.title
  }))
).filter(item => item.resource);

interface RoleWithPermissions extends Role {
  role_permissions: RolePermission[] | null;
}

const RoleManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (*)
        `);
      
      if (error) throw error;
      return (data || []) as RoleWithPermissions[];
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const getPermissionSummary = (role: RoleWithPermissions) => {
    const permissions = role.role_permissions;
    
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return 'No permissions set';
    }
    
    const permissionsByResource = permissions.reduce((acc, perm) => {
      const menuItem = ALL_MENU_ITEMS.find(item => item.resource === perm.resource);
      if (!menuItem) return acc;
      
      const section = menuItem.section;
      if (!acc[section]) {
        acc[section] = [];
      }
      
      acc[section].push(menuItem.label);
      return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(permissionsByResource)
      .map(([section, items]) => `${section}:\n${items.join('\n')}`)
      .join('\n\n');
  };

  const handleCreateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({ 
          name, 
          description,
        })
        .select()
        .single();

      if (roleError) throw roleError;

      const permissionsToInsert = selectedPermissions.map(resource => ({
        role_id: role.id,
        resource,
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true
      }));

      if (permissionsToInsert.length > 0) {
        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionsToInsert);

        if (permError) throw permError;
      }

      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "Success",
        description: "Role created successfully",
      });
      setIsOpen(false);
      setSelectedPermissions([]);
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

    if (!selectedRole) return;

    try {
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
      const permissionsToInsert = selectedPermissions.map(resource => ({
        role_id: selectedRole.id,
        resource,
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true
      }));

      if (permissionsToInsert.length > 0) {
        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionsToInsert);

        if (permError) throw permError;
      }

      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      setIsOpen(false);
      setSelectedPermissions([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (roleId: string) => {
    await deleteMutation.mutateAsync(roleId);
  };

  const handleOpenDialog = (role?: RoleWithPermissions) => {
    if (role) {
      setIsEditMode(true);
      setSelectedRole(role);
      setSelectedPermissions(
        role.role_permissions?.map(p => p.resource) || []
      );
    } else {
      setIsEditMode(false);
      setSelectedRole(null);
      setSelectedPermissions([]);
    }
    setIsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Shield className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{isEditMode ? 'Edit Role' : 'Create New Role'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={isEditMode ? handleUpdateRole : handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Role Name</Label>
                  <Input 
                    id="name" 
                    name="name" 
                    required 
                    defaultValue={selectedRole?.name}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Input 
                    id="description" 
                    name="description" 
                    defaultValue={selectedRole?.description || ''}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Menu Permissions</Label>
                <ScrollArea className="h-[300px] border rounded-md p-4">
                  {menuSections.map((section) => (
                    <div key={section.title} className="mb-4">
                      <h3 className="font-medium mb-2">{section.title}</h3>
                      <div className="space-y-2">
                        {section.items.map((item) => item.resource && (
                          <div key={item.resource} className="flex items-center space-x-2">
                            <Checkbox
                              id={item.resource}
                              checked={selectedPermissions.includes(item.resource)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedPermissions(prev => [...prev, item.resource!]);
                                } else {
                                  setSelectedPermissions(prev => 
                                    prev.filter(p => p !== item.resource)
                                  );
                                }
                              }}
                            />
                            <label
                              htmlFor={item.resource}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
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
            <TableHead>Permissions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.description}</TableCell>
              <TableCell>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <pre className="text-xs whitespace-pre-wrap max-w-[300px]">
                        {getPermissionSummary(role)}
                      </pre>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleOpenDialog(role)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the role
                        and remove it from all users who have it assigned.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleDelete(role.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RoleManagement;
