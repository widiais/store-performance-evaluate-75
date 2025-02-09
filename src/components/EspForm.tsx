
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";
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

const EspForm = () => {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [pic, setPic] = useState<string>("");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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

        const { error: findingsError } = await supabase
          .from('esp_findings')
          .insert(findingsData);

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

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-purple-400">
          ESP Evaluation Form
        </h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 p-4 bg-dashboard-dark/30 rounded-lg border border-dashboard-text/10">
          <div>
            <Label htmlFor="store" className="text-dashboard-text mb-1.5 block">
              Store
            </Label>
            <Input
              list="store-list"
              value={searchValue}
              onChange={(e) => {
                const value = e.target.value;
                setSearchValue(value);
                const store = stores.find(
                  s => `${s.name} - ${s.city}` === value
                );
                setSelectedStore(store || null);
              }}
              placeholder="Select or type store name..."
              className="bg-dashboard-dark/50 border-dashboard-text/20"
            />
            <datalist id="store-list">
              {stores.map((store) => (
                <option key={store.id} value={`${store.name} - ${store.city}`} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-dashboard-text mb-1.5 block">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-10 bg-dashboard-dark/50 border-dashboard-text/20"
              />
            </div>
            <div>
              <Label htmlFor="pic" className="text-dashboard-text mb-1.5 block">PIC (Person In Charge)</Label>
              <Input
                id="pic"
                value={pic}
                onChange={(e) => setPic(e.target.value)}
                placeholder="Enter PIC name"
                className="h-10 bg-dashboard-dark/50 border-dashboard-text/20"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <p className="text-xs text-dashboard-muted">Total Score</p>
            <p className="text-lg font-semibold text-purple-400">100</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs text-dashboard-muted">Final Score</p>
            <p className="text-lg font-semibold text-blue-400">{finalScore.toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
            <p className="text-xs text-dashboard-muted">KPI Score</p>
            <p className="text-lg font-semibold text-yellow-400">{kpiScore.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Findings</h3>
            <Button
              type="button"
              onClick={handleAddFinding}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Add Finding
            </Button>
          </div>

          {findings.map((finding, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr,200px,auto] gap-4 p-4 bg-dashboard-dark/30 rounded-lg border border-dashboard-text/10">
              <div>
                <Label htmlFor={`finding-${index}`} className="text-dashboard-text mb-1.5 block">
                  Finding Description
                </Label>
                <Input
                  id={`finding-${index}`}
                  value={finding.finding}
                  onChange={(e) => handleFindingChange(index, 'finding', e.target.value)}
                  placeholder="Enter finding description"
                  className="bg-dashboard-dark/50 border-dashboard-text/20"
                />
              </div>
              <div>
                <Label htmlFor={`points-${index}`} className="text-dashboard-text mb-1.5 block">
                  Deduction Points
                </Label>
                <Input
                  id={`points-${index}`}
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={finding.deduction_points}
                  onChange={(e) => handleFindingChange(index, 'deduction_points', e.target.value)}
                  className="bg-dashboard-dark/50 border-dashboard-text/20"
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
          className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isSubmitting ? "Submitting..." : "Submit Evaluation"}
        </Button>
      </form>
    </div>
  );
};

export default EspForm;
