
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Save } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ChampQuestion {
  id: number;
  question: string;
  points: number;
}

const SetupChamps = () => {
  const { toast } = useToast();
  const [localQuestions, setLocalQuestions] = useState<ChampQuestion[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastEdit, setLastEdit] = useState<Date>(new Date());
  const queryClient = useQueryClient();

  // Fetch questions
  const { data: fetchedQuestions = [], isLoading } = useQuery({
    queryKey: ['champs-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('champs_questions')
        .select('*')
        .order('id');
      
      if (error) throw error;
      return data || [];
    },
  });

  useEffect(() => {
    if (fetchedQuestions && !hasUnsavedChanges) {
      setLocalQuestions(fetchedQuestions);
    }
  }, [fetchedQuestions, hasUnsavedChanges]);

  // Save all questions mutation
  const saveQuestionsMutation = useMutation({
    mutationFn: async (questions: ChampQuestion[]) => {
      // Delete all existing questions
      await supabase
        .from('champs_questions')
        .delete()
        .not('id', 'in', questions.filter(q => q.id).map(q => q.id));
      
      // Upsert all questions
      const { data, error } = await supabase
        .from('champs_questions')
        .upsert(questions)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['champs-questions'] });
      setHasUnsavedChanges(false);
      toast({
        title: "Changes Saved",
        description: "All changes have been successfully saved.",
      });
    },
  });

  const addQuestion = () => {
    const maxId = Math.max(0, ...localQuestions.map(q => q.id || 0));
    const newQuestion = {
      id: maxId + 1,
      question: "",
      points: 0,
    };
    setLocalQuestions([...localQuestions, newQuestion]);
    setHasUnsavedChanges(true);
  };

  const updateQuestion = (id: number, field: keyof ChampQuestion, value: string | number) => {
    const updatedQuestions = localQuestions.map(q => {
      if (q.id === id) {
        return {
          ...q,
          [field]: field === 'points' ? parseInt(value.toString()) : value
        };
      }
      return q;
    });
    setLocalQuestions(updatedQuestions);
    setHasUnsavedChanges(true);
    setLastEdit(new Date());
  };

  const deleteQuestion = (id: number) => {
    setLocalQuestions(localQuestions.filter(q => q.id !== id));
    setHasUnsavedChanges(true);
    setLastEdit(new Date());
  };

  const saveChanges = async () => {
    await saveQuestionsMutation.mutateAsync(localQuestions);
  };

  const getTotalPoints = () => {
    return localQuestions.reduce((sum, q) => sum + q.points, 0);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Setup CHAMPS Form</h2>
          <div className="flex gap-4 text-dashboard-muted">
            <span>Total CHAMP Points: {getTotalPoints()}</span>
            <span>Last Edit: {format(lastEdit, "dd/MM/yyyy, HH:mm")}</span>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">No</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-32">Points</TableHead>
              <TableHead className="w-24">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localQuestions.map((q, index) => (
              <TableRow key={q.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                    placeholder="Enter question here..."
                    className="bg-dashboard-dark border-dashboard-text/20"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={q.points}
                    onChange={(e) => updateQuestion(q.id, 'points', parseInt(e.target.value) || 0)}
                    className="bg-dashboard-dark border-dashboard-text/20"
                    min={0}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteQuestion(q.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex gap-2 mt-4">
          <Button 
            onClick={addQuestion}
            className="bg-green-500 hover:bg-green-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>

          <Button
            onClick={saveChanges}
            className="bg-blue-500 hover:bg-blue-600"
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupChamps;
