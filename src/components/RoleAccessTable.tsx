
import { useMemo } from "react";
import { RolePermission, Role } from "@/types/auth";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Check, X } from "lucide-react";

interface RoleAccessTableProps {
  roles: Role[];
  permissions: Record<string, RolePermission[]>;
  resources: Record<string, string>;
}

export const RoleAccessTable = ({ roles, permissions, resources }: RoleAccessTableProps) => {
  const resourceKeys = useMemo(() => Object.keys(resources), [resources]);

  // Create a matrix of permissions for easy rendering
  const permissionMatrix = useMemo(() => {
    const matrix: Record<
      string,
      Record<string, { create: boolean; read: boolean; update: boolean; delete: boolean }>
    > = {};

    // Initialize matrix with all resources and roles
    roles.forEach((role) => {
      matrix[role.id] = {};
      resourceKeys.forEach((resource) => {
        matrix[role.id][resource] = {
          create: false,
          read: false,
          update: false,
          delete: false,
        };
      });
    });

    // Fill in permissions
    roles.forEach((role) => {
      const rolePermissions = permissions[role.id] || [];
      rolePermissions.forEach((permission) => {
        if (matrix[role.id] && matrix[role.id][permission.resource]) {
          matrix[role.id][permission.resource].create = permission.can_create || false;
          matrix[role.id][permission.resource].read = permission.can_read || false;
          matrix[role.id][permission.resource].update = permission.can_update || false;
          matrix[role.id][permission.resource].delete = permission.can_delete || false;
        }
      });
    });

    return matrix;
  }, [roles, permissions, resourceKeys]);

  return (
    <Table>
      <TableCaption>Role Access Matrix</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Resource</TableHead>
          {roles.map((role) => (
            <TableHead key={role.id} colSpan={4} className="text-center">
              {role.name}
            </TableHead>
          ))}
        </TableRow>
        <TableRow>
          <TableHead></TableHead>
          {roles.map((role) => (
            <React.Fragment key={`permissions-${role.id}`}>
              <TableHead className="text-center w-10">C</TableHead>
              <TableHead className="text-center w-10">R</TableHead>
              <TableHead className="text-center w-10">U</TableHead>
              <TableHead className="text-center w-10">D</TableHead>
            </React.Fragment>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {resourceKeys.map((resource) => (
          <TableRow key={resource}>
            <TableCell className="font-medium">{resources[resource]}</TableCell>
            {roles.map((role) => {
              const perms = permissionMatrix[role.id]?.[resource] || {
                create: false,
                read: false,
                update: false,
                delete: false,
              };
              return (
                <React.Fragment key={`${resource}-${role.id}`}>
                  <TableCell className="text-center">
                    {perms.create ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-red-500" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {perms.read ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-red-500" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {perms.update ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-red-500" />}
                  </TableCell>
                  <TableCell className="text-center">
                    {perms.delete ? <Check className="h-4 w-4 mx-auto text-green-500" /> : <X className="h-4 w-4 mx-auto text-red-500" />}
                  </TableCell>
                </React.Fragment>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
