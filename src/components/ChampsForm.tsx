import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface Store {
  id: number;
  name: string;
  city: string;
}

const ChampsForm = () => {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [pic, setPic] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Mock stores data - in real app this would come from your store setup
  const stores: Store[] = [
    { id: 1, name: "Store A", city: "City A" },
    { id: 2, name: "Store B", city: "City B" },
  ];

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "CHAMPS Form Submitted",
      description: "Your evaluation has been saved successfully.",
    });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">CHAMPS Evaluation Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="store-search">Store</Label>
            <div className="relative">
              <Input
                id="store-search"
                placeholder="Search store..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-dashboard-dark border-dashboard-text/20"
              />
              <Select
                value={selectedStore}
                onValueChange={setSelectedStore}
              >
                <SelectTrigger className="mt-2 bg-dashboard-dark border-dashboard-text/20">
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {filteredStores.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name} - {store.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-dashboard-dark border-dashboard-text/20"
            />
          </div>

          <div>
            <Label htmlFor="pic">PIC (Person In Charge)</Label>
            <Input
              id="pic"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              placeholder="Enter PIC name"
              className="bg-dashboard-dark border-dashboard-text/20"
            />
          </div>
        </div>

        {/* Questions would be rendered here based on the setup */}
        <div className="space-y-4">
          {/* This is where the questions from SetupChamps would be rendered */}
        </div>

        <Button type="submit" className="w-full">
          Submit Evaluation
        </Button>
      </form>
    </div>
  );
};

export default ChampsForm;