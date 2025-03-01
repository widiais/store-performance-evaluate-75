
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { MontazUser, Role } from "@/types/auth";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

const MontazUserManagement = () => {
  const [montazUsers, setMontazUsers] = useState<MontazUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<MontazUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMontazUsers();
    fetchRoles();
    fetchStores();
  }, []);

  const fetchMontazUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('montaz_id', 'is', null);

      if (error) throw error;
      setMontazUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching Montaz users:', error.message);
      toast({
        title: "Error",
        description: "Failed to fetch Montaz users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('*');

      if (error) throw error;
      setRoles(data || []);
    } catch (error: any) {
      console.error('Error fetching roles:', error.message);
    }
  };

  const fetchStores = async () => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*');

      if (error) throw error;
      setStores(data || []);
    } catch (error: any) {
      console.error('Error fetching stores:', error.message);
    }
  };

  const handleEditUser = (user: MontazUser) => {
    setSelectedUser(user);
    setSelectedRole(user.role_id || null);
    setSelectedStores(user.assigned_stores || []);
    setIsDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role_id: selectedRole,
          assigned_stores: selectedStores,
          profile_completed: true
        })
        .eq('id', selectedUser.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Montaz user updated successfully",
      });

      setIsDialogOpen(false);
      fetchMontazUsers();
    } catch (error: any) {
      console.error('Error updating Montaz user:', error.message);
      toast({
        title: "Error",
        description: `Failed to update Montaz user: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleStoreChange = (storeId: string) => {
    setSelectedStores(prev => {
      if (prev.includes(storeId)) {
        return prev.filter(id => id !== storeId);
      } else {
        return [...prev, storeId];
      }
    });
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Montaz Users Management</CardTitle>
          <CardDescription>
            Manage users who signed in via Montaz integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Montaz ID</TableHead>
                  <TableHead>Profile Completed</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned Stores</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {montazUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.montaz_id}</TableCell>
                    <TableCell>
                      {user.profile_completed ? (
                        <Badge variant="success" className="bg-green-500">
                          <Check className="h-4 w-4 mr-1" /> Completed
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <X className="h-4 w-4 mr-1" /> Incomplete
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {roles.find(r => r.id === user.role_id)?.name || "Not Assigned"}
                    </TableCell>
                    <TableCell>
                      {user.assigned_stores?.length || 0} stores
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {montazUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      No Montaz users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Montaz User</DialogTitle>
            <DialogDescription>
              Update role and store access for this Montaz user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={selectedUser.email}
                  className="col-span-3"
                  disabled
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={selectedRole || ""}
                  onValueChange={setSelectedRole}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Assigned Stores
                </Label>
                <div className="col-span-3 space-y-2 max-h-[200px] overflow-y-auto border rounded p-2">
                  {stores.map((store) => (
                    <div key={store.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`store-${store.id}`}
                        checked={selectedStores.includes(store.id.toString())}
                        onCheckedChange={() => handleStoreChange(store.id.toString())}
                      />
                      <Label htmlFor={`store-${store.id}`}>
                        {store.name} ({store.city})
                      </Label>
                    </div>
                  ))}
                  {stores.length === 0 && (
                    <p className="text-sm text-gray-500">No stores available</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MontazUserManagement;
