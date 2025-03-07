
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash, Save, X, Ban } from "lucide-react";
import filter from 'lodash/filter';

interface Store {
  id: number;
  name: string;
  city: string;
}

interface Finding {
  id?: number;
  finding: string;
  deduction_points: number;
}

interface Question {
  id: number;
  question: string;
  points: number;
  status: 'cross' | 'exclude' | 'include';
}

interface ESPFormProps {
  selectedStore: Store | null;
  setSelectedStore: React.Dispatch<React.SetStateAction<Store | null>>;
  stores: Store[];
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  pic: string;
  setPic: React.Dispatch<React.SetStateAction<string>>;
  findings: Finding[];
  setFindings: React.Dispatch<React.SetStateAction<Finding[]>>;
  isSubmitting: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  scores: {
    initialTotal: number;
    adjustedTotal: number;
    earnedPoints: number;
    kpiScore: number;
  };
  questions: Question[];
  handleQuestionStatusChange: (id: number, status: 'cross' | 'exclude' | 'include') => void;
}

const StoreSelect = ({ selectedStore, onStoreSelect, stores }: { selectedStore: Store | null; onStoreSelect: (store: Store | null) => void; stores: Store[] }) => {
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

  return (
    <div className="relative w-full">
      <Input
        type="text"
        list="store-list"
        value={searchValue}
        onChange={handleInputChange}
        placeholder="Select or type store name..."
        className="w-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
      />
      <datalist id="store-list">
        {stores.map((store) => (
          <option key={store.id} value={`${store.name} - ${store.city}`} />
        ))}
      </datalist>
    </div>
  );
};

const ESPForm = () => {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [pic, setPic] = useState<string>("");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scores, setScores] = useState({
    initialTotal: 0,
    adjustedTotal: 0,
    earnedPoints: 0,
    kpiScore: 0,
  });
  const [questions, setQuestions] = useState<Question[]>([]);

  const { data: stores = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const totalDeductions = findings.reduce((sum, finding) => sum + finding.deduction_points, 0);
  const finalScore = 100 - totalDeductions;
  const kpiScore = (finalScore / 100) * 4;

  const handleAddFinding = () => {
    setFindings([...findings, { finding: "", deduction_points: 0 }]);
  };

  const handleRemoveFinding = (index: number) => {
    setFindings(findings.filter((_, i) => i !== index));
  };

  const handleFindingChange = (index: number, field: keyof Finding, value: string | number) => {
    const newFindings = [...findings];
    newFindings[index] = {
      ...newFindings[index],
      [field]: field === 'deduction_points' ? parseFloat(value as string) || 0 : value,
    };
    setFindings(newFindings);
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

    setIsSubmitting(true);
    try {
      // Insert ESP evaluation
      const { data: evalData, error: evalError } = await supabase
        .from('esp_evaluations')
        .insert({
          store_id: selectedStore.id,
          evaluation_date: date,
          pic: pic,
          total_score: 100,
          final_score: finalScore,
          kpi_score: kpiScore,
          status: 'submitted'
        })
        .select()
        .single();

      if (evalError) throw evalError;

      // Insert findings
      if (findings.length > 0) {
        const findingsData = findings.map(finding => ({
          evaluation_id: evalData.id,
          finding: finding.finding,
          deduction_points: finding.deduction_points
        }));

        // We need to cast the insert data to any to work around the type issue
        const { error: findingsError } = await supabase
          .from('esp_findings')
          .insert(findingsData as any);

        if (findingsError) throw findingsError;
      }

      toast({
        title: "ESP Form Submitted",
        description: "Your evaluation has been saved successfully.",
      });

      // Reset form
      setSelectedStore(null);
      setDate(format(new Date(), "yyyy-MM-dd"));
      setPic("");
      setFindings([]);
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      toast({
        title: "Error",
        description: "Failed to submit evaluation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuestionStatusChange = (id: number, status: 'cross' | 'exclude' | 'include') => {
    // Implementation of handleQuestionStatusChange
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          ESP Evaluation Form
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div>
            <label htmlFor="store" className="text-gray-700 mb-1.5 block">
              Store
            </label>
            <StoreSelect
              selectedStore={selectedStore}
              onStoreSelect={setSelectedStore}
              stores={stores}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="date" className="text-gray-700 mb-1.5 block">Date</label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 bg-white border-gray-200 text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="pic" className="text-gray-700 mb-1.5 block">PIC (Person In Charge)</label>
              <Input
                id="pic"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Enter PIC name"
                className="h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600">Total Score</p>
            <p className="text-lg font-semibold text-gray-900">100</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600">Final Score</p>
            <p className="text-lg font-semibold text-green-600">{finalScore.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600">KPI Score</p>
            <p className="text-lg font-semibold text-blue-600">{kpiScore.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Findings</h3>
            <Button
              type="button"
              onClick={handleAddFinding}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" /> Add Finding
            </Button>
          </div>

          {findings.map((finding, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,200px,auto] gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
              <div>
                <label htmlFor={`finding-${index}`} className="text-gray-700 mb-1.5 block">
                  Finding Description
                </label>
                <Input
                  id={`finding-${index}`}
                  value={finding.finding}
                  onChange={(e) => handleFindingChange(index, 'finding', e.target.value)}
                  placeholder="Enter finding description"
                  className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                />
              </div>
              <div>
                <label htmlFor={`points-${index}`} className="text-gray-700 mb-1.5 block">
                  Deduction Points
                </label>
                <Input
                  id={`points-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={finding.deduction_points}
                  onChange={(e) => handleFindingChange(index, 'deduction_points', e.target.value)}
                  className="bg-white border-gray-200 text-gray-900"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => handleRemoveFinding(index)}
                  className="h-10 w-10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Evaluation"}
        </Button>
      </form>
    </div>
  );
};

export default ESPForm;
