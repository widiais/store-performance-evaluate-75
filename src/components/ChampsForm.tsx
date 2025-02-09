import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { X, Ban, Check, Download, Search, ChevronsUpDown } from "lucide-react";
import filter from 'lodash/filter';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Store {
  id: number;
  name: string;
  city: string;
}

interface Question {
  id: number;
  question: string;
  points: number;
}

interface QuestionState extends Question {
  status: 'none' | 'cross' | 'exclude';
}

interface StoreSelectProps {
  selectedStore: Store | null;
  onStoreSelect: (store: Store | null) => void;
  stores: Store[];
}

const StoreSelect = ({ selectedStore, onStoreSelect, stores }: StoreSelectProps) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (selectedStore) {
      setInputValue(`${selectedStore.name} - ${selectedStore.city}`);
    }
  }, [selectedStore]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Cari store yang cocok berdasarkan input (case-insensitive)
    const match = stores.find(
      (store) => `${store.name} - ${store.city}`.toLowerCase() === value.toLowerCase()
    );
    if (match) {
      onStoreSelect(match);
    } else {
      // Jika tidak cocok, kita set selectedStore ke null (bisa disesuaikan)
      onStoreSelect(null);
    }
  };

  return (
    <div className="relative">
      <Input
        id="store"
        type="text"
        list="store-options"
        placeholder="Select store..."
        value={inputValue}
        onChange={handleChange}
        className="bg-dashboard-dark/50 border-dashboard-text/20"
      />
      <datalist id="store-options">
        {(Array.isArray(stores) ? stores : []).map((store) => (
          <option key={store.id} value={`${store.name} - ${store.city}`} />
        ))}
      </datalist>
    </div>
  );
};

const ChampsForm = () => {
  const { toast } = useToast();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [pic, setPic] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [open, setOpen] = useState(false);

  const { data: stores = [], isLoading: isLoadingStores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city');
      
      if (error) throw error;
      return (data || []) as Store[];
    },
  });

  const { data: fetchedQuestions = [] } = useQuery({
    queryKey: ['champs-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('champs_questions')
        .select('id, question, points')
        .order('id');
      
      if (error) throw error;
      return (data || []).map(q => ({ ...q, status: 'none' as const }));
    },
  });

  useEffect(() => {
    if (fetchedQuestions.length > 0) {
      setQuestions(fetchedQuestions);
    }
  }, [fetchedQuestions]);

  const handleQuestionStatusChange = (questionId: number, status: 'none' | 'cross' | 'exclude') => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, status: q.status === status ? 'none' : status };
      }
      return q;
    }));
  };

  const calculateScores = () => {
    const initialTotal = questions.reduce((sum, q) => sum + q.points, 0);
    const excludedPoints = questions
      .filter(q => q.status === 'exclude')
      .reduce((sum, q) => sum + q.points, 0);
    const crossedPoints = questions
      .filter(q => q.status === 'cross')
      .reduce((sum, q) => sum + q.points, 0);
    
    const adjustedTotal = initialTotal - excludedPoints;
    const earnedPoints = adjustedTotal - crossedPoints;
    const percentage = (earnedPoints / adjustedTotal) * 100;
    const kpiScore = (percentage / 100) * 4;

    return {
      initialTotal,
      adjustedTotal,
      earnedPoints,
      percentage: percentage.toFixed(2),
      kpiScore: kpiScore.toFixed(2)
    };
  };

  const scores = calculateScores();

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
      const { data: evalData, error: evalError } = await supabase
        .from('champs_evaluations')
        .insert({
          store_id: selectedStore.id,
          evaluation_date: date,
          pic: pic,
          total_score: parseFloat(scores.kpiScore),
          status: 'submitted'
        })
        .select()
        .single();

      if (evalError) throw evalError;

      const answers = questions.map(q => ({
        evaluation_id: evalData.id,
        question_id: q.id,
        answer: q.status !== 'cross',
        score: q.status === 'exclude' ? 0 : q.points,
        status: q.status
      }));

      const { error: answersError } = await supabase
        .from('champs_evaluation_answers')
        .insert(answers);

      if (answersError) throw answersError;

      toast({
        title: "CHAMPS Form Submitted",
        description: "Your evaluation has been saved successfully.",
      });

      setSelectedStore(null);
      setDate(format(new Date(), "yyyy-MM-dd"));
      setPic("");
      setQuestions(questions.map(q => ({ ...q, status: 'none' })));
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

  const exportToPDF = async () => {
    const element = document.getElementById('champs-form');
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`CHAMPS_Evaluation_${selectedStore?.name}_${date}.pdf`);

      toast({
        title: "PDF Exported",
        description: "Your evaluation has been exported successfully."
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold text-purple-400">
          CHAMPS Evaluation Form
        </h2>
        <Button
          onClick={exportToPDF}
          variant="outline"
          className="hidden md:flex items-center gap-2 text-purple-400 border-purple-400/20 hover:bg-purple-400/10"
          disabled={!selectedStore}
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 p-4 bg-dashboard-dark/30 rounded-lg border border-dashboard-text/10">
          <div>
            <Label htmlFor="store" className="text-dashboard-text mb-1.5 block">
              Store
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-dashboard-dark/50 border-dashboard-text/20"
                >
                  {selectedStore ? `${selectedStore.name} - ${selectedStore.city}` : "Select store..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search store..." />
                  <CommandEmpty>No store found.</CommandEmpty>
                  <CommandGroup>
                    {(stores || []).map((store) => (
                      <CommandItem
                        key={store.id}
                        value={`${store.name} - ${store.city}`}
                        onSelect={() => {
                          setSelectedStore(store);
                          setOpen(false);
                        }}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedStore?.id === store.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {store.name} - {store.city}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <p className="text-xs text-dashboard-muted">Initial Total</p>
            <p className="text-lg font-semibold text-purple-400">{scores.initialTotal}</p>
          </div>
          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <p className="text-xs text-dashboard-muted">Adjusted Total</p>
            <p className="text-lg font-semibold text-blue-400">{scores.adjustedTotal}</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
            <p className="text-xs text-dashboard-muted">Points Earned</p>
            <p className="text-lg font-semibold text-green-400">{scores.earnedPoints}</p>
          </div>
          <div className="p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
            <p className="text-xs text-dashboard-muted">KPI Score</p>
            <p className="text-lg font-semibold text-yellow-400">{scores.kpiScore}</p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-dashboard-text/10">
          <table className="w-full">
            <thead className="bg-dashboard-dark/30">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-dashboard-muted">Question</th>
                <th className="text-center p-3 w-20 text-sm font-medium text-dashboard-muted">Points</th>
                <th className="text-center p-3 w-28 text-sm font-medium text-dashboard-muted">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashboard-text/10">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-dashboard-dark/20">
                  <td className="p-3">{q.question}</td>
                  <td className="text-center p-3">{q.points}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant={q.status === 'cross' ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleQuestionStatusChange(q.id, 'cross')}
                        className="w-9 h-9 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={q.status === 'exclude' ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleQuestionStatusChange(q.id, 'exclude')}
                        className="w-9 h-9 p-0"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default ChampsForm;
