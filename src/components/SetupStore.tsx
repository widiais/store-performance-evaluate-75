
import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { ArrowUpDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Store {
  id: number;
  name: string;
  city: string;
  cogs_target: number;
  regional: number;
  area: number;
  total_crew: number;
  created_at: string;
  updated_at: string;
}

const SetupStore = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Store | null;
    direction: "ascending" | "descending";
  }>({ key: null, direction: "ascending" });

  const queryClient = useQueryClient();

  // Fetch stores
  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*');
      
      if (error) throw error;
      return data || [];
    },
  });

  // Add store mutation
  const addStoreMutation = useMutation({
    mutationFn: async (newStore: Omit<Store, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('stores')
        .insert([newStore])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({
        title: "Store Added",
        description: "New store has been successfully added.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add store: " + error.message,
        variant: "destructive",
      });
    },
  });

  // Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: async (store: Store) => {
      const { data, error } = await supabase
        .from('stores')
        .update(store)
        .eq('id', store.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({
        title: "Store Updated",
        description: "Store information has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update store: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleSort = (key: keyof Store) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    });
  };

  const filteredAndSortedStores = useMemo(() => {
    let filtered = stores.filter((store) =>
      Object.values(store).some((value) =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [stores, searchTerm, sortConfig]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const storeData = {
      name: formData.get('name') as string,
      city: formData.get('city') as string,
      cogs_target: parseFloat(formData.get('cogs_target') as string),
      regional: parseInt(formData.get('regional') as string),
      area: parseInt(formData.get('area') as string),
      total_crew: parseInt(formData.get('total_crew') as string),
    };

    if (isEditing && currentStore) {
      await updateStoreMutation.mutateAsync({ ...storeData, id: currentStore.id, created_at: currentStore.created_at, updated_at: currentStore.updated_at });
    } else {
      await addStoreMutation.mutateAsync(storeData);
    }
    
    setCurrentStore(null);
  };

  const handleEdit = (store: Store) => {
    setCurrentStore(store);
    setIsEditing(true);
  };

  const StoreForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Store' : 'Add New Store'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Update store information below.' : 'Fill in the store details below.'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 p-4 bg-dashboard-card rounded-lg">
        <div className="space-y-2">
          <Label htmlFor="name">Store Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={currentStore?.name}
            className="bg-dashboard-dark border-dashboard-text/20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            name="city"
            defaultValue={currentStore?.city}
            className="bg-dashboard-dark border-dashboard-text/20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cogs_target">COGS Target (%)</Label>
          <Input
            id="cogs_target"
            name="cogs_target"
            type="number"
            step="0.01"
            min="0"
            max="100"
            defaultValue={currentStore?.cogs_target}
            className="bg-dashboard-dark border-dashboard-text/20"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="regional">Regional</Label>
          <Select name="regional" defaultValue={currentStore?.regional?.toString()}>
            <SelectTrigger className="bg-dashboard-dark border-dashboard-text/20">
              <SelectValue placeholder="Select Regional" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Area</Label>
          <Select name="area" defaultValue={currentStore?.area?.toString()}>
            <SelectTrigger className="bg-dashboard-dark border-dashboard-text/20">
              <SelectValue placeholder="Select Area" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="total_crew">Total Crew</Label>
          <Input
            id="total_crew"
            name="total_crew"
            type="number"
            min="0"
            defaultValue={currentStore?.total_crew}
            className="bg-dashboard-dark border-dashboard-text/20"
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full">
        {isEditing ? 'Update Store' : 'Add Store'}
      </Button>
    </form>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Store Setup</h2>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dashboard-muted h-4 w-4" />
            <Input
              placeholder="Search stores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-dashboard-dark border-dashboard-text/20"
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setIsEditing(false);
                setCurrentStore(null);
              }}>
                Add Store
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dashboard-dark text-dashboard-text">
              <StoreForm />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
              Store Name <ArrowUpDown className="inline h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('city')} className="cursor-pointer">
              City <ArrowUpDown className="inline h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('cogs_target')} className="cursor-pointer">
              COGS Target <ArrowUpDown className="inline h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('regional')} className="cursor-pointer">
              Regional <ArrowUpDown className="inline h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('area')} className="cursor-pointer">
              Area <ArrowUpDown className="inline h-4 w-4" />
            </TableHead>
            <TableHead onClick={() => handleSort('total_crew')} className="cursor-pointer">
              Total Crew <ArrowUpDown className="inline h-4 w-4" />
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedStores.map((store) => (
            <TableRow key={store.id}>
              <TableCell>{store.name}</TableCell>
              <TableCell>{store.city}</TableCell>
              <TableCell>{store.cogs_target}%</TableCell>
              <TableCell>{store.regional}</TableCell>
              <TableCell>{store.area}</TableCell>
              <TableCell>{store.total_crew}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => handleEdit(store)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-dashboard-dark text-dashboard-text">
                    <StoreForm />
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SetupStore;
