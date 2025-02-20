
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

type UserRole = 'admin' | 'manager' | 'supervisor' | 'staff';

const RESOURCES = {
  'setup-store': 'Store Setup',
  'setup-champs': 'CHAMPS Setup',
  'setup-cleanliness': 'Cleanliness Setup',
  'setup-service': 'Service Setup',
  'setup-product-quality': 'Product Quality Setup',
  'setup-complain': 'Complaint Setup'
};

const ROLE_LEVELS: { value: UserRole; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'staff', label: 'Staff' }
];

interface RolePermission {
  resource: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  role_level: UserRole;
  role_permissions: RolePermission[];
}

const RoleManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { toast } = useToast();

  const { data: roles, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            resource,
            can_create,
            can_read,
            can_update,
            can_delete
          )
        `)
        .order('role_level');
      
      if (error) throw error;
      return data as Role[];
    }
  });

  const handleCreateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const roleLevel = formData.get('roleLevel') as UserRole;

    try {
      const { data: role, error: roleError } = await supabase
        .from('roles')
        .insert({ 
          name, 
          description,
          role_level: roleLevel
        })
        .select()
        .single();

      if (roleError) throw roleError;

      // Insert default permissions based on role level
      const permissions = Object.keys(RESOURCES).map(resource => ({
        role_id: role.id,
        resource,
        can_create: roleLevel === 'admin' || (roleLevel === 'manager' && ['setup-store', 'setup-champs', 'setup-cleanliness'].includes(resource)),
        can_read: true,
        can_update: roleLevel === 'admin' || 
                   (roleLevel === 'manager' && ['setup-store', 'setup-champs', 'setup-cleanliness'].includes(resource)) ||
                   (roleLevel === 'supervisor' && ['setup-cleanliness', 'setup-service'].includes(resource)),
        can_delete: roleLevel === 'admin' || (roleLevel === 'manager' && ['setup-store', 'setup-champs'].includes(resource))
      }));

      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(permissions);
      
      if (permError) throw permError;

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

    if (!selectedRole) return;

    try {
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
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPermissionSummary = (permissions: RolePermission[]) => {
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
      .map(([resource, perms]) => `${RESOURCES[resource as keyof typeof RESOURCES]}: ${perms.join('')}`)
      .join('\n');
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
          {roles?.map((role) => (
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
                        {getPermissionSummary(role.role_permissions)}
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
    </div>
  );
};

export default RoleManagement;
