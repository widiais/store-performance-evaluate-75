import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Store {
  id: number;
  name: string;
  city: string;
  cogsTarget: number;
  regional: number;
  area: number;
  totalCrew: number;
}

const SetupStore = () => {
  const { toast } = useToast();
  const [stores, setStores] = useState<Store[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newStore = {
      id: currentStore?.id || stores.length + 1,
      name: formData.get('name') as string,
      city: formData.get('city') as string,
      cogsTarget: parseFloat(formData.get('cogsTarget') as string),
      regional: parseInt(formData.get('regional') as string),
      area: parseInt(formData.get('area') as string),
      totalCrew: parseInt(formData.get('totalCrew') as string),
    };

    if (isEditing) {
      setStores(stores.map(store => store.id === currentStore?.id ? newStore : store));
      toast({
        title: "Store Updated",
        description: "Store information has been successfully updated.",
      });
    } else {
      setStores([...stores, newStore]);
      toast({
        title: "Store Added",
        description: "New store has been successfully added.",
      });
    }
    setCurrentStore(null);
  };

  const handleEdit = (store: Store) => {
    setCurrentStore(store);
    setIsEditing(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Store Setup</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setIsEditing(false);
              setCurrentStore(null);
            }}>
              Add Store
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Store' : 'Add New Store'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Store Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={currentStore?.name}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={currentStore?.city}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cogsTarget">COGS Target (%)</Label>
                <Input
                  id="cogsTarget"
                  name="cogsTarget"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  defaultValue={currentStore?.cogsTarget}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regional">Regional</Label>
                <Select name="regional" defaultValue={currentStore?.regional?.toString()}>
                  <SelectTrigger>
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
                  <SelectTrigger>
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
                <Label htmlFor="totalCrew">Total Crew</Label>
                <Input
                  id="totalCrew"
                  name="totalCrew"
                  type="number"
                  min="0"
                  defaultValue={currentStore?.totalCrew}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {isEditing ? 'Update Store' : 'Add Store'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Store Name</TableHead>
            <TableHead>City</TableHead>
            <TableHead>COGS Target</TableHead>
            <TableHead>Regional</TableHead>
            <TableHead>Area</TableHead>
            <TableHead>Total Crew</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores.map((store) => (
            <TableRow key={store.id}>
              <TableCell>{store.name}</TableCell>
              <TableCell>{store.city}</TableCell>
              <TableCell>{store.cogsTarget}%</TableCell>
              <TableCell>{store.regional}</TableCell>
              <TableCell>{store.area}</TableCell>
              <TableCell>{store.totalCrew}</TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" onClick={() => handleEdit(store)}>
                      Edit
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Store</DialogTitle>
                    </DialogHeader>
                    {/* Form content is reused from above */}
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