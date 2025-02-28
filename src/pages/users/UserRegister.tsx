
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Users, Search } from "lucide-react";
import { Profile, Role } from "@/types/auth";
import { ScrollArea } from "@/components/ui/scroll-area";

const UserRegister = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: users, isLoading } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      console.log("Fetching all users for User Register page...");
      // Fetch all profiles from the profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        throw profilesError;
      }

      console.log("Fetched profiles:", profiles);
      
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
              console.log(`No role found for profile ${profile.id}`);
              return { ...profile, roles: null };
            }
            
            return { ...profile, roles: roleData as Role };
          }
          return { ...profile, roles: null };
        })
      );

      console.log("Profiles with roles:", profilesWithRoles);
      return profilesWithRoles as Profile[];
    }
  });

  // Filter users based on search query
  const filteredUsers = users?.filter(user => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.roles?.name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">User Register</h1>
          <Badge variant="outline" className="ml-2">
            <Users className="h-4 w-4 mr-1" />
            {users?.length || 0} Registered Users
          </Badge>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-8 w-[250px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center my-8">
          <p>Loading users...</p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)]">
          <Table>
            <TableCaption>Complete list of registered users</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className={user.is_active === false ? "bg-gray-100" : ""}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.roles?.name || 'No role'}</TableCell>
                    <TableCell>
                      {user.is_active === false ? (
                        <Badge variant="destructive">Inactive</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <UserCheck className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    {searchQuery ? "No users found matching your search" : "No users found"}
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

export default UserRegister;
