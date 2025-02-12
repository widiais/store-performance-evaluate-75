import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  opex_target: number;
  regional: number;
  area: number;
  total_crew: number;
  avg_cu_per_day: number;
  created_at: string;
  updated_at: string;
}

const SetupStore = () => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Store | null;
    direction: "ascending" | "descending";
  }>({ key: null, direction: "ascending" });

  const queryClient = useQueryClient();

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

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
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add store: " + error.message,
        variant: "destructive",
      });
    },
  });

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
      setDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update store: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      toast({
        title: "Success",
        description: "Store has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete store. Please try again.",
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
    const filtered = stores.filter((store) =>
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
      opex_target: parseFloat(formData.get('opex_target') as string),
      regional: parseInt(formData.get('regional') as string),
      area: parseInt(formData.get('area') as string),
      total_crew: parseInt(formData.get('total_crew') as string),
      avg_cu_per_day: parseInt(formData.get('avg_cu_per_day') as string),
    };

    if (isEditing && currentStore) {
      await updateStoreMutation.mutateAsync({ 
        ...storeData, 
        id: currentStore.id, 
        created_at: currentStore.created_at, 
        updated_at: currentStore.updated_at 
      });
    } else {
      await addStoreMutation.mutateAsync(storeData);
    }
    
    setCurrentStore(null);
    setIsEditing(false);
  };

  const handleEdit = (store: Store) => {
    setCurrentStore(store);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus toko ini?')) {
      await deleteStoreMutation.mutateAsync(id);
    }
  };

  const handleAddNew = () => {
    setCurrentStore(null);
    setIsEditing(false);
    setDialogOpen(true);
  };

  const StoreForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{isEditing ? 'Edit Store' : 'Add New Store'}</DialogTitle>
        <DialogDescription>
          {isEditing ? 'Update store information below.' : 'Fill in the store details below.'}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={currentStore?.name}
              className="bg-white border-gray-200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city"
              defaultValue={currentStore?.city}
              className="bg-white border-gray-200"
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
              className="bg-white border-gray-200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="opex_target">OPEX Target (%)</Label>
            <Input
              id="opex_target"
              name="opex_target"
              type="number"
              step="0.01"
              min="0"
              max="100"
              defaultValue={currentStore?.opex_target}
              className="bg-white border-gray-200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="regional">Regional</Label>
            <Input
              id="regional"
              name="regional"
              type="number"
              min="1"
              defaultValue={currentStore?.regional}
              className="bg-white border-gray-200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Input
              id="area"
              name="area"
              type="number"
              min="1"
              defaultValue={currentStore?.area}
              className="bg-white border-gray-200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_crew">Total Crew</Label>
            <Input
              id="total_crew"
              name="total_crew"
              type="number"
              min="0"
              defaultValue={currentStore?.total_crew}
              className="bg-white border-gray-200"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="avg_cu_per_day">Average Customer per Day</Label>
            <Input
              id="avg_cu_per_day"
              name="avg_cu_per_day"
              type="number"
              min="0"
              defaultValue={currentStore?.avg_cu_per_day}
              className="bg-white border-gray-200"
              required
            />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update Store' : 'Add Store'}
        </Button>
      </div>
    </form>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">Setup Store</h2>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search stores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-white border-gray-200"
              />
            </div>
            <Button onClick={handleAddNew}>
              Add Store
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
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
                  <TableHead onClick={() => handleSort('opex_target')} className="cursor-pointer">
                    OPEX Target <ArrowUpDown className="inline h-4 w-4" />
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
                  <TableHead onClick={() => handleSort('avg_cu_per_day')} className="cursor-pointer">
                    Avg. Customer/Day <ArrowUpDown className="inline h-4 w-4" />
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedStores.map((store) => (
                  <TableRow key={store.id}>
                    <TableCell className="font-medium">{store.name}</TableCell>
                    <TableCell>{store.city}</TableCell>
                    <TableCell>{store.cogs_target}%</TableCell>
                    <TableCell>{store.opex_target}%</TableCell>
                    <TableCell>{store.regional}</TableCell>
                    <TableCell>{store.area}</TableCell>
                    <TableCell>{store.total_crew}</TableCell>
                    <TableCell>{store.avg_cu_per_day}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(store)}
                          className="border-gray-200"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(store.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <StoreForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SetupStore;
