
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
import { Shield, Pencil, Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RolePermission } from "@/integrations/supabase/client-types";
import { mapToRole, mapToRolePermission } from "@/utils/typeUtils";
import { RoleAccessTable } from "@/components/RoleAccessTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type UserRole = 'admin' | 'manager' | 'supervisor' | 'staff';

interface Role {
  id: string;
  name: string;
  description?: string;
  role_level: UserRole;
  created_at?: string;
  updated_at?: string;
}

interface RoleWithPermissions extends Role {
  role_permissions: RolePermission[];
}

const RESOURCES = {
  // Main menus
  'dashboard': 'Dashboard',
  'store-performance': 'Store Performance',
  
  // Company Policy
  'users': 'User Management',
  'roles': 'Role Management',
  
  // Setup menus
  'setup-store': 'Store Setup',
  'setup-champs': 'CHAMPS Setup',
  'setup-cleanliness': 'Cleanliness Setup',
  'setup-service': 'Service Setup',
  'setup-product-quality': 'Product Quality Setup',
  'setup-complain': 'Complaint Setup',
  
  // Forms
  'champs-form': 'CHAMPS Form',
  'cleanliness-form': 'Cleanliness Form',
  'service-form': 'Service Form',
  'product-quality-form': 'Product Quality Form',
  'esp-form': 'ESP Form',
  'finance-form': 'Finance Form',
  'complaint-form': 'Complaint Form',
  'employee-sanction-form': 'Employee Sanction Form',
  
  // Reports
  'champs-report': 'CHAMPS Report',
  'cleanliness-report': 'Cleanliness Report',
  'service-report': 'Service Report',
  'product-quality-report': 'Product Quality Report',
  'esp-report': 'ESP Report',
  'finance-report': 'Finance Report',
  'complaint-report': 'Complaint Report',
  'sanction-report': 'Sanction Report',
  'workplace-report': 'Workplace Report'
};

const ROLE_LEVELS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'staff', label: 'Staff' }
];

const RoleManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);
  const [activeTab, setActiveTab] = useState<string>("list");
  const { toast } = useToast();

  const { data: roles = [], isLoading, isError, refetch } = useQuery<RoleWithPermissions[]>({
    queryKey: ['roles'],
    queryFn: async () => {
      // Fetch roles
      const { data: rolesData, error: roleError } = await supabase
        .from('roles')
        .select('*');
      
      if (roleError) throw roleError;
      
      const mappedRoles: Role[] = rolesData.map(role => mapToRole(role));
      
      // For each role, fetch permissions
      const rolesWithPermissions: RoleWithPermissions[] = await Promise.all(
        mappedRoles.map(async (role) => {
          const { data: permissions, error: permError } = await supabase
            .from('role_permissions')
            .select('*')
            .eq('role_id', role.id);
            
          if (permError) {
            console.error("Error fetching permissions:", permError);
            return { ...role, role_permissions: [] };
          }
          
          const mappedPermissions = permissions.map(perm => mapToRolePermission(perm));
          return { ...role, role_permissions: mappedPermissions };
        })
      );

      return rolesWithPermissions;
    }
  });

  // Organize permissions by role
  const permissionsByRole = roles.reduce((acc, role) => {
    acc[role.id] = role.role_permissions || [];
    return acc;
  }, {} as Record<string, RolePermission[]>);

  const getPermissionSummary = (role: RoleWithPermissions) => {
    const permissions = role.role_permissions;
    
    if (!permissions || !Array.isArray(permissions) || permissions.length === 0) {
      return 'No permissions set';
    }
    
    try {
      const summary = permissions.reduce((acc, perm) => {
        if (!acc[perm.resource]) {
          acc[perm.resource] = [];
        }
        if (perm.can_create) acc[perm.resource].push('C');
        if (perm.can_read) acc[perm.resource].push('R');
        if (perm.can_update) acc[perm.resource].push('U');
        if (perm.can_delete) acc[perm.resource].push('D');
        return acc;
      }, {} as Record<string, string[]>);

      return Object.entries(summary)
        .map(([resource, perms]) => `${RESOURCES[resource as keyof typeof RESOURCES] || resource}: ${perms.sort().join('')}`)
        .join('\n');
    } catch (error) {
      console.error('Error processing permissions:', error);
      return 'Error processing permissions';
    }
  };

  const handleCreateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const roleLevel = formData.get('roleLevel') as UserRole;

    try {
      // Insert the role
      const { data: newRole, error: roleError } = await supabase
        .from('roles')
        .insert({ 
          name, 
          description,
          role_level: roleLevel
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Prepare permissions to insert
      const permissionsToInsert = Object.keys(RESOURCES).map(resource => ({
        role_id: newRole.id,
        resource,
        can_create: roleLevel === 'admin' || 
                   (roleLevel === 'manager' && ['setup-store', 'setup-champs', 'setup-cleanliness'].includes(resource)),
        can_read: true,
        can_update: roleLevel === 'admin' || 
                   (roleLevel === 'manager' && ['setup-store', 'setup-champs', 'setup-cleanliness'].includes(resource)) ||
                   (roleLevel === 'supervisor' && ['setup-cleanliness', 'setup-service'].includes(resource)),
        can_delete: roleLevel === 'admin' || 
                   (roleLevel === 'manager' && ['setup-store', 'setup-champs'].includes(resource))
      }));

      // Insert permissions
      for (const permission of permissionsToInsert) {
        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permission);

        if (permError) {
          console.error("Error inserting permission:", permError);
        }
      }

      toast({
        title: "Success",
        description: "Role created successfully",
      });
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Error creating role:", error);
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
      // Update the role
      const { error: roleError } = await supabase
        .from('roles')
        .update({ name, description })
        .eq('id', selectedRole.id);

      if (roleError) throw roleError;

      toast({
        title: "Success",
        description: "Role updated successfully",
      });
      setIsOpen(false);
      refetch();
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-600">
        Error loading roles
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <div className="space-x-4 flex items-center">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Role List</TabsTrigger>
              <TabsTrigger value="matrix">Access Matrix</TabsTrigger>
            </TabsList>
          </Tabs>
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
            <DialogContent>
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
                    defaultValue={selectedRole?.description || ''}
                  />
                </div>
                {!isEditMode && (
                  <div>
                    <Label htmlFor="roleLevel">Role Level</Label>
                    <Select name="roleLevel" required defaultValue="staff">
                      <SelectTrigger>
                        <SelectValue placeholder="Select role level" />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <Button type="submit" className="w-full">
                  {isEditMode ? 'Update Role' : 'Create Role'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <TabsContent value="list" className="mt-0">
        <Table>
          <TableCaption>List of roles</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell className="capitalize">{role.role_level}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Info className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <pre className="text-xs whitespace-pre-wrap">
                          {getPermissionSummary(role)}
                        </pre>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="matrix" className="mt-0">
        <div className="rounded-md border">
          <RoleAccessTable
            roles={roles}
            permissions={permissionsByRole}
            resources={RESOURCES}
          />
        </div>
      </TabsContent>
    </div>
  );
};

export default RoleManagement;
