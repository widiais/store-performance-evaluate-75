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
        .select('id, question, points')
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
      const existingIds = questions.filter(q => q.id).map(q => q.id);
      
      // First delete questions that are not in the current set
      if (existingIds.length > 0) {
        await supabase
          .from('champs_questions')
          .delete()
          .not('id', 'in', `(${existingIds.join(',')})`);
      } else {
        // If no existing IDs, delete all questions
        await supabase
          .from('champs_questions')
          .delete()
          .neq('id', -1); // This will delete all rows
      }
      
      // Then upsert all current questions with only the necessary fields
      const questionsToUpsert = questions.map(({ id, question, points }) => ({
        id,
        question,
        points,
      }));

      const { data, error } = await supabase
        .from('champs_questions')
        .upsert(questionsToUpsert)
        .select('id, question, points');
      
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
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-gray-900">Setup CHAMPS Form</h2>
          <div className="flex gap-4 text-gray-600">
            <span>Total CHAMP Points: {getTotalPoints()}</span>
            <span>Last Edit: {format(lastEdit, "dd/MM/yyyy, HH:mm")}</span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20 text-gray-700">No</TableHead>
              <TableHead className="text-gray-700">Question</TableHead>
              <TableHead className="w-32 text-gray-700">Points</TableHead>
              <TableHead className="w-24 text-gray-700">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {localQuestions.map((q, index) => (
              <TableRow key={q.id}>
                <TableCell className="text-gray-900">{index + 1}</TableCell>
                <TableCell>
                  <Input
                    value={q.question}
                    onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                    placeholder="Enter question here..."
                    className="bg-white border-gray-200 text-gray-900 placeholder:text-gray-400"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={q.points}
                    onChange={(e) => updateQuestion(q.id, 'points', parseInt(e.target.value) || 0)}
                    className="bg-white border-gray-200 text-gray-900"
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
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>

          <Button
            onClick={saveChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white"
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
