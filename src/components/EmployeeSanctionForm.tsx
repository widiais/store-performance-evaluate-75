
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface Store {
  id: number;
  name: string;
  city: string;
}

interface StoreSelectProps {
  selectedStore: Store | null;
  onStoreSelect: (store: Store | null) => void;
  stores: Store[];
}

const StoreSelect = ({ selectedStore, onStoreSelect, stores }: StoreSelectProps) => {
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    if (selectedStore) {
      setSearchValue(`${selectedStore.name} - ${selectedStore.city}`);
    } else {
      setSearchValue("");
    }
  }, [selectedStore]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);

    if (!value.trim()) {
      onStoreSelect(null);
      return;
    }

    const storeMatch = stores.find(
      store => `${store.name} - ${store.city}` === value
    );

    if (storeMatch) {
      onStoreSelect(storeMatch);
    }
  };

  const storeOptions = useMemo(() => {
    return stores.map(store => ({
      value: `${store.name} - ${store.city}`,
      store: store
    }));
  }, [stores]);

  return (
    <div className="relative w-full">
      <Input
        type="text"
        list="store-list"
        value={searchValue}
        onChange={handleInputChange}
        placeholder="Select or type store name..."
        className="w-full"
      />
      <datalist id="store-list">
        {storeOptions.map(({ value }, index) => (
          <option key={index} value={value} />
        ))}
      </datalist>
    </div>
  );
};

interface SanctionEntry {
  employee_name: string;
  sanction_type: string;
  duration_months: number;
  violation_details: string;
  submitted_by: string;
}

const EmployeeSanctionForm = () => {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [pic, setPic] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entries, setEntries] = useState<SanctionEntry[]>([{
    employee_name: "",
    sanction_type: "",
    duration_months: 1,
    violation_details: "",
    submitted_by: "",
  }]);

  const { data: stores = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleEntryChange = (index: number, field: keyof SanctionEntry, value: string | number) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value
    };
    setEntries(newEntries);
  };

  const addEntry = () => {
    setEntries([...entries, {
      employee_name: "",
      sanction_type: "",
      duration_months: 1,
      violation_details: "",
      submitted_by: "",
    }]);
  };

  const removeEntry = (index: number) => {
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStore || !date || !pic) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    if (entries.some(entry => 
      !entry.employee_name || 
      !entry.sanction_type || 
      !entry.violation_details || 
      !entry.submitted_by
    )) {
      toast({
        title: "Validation Error",
        description: "Please fill in all entry fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const sanctions = entries.map(entry => ({
        store_id: selectedStore.id,
        sanction_date: date,
        pic: pic,
        ...entry
      }));

      const { error } = await supabase
        .from('employee_sanctions')
        .insert(sanctions);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Sanctions have been recorded successfully.",
      });

      // Reset form
      setSelectedStore(null);
      setDate(format(new Date(), "yyyy-MM-dd"));
      setPic("");
      setEntries([{
        employee_name: "",
        sanction_type: "",
        duration_months: 1,
        violation_details: "",
        submitted_by: "",
      }]);
    } catch (error) {
      console.error('Error submitting sanctions:', error);
      toast({
        title: "Error",
        description: "Failed to submit sanctions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          Employee Sanction Form
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div>
            <Label htmlFor="store" className="text-gray-700 mb-1.5 block">
              Store
            </Label>
            <StoreSelect
              selectedStore={selectedStore}
              onStoreSelect={setSelectedStore}
              stores={stores}
            />
          </div>

          <div>
            <Label htmlFor="date" className="text-gray-700 mb-1.5 block">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="pic" className="text-gray-700 mb-1.5 block">PIC</Label>
            <Input
              id="pic"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              placeholder="Enter PIC name"
            />
          </div>
        </div>

        <div className="space-y-4">
          {entries.map((entry, index) => (
            <div key={index} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`employee_name_${index}`}>Employee Name</Label>
                    <Input
                      id={`employee_name_${index}`}
                      value={entry.employee_name}
                      onChange={(e) => handleEntryChange(index, 'employee_name', e.target.value)}
                      placeholder="Enter employee name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`sanction_type_${index}`}>Sanction Type</Label>
                    <Select
                      value={entry.sanction_type}
                      onValueChange={(value) => handleEntryChange(index, 'sanction_type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sanction type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Peringatan Tertulis">Peringatan Tertulis</SelectItem>
                        <SelectItem value="SP1">SP1</SelectItem>
                        <SelectItem value="SP2">SP2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor={`duration_${index}`}>Duration (months)</Label>
                  <Input
                    id={`duration_${index}`}
                    type="number"
                    min="1"
                    value={entry.duration_months}
                    onChange={(e) => handleEntryChange(index, 'duration_months', parseInt(e.target.value))}
                  />
                </div>

                <div>
                  <Label htmlFor={`violation_${index}`}>Violation Details</Label>
                  <Input
                    id={`violation_${index}`}
                    value={entry.violation_details}
                    onChange={(e) => handleEntryChange(index, 'violation_details', e.target.value)}
                    placeholder="Enter violation details"
                  />
                </div>

                <div>
                  <Label htmlFor={`submitted_by_${index}`}>Submit By</Label>
                  <Input
                    id={`submitted_by_${index}`}
                    value={entry.submitted_by}
                    onChange={(e) => handleEntryChange(index, 'submitted_by', e.target.value)}
                    placeholder="Enter submitter name"
                  />
                </div>

                {entries.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => removeEntry(index)}
                  >
                    Remove Entry
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={addEntry}
          >
            Add Another Entry
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Sanctions'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeSanctionForm;
