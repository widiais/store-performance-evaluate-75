import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, UsersRound, Store, CheckCircle, XCircle, ShieldAlert, Shield, UserX, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { MontazUser, Role } from "@/types/auth";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";

const MontazUserManagement = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<MontazUser | null>(null);
  const [availableStores, setAvailableStores] = useState<any[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user: currentUser, isSuperAdmin } = useAuth();

  // Check if current user is the one viewing their incomplete profile
  const isCurrentUserViewing = () => {
    if (!currentUser || !currentUser.profile) return false;
    if (isSuperAdmin()) return false; // Super admin never needs profile completion
    return !!currentUser.profile?.montaz_id && !currentUser.profile.profile_completed;
  };

  // Fetch Montaz users
  const { data: montazUsers, isLoading: loadingUsers } = useQuery({
    queryKey: ['montaz-users'],
    queryFn: async () => {
      console.log('Fetching Montaz users...');
      
      // Improved query to properly detect montaz_id entries
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('montaz_id', 'is', null)
        .not('montaz_id', 'eq', '');  // This ensures we only get records with valid montaz_id values
      
      if (error) {
        console.error('Error fetching Montaz users:', error);
        throw error;
      }
      
      console.log('Montaz users data:', data);
      
      // Transform to MontazUser[] type and ensure assigned_stores is always an array of strings
      return data.map((profile: any) => ({
        id: profile.id,
        email: profile.email,
        montaz_id: profile.montaz_id,
        montaz_data: profile.montaz_data,
        role_id: profile.role_id,
        assigned_stores: profile.assigned_stores 
          ? Array.isArray(profile.assigned_stores) 
            ? profile.assigned_stores.map((store: any) => String(store))
            : []
          : [],
        profile_completed: profile.profile_completed || false,
        is_active: profile.is_active !== false, // Default to true if not specified
        created_at: profile.created_at,
        updated_at: profile.updated_at
      })) as MontazUser[];
    },
    refetchOnWindowFocus: true,
    refetchOnMount: true
  });

  // Fetch roles
  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      console.log('Fetching roles...');
      const { data, error } = await supabase
        .from('roles')
        .select('*');
      
      if (error) {
        console.error('Error fetching roles:', error);
        throw error;
      }
      
      console.log('Roles data:', data);
      return data as Role[];
    }
  });

  // Fetch stores
  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      console.log('Fetching stores...');
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city');
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      console.log('Stores data:', data);
      return data;
    }
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      roleId, 
      assignedStores, 
      isActive 
    }: { 
      userId: string, 
      roleId: string, 
      assignedStores: string[],
      isActive: boolean 
    }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          role_id: roleId,
          assigned_stores: assignedStores,
          profile_completed: true,
          is_active: isActive
        })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['montaz-users'] });
      toast({
        title: "Success",
        description: "User updated successfully",
        variant: "default",
      });
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle user active status
  const toggleUserStatus = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string, isActive: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['montaz-users'] });
      toast({
        title: "Success",
        description: `User ${variables.isActive ? 'enabled' : 'disabled'} successfully`,
        variant: "default",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  useEffect(() => {
    if (stores) {
      setAvailableStores(stores);
    }
  }, [stores]);

  useEffect(() => {
    if (selectedUser) {
      setSelectedRole(selectedUser.role_id || "");
      setSelectedStores(
        Array.isArray(selectedUser.assigned_stores) 
          ? selectedUser.assigned_stores.map(store => String(store))
          : []
      );
      setIsActive(selectedUser.is_active !== false); // Default to true if not specified
    } else {
      setSelectedRole("");
      setSelectedStores([]);
      setIsActive(true);
    }
  }, [selectedUser]);

  // Open dialog automatically if current user needs to complete profile
  useEffect(() => {
    if (isCurrentUserViewing() && currentUser && montazUsers) {
      const userProfile = montazUsers.find(user => user.id === currentUser.id);
      if (userProfile && !userProfile.profile_completed) {
        handleOpenDialog(userProfile);
      }
    }
  }, [currentUser, montazUsers]);

  // Log current data for debugging
  useEffect(() => {
    console.log('Current montaz users loaded:', montazUsers);
    console.log('Current user:', currentUser);
    console.log('Is current user viewing:', isCurrentUserViewing());
    
    // Check the database directly to see if there are any records with montaz_id
    const checkMontazUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, montaz_id')
        .not('montaz_id', 'is', null);
      
      console.log('Direct DB check for montaz users:', data, error);
    };
    
    checkMontazUsers();
  }, [montazUsers, currentUser]);

  const handleOpenDialog = (user: MontazUser) => {
    setSelectedUser(user);
    setIsOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Error",
        description: "Role selection is required",
        variant: "destructive",
      });
      return;
    }

    await updateUserMutation.mutateAsync({
      userId: selectedUser.id,
      roleId: selectedRole,
      assignedStores: selectedStores,
      isActive: isActive
    });
  };

  const handleToggleUserStatus = async (user: MontazUser) => {
    const newStatus = !user.is_active;
    await toggleUserStatus.mutateAsync({
      userId: user.id,
      isActive: newStatus
    });
  };

  const toggleStoreSelection = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  // Display Montaz data 
  const renderMontazData = (user: MontazUser) => {
    if (!user.montaz_data) return <span className="text-gray-500 text-sm">No Montaz data</span>;
    
    try {
      const data = typeof user.montaz_data === 'string' 
        ? JSON.parse(user.montaz_data) 
        : user.montaz_data;
        
      return (
        <div className="text-xs">
          {data.first_name && data.last_name && (
            <div>Name: {data.first_name} {data.last_name}</div>
          )}
          {data.position && <div>Position: {data.position}</div>}
          {data.employee_id && <div>Employee ID: {data.employee_id}</div>}
        </div>
      );
    } catch (e) {
      return <span className="text-gray-500 text-sm">Invalid Montaz data</span>;
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Montaz Users Management</h1>
          <Badge variant="outline" className="ml-2">
            <UsersRound className="h-4 w-4 mr-1" />
            {montazUsers?.length || 0} Users
          </Badge>
        </div>
      </div>

      {isCurrentUserViewing() && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-yellow-700">
            Your profile is incomplete. An administrator needs to assign you a role and access permissions before you can use the system.
          </p>
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Montaz User Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={selectedUser?.email || ""} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="montaz-id">Montaz ID</Label>
              <Input id="montaz-id" value={selectedUser?.montaz_id || ""} readOnly className="bg-gray-50" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
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
            <div className="flex items-center space-x-2">
              <Switch 
                id="user-active-status" 
                checked={isActive} 
                onCheckedChange={setIsActive} 
              />
              <Label htmlFor="user-active-status">
                User is {isActive ? 'active' : 'disabled'}
              </Label>
            </div>
            <div>
              <Label className="mb-2 block">Assigned Stores</Label>
              <ScrollArea className="h-48 border rounded-md p-2">
                {availableStores.length > 0 ? (
                  availableStores.map(store => (
                    <div key={store.id} className="flex items-center space-x-2 py-1">
                      <Checkbox 
                        id={`store-${store.id}`}
                        checked={selectedStores.includes(store.id.toString())}
                        onCheckedChange={() => toggleStoreSelection(store.id.toString())}
                      />
                      <label 
                        htmlFor={`store-${store.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {store.name} ({store.city})
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">No stores found</div>
                )}
              </ScrollArea>
            </div>
            <Button 
              onClick={handleUpdateUser} 
              className="w-full"
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {loadingUsers ? (
        <div className="flex justify-center my-8">
          <p>Loading users...</p>
        </div>
      ) : (
        <Table>
          <TableCaption>List of Montaz users in the system</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Montaz Info</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Assigned Stores</TableHead>
              <TableHead>Profile Status</TableHead>
              <TableHead>Account Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {montazUsers && montazUsers.length > 0 ? (
              montazUsers.map((user) => {
                // Find role name
                const userRole = roles?.find(role => role.id === user.role_id);
                
                return (
                  <TableRow key={user.id} className={!user.is_active ? "bg-gray-50 opacity-60" : ""}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{renderMontazData(user)}</TableCell>
                    <TableCell>{userRole?.name || 'Not assigned'}</TableCell>
                    <TableCell>
                      {user.assigned_stores && user.assigned_stores.length > 0 ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          <Store className="h-3 w-3 mr-1" />
                          {user.assigned_stores.length} stores
                        </Badge>
                      ) : (
                        <span className="text-gray-500 text-sm">No stores assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.profile_completed ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700">
                          <XCircle className="h-3 w-3 mr-1" />
                          Incomplete
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.is_active !== false ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          <ShieldAlert className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700">
                          <Shield className="h-3 w-3 mr-1" />
                          Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(user)}
                        >
                          {user.profile_completed ? 'Edit' : 'Complete Profile'}
                        </Button>
                        <Button
                          variant={user.is_active !== false ? "destructive" : "default"}
                          size="icon"
                          onClick={() => handleToggleUserStatus(user)}
                          title={user.is_active !== false ? "Disable user" : "Enable user"}
                        >
                          {user.is_active !== false ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No Montaz users found. {montazUsers === undefined ? "Error loading data." : "Try logging in with a Montaz account first."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default MontazUserManagement;
