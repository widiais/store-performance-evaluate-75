import { useState, useEffect, useMemo } from "react";
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
        className="w-full bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
      />
      <datalist id="store-list">
        {storeOptions.map(({ value }, index) => (
          <option key={index} value={value} />
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
        .select('id, name, city')
        .order('name');
      
      if (error) throw error;
      return data || [];
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
    setQuestions(prev => prev.map(q => {
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
    const percentage = (earnedPoints / (adjustedTotal || 1)) * 100;
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
        <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
          CHAMPS Evaluation Form
        </h2>
        <Button
          onClick={exportToPDF}
          variant="outline"
          className="hidden md:flex items-center gap-2 text-gray-700 border-gray-200 hover:bg-gray-50"
          disabled={!selectedStore}
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
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
              className="h-10 bg-white border-gray-200 text-gray-900"
            />
          </div>
          <div>
            <Label htmlFor="pic" className="text-gray-700 mb-1.5 block">PIC (Person In Charge)</Label>
            <Input
              id="pic"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              placeholder="Enter PIC name"
              className="h-10 bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600">Initial Total</p>
            <p className="text-lg font-semibold text-gray-900">{scores.initialTotal}</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600">Adjusted Total</p>
            <p className="text-lg font-semibold text-gray-900">{scores.adjustedTotal}</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600">Points Earned</p>
            <p className="text-lg font-semibold text-green-600">{scores.earnedPoints}</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-600">KPI Score</p>
            <p className="text-lg font-semibold text-blue-600">{scores.kpiScore}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-gray-700">Question</th>
                <th className="text-center p-3 w-20 text-sm font-medium text-gray-700">Points</th>
                <th className="text-center p-3 w-28 text-sm font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50">
                  <td className="p-3 text-gray-900">{q.question}</td>
                  <td className="text-center p-3 text-gray-900">{q.points}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <Button
                        type="button"
                        variant={q.status === 'cross' ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleQuestionStatusChange(q.id, 'cross')}
                        className="w-9 h-9 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
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
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? "Submitting..." : "Submit Evaluation"}
        </Button>
      </form>
    </div>
  );
};

export default ChampsForm;
