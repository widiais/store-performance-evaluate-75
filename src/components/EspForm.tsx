
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EspFinding } from "@/integrations/supabase/client-types";

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

interface EspFormProps {}

const EspForm = ({}: EspFormProps) => {
  const { toast } = useToast();
  const [date, setDate] = useState<Date>(new Date());
  const [pic, setPic] = useState("");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [findings, setFindings] = useState<Finding[]>([
    { finding: "", deduction_points: 0 },
  ]);
  const [baseScore, setBaseScore] = useState(100);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const { data, error } = await supabase
          .from("stores")
          .select("id, name, city")
          .order("name", { ascending: true });

        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        console.error("Error fetching stores:", error);
        toast({
          title: "Error",
          description: "Failed to load stores. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchStores();
  }, [toast]);

  useEffect(() => {
    const deductionTotal = findings.reduce(
      (total, finding) => total + finding.deduction_points,
      0
    );
    const newFinalScore = Math.max(0, baseScore - deductionTotal);
    setFinalScore(newFinalScore);
  }, [findings, baseScore]);

  const handleFindingChange = (index: number, field: keyof Finding, value: string | number) => {
    const updatedFindings = [...findings];
    updatedFindings[index] = {
      ...updatedFindings[index],
      [field]: value,
    };
    setFindings(updatedFindings);
  };

  const addFinding = () => {
    setFindings([...findings, { finding: "", deduction_points: 0 }]);
  };

  const removeFinding = (index: number) => {
    const updatedFindings = [...findings];
    updatedFindings.splice(index, 1);
    setFindings(updatedFindings);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedStore) {
      toast({
        title: "Error",
        description: "Please select a store.",
        variant: "destructive",
      });
      return;
    }

    if (!pic.trim()) {
      toast({
        title: "Error",
        description: "Please enter a PIC name.",
        variant: "destructive",
      });
      return;
    }

    if (findings.some(f => !f.finding.trim())) {
      toast({
        title: "Error",
        description: "Please fill in all findings or remove empty ones.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Calculate KPI score based on final score
      const kpiScore = Math.round(finalScore / 25);

      // 1. Insert the evaluation record
      const { data: evaluationData, error: evaluationError } = await supabase
        .from("esp_evaluations")
        .insert({
          store_id: selectedStore.id,
          evaluation_date: format(date, "yyyy-MM-dd"),
          pic: pic,
          total_score: baseScore,
          final_score: finalScore,
          kpi_score: kpiScore,
          status: "completed",
        })
        .select()
        .single();

      if (evaluationError) throw evaluationError;

      // 2. Insert the findings using a custom function to bypass TypeScript checking
      if (evaluationData && findings.length > 0) {
        const findingsData = findings.map(finding => ({
          evaluation_id: evaluationData.id,
          finding: finding.finding,
          deduction_points: finding.deduction_points
        }));

        // Using a direct insert instead of RPC function
        const { error: findingsError } = await supabase
          .from('esp_findings')
          .insert(findingsData);

        if (findingsError) throw findingsError;
      }

      toast({
        title: "Success",
        description: "ESP evaluation submitted successfully.",
      });

      // Reset form
      setSelectedStore(null);
      setPic("");
      setDate(new Date());
      setFindings([{ finding: "", deduction_points: 0 }]);
      setBaseScore(100);
      setFinalScore(0);
    } catch (error: any) {
      console.error("Error submitting ESP evaluation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit evaluation.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">ESP Evaluation Form</h1>
        <p className="text-gray-500">
          Enter ESP evaluation details and findings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="store">Store</Label>
                <Select
                  value={selectedStore?.id.toString() || ""}
                  onValueChange={(value) => {
                    const store = stores.find(
                      (s) => s.id.toString() === value
                    );
                    setSelectedStore(store || null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((store) => (
                      <SelectItem key={store.id} value={store.id.toString()}>
                        {store.name} - {store.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(newDate) => setDate(newDate || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="pic">PIC</Label>
                <Input
                  id="pic"
                  value={pic}
                  onChange={(e) => setPic(e.target.value)}
                  placeholder="Enter PIC name"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="baseScore">Base Score</Label>
                <Input
                  id="baseScore"
                  type="number"
                  value={baseScore}
                  onChange={(e) =>
                    setBaseScore(parseInt(e.target.value) || 0)
                  }
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <Label htmlFor="finalScore">Final Score</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="finalScore"
                    type="number"
                    value={finalScore}
                    readOnly
                    className="bg-gray-50"
                  />
                  <Badge
                    className={cn(
                      "text-sm",
                      finalScore >= 75
                        ? "bg-green-100 text-green-800"
                        : finalScore >= 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    )}
                  >
                    {finalScore >= 75
                      ? "Good"
                      : finalScore >= 50
                      ? "Average"
                      : "Poor"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Findings & Deductions</h2>
            <Button type="button" variant="outline" onClick={addFinding}>
              <Plus className="mr-2 h-4 w-4" />
              Add Finding
            </Button>
          </div>

          <Card className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70%]">Finding</TableHead>
                  <TableHead>Deduction Points</TableHead>
                  <TableHead className="w-[80px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Input
                        value={finding.finding}
                        onChange={(e) =>
                          handleFindingChange(
                            index,
                            "finding",
                            e.target.value
                          )
                        }
                        placeholder="Enter finding details"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={finding.deduction_points}
                        onChange={(e) =>
                          handleFindingChange(
                            index,
                            "deduction_points",
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="0"
                        max="100"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFinding(index)}
                        disabled={findings.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Evaluation"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EspForm;
