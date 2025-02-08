
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { X, Ban, Check } from "lucide-react";
import filter from 'lodash/filter';
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

const ChampsForm = () => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [pic, setPic] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  // Fetch stores from the database with proper error handling and default value
  const { data: stores = [] } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city');
      
      if (error) throw error;
      return (data || []) as Store[];
    },
  });

  // Fetch questions with proper error handling and default value
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

  // Filter stores with null check
  const filteredStores = filter(stores || [], store =>
    store.name.toLowerCase().includes(searchValue.toLowerCase()) ||
    store.city.toLowerCase().includes(searchValue.toLowerCase())
  );

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
        score: q.status === 'exclude' ? 0 : q.points
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">CHAMPS Evaluation Form</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-card p-6 space-y-4">
          <div>
            <Label htmlFor="store">Store</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-dashboard-dark border-dashboard-text/20"
                >
                  {selectedStore ? `${selectedStore.name} - ${selectedStore.city}` : "Select store..."}
                  <Check
                    className={cn(
                      "ml-2 h-4 w-4",
                      selectedStore ? "opacity-100" : "opacity-0"
                    )}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command value={searchValue} onValueChange={setSearchValue}>
                  <CommandInput 
                    placeholder="Search store..." 
                    className="h-9"
                  />
                  <CommandEmpty>No store found.</CommandEmpty>
                  <CommandGroup>
                    {filteredStores.map((store) => (
                      <CommandItem
                        key={store.id}
                        value={`${store.name} ${store.city}`}
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

        <div className="glass-card p-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Scores Summary</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <p className="text-sm text-dashboard-muted">Initial Total Points:</p>
                <p className="text-xl font-semibold">{scores.initialTotal}</p>
              </div>
              <div>
                <p className="text-sm text-dashboard-muted">Adjusted Total Points:</p>
                <p className="text-xl font-semibold">{scores.adjustedTotal}</p>
              </div>
              <div>
                <p className="text-sm text-dashboard-muted">Points Earned:</p>
                <p className="text-xl font-semibold">{scores.earnedPoints}</p>
              </div>
              <div>
                <p className="text-sm text-dashboard-muted">Final KPI Score (0-4):</p>
                <p className="text-xl font-semibold">{scores.kpiScore}</p>
              </div>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-dashboard-text/20">
                <th className="text-left py-2">Question</th>
                <th className="text-center py-2 w-24">Points</th>
                <th className="text-center py-2 w-32">Action</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id} className="border-b border-dashboard-text/20">
                  <td className="py-3">{q.question}</td>
                  <td className="text-center">{q.points}</td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant={q.status === 'cross' ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleQuestionStatusChange(q.id, 'cross')}
                        className="w-10 h-10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={q.status === 'exclude' ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => handleQuestionStatusChange(q.id, 'exclude')}
                        className="w-10 h-10"
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

        <Button type="submit" disabled={isSubmitting} className="w-full">
          Submit Evaluation
        </Button>
      </form>
    </div>
  );
};

export default ChampsForm;
