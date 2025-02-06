import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface ChampQuestion {
  id: number;
  question: string;
  point: number;
}

const SetupChamps = () => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<ChampQuestion[]>([]);
  const [lastEdit, setLastEdit] = useState<Date>(new Date());

  const addQuestion = () => {
    const newQuestion: ChampQuestion = {
      id: questions.length + 1,
      question: "",
      point: 0,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: number, field: keyof ChampQuestion, value: string | number) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
    setLastEdit(new Date());
  };

  const deleteQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
    setLastEdit(new Date());
    toast({
      title: "Question Deleted",
      description: "The question has been removed from the CHAMPS form.",
    });
  };

  const getTotalPoints = () => {
    return questions.reduce((sum, q) => sum + q.point, 0);
  };

  const handleSave = () => {
    toast({
      title: "CHAMPS Form Saved",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Setup CHAMPS Form</h2>
          <div className="flex gap-4 text-dashboard-muted">
            <span>Total CHAMP Point: {getTotalPoints()}</span>
            <span>Last Edit: {format(lastEdit, "dd/MM/yyyy, HH:mm")}</span>
          </div>
        </div>
        <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
          Save
        </Button>
      </div>

      <div className="glass-card p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">No</TableHead>
              <TableHead>Question</TableHead>
              <TableHead className="w-32">Point</TableHead>
              <TableHead className="w-24">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {questions.map((q, index) => (
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
                    value={q.point}
                    onChange={(e) => updateQuestion(q.id, 'point', parseInt(e.target.value) || 0)}
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

        <Button 
          onClick={addQuestion}
          className="mt-4 bg-green-500 hover:bg-green-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </Button>
      </div>
    </div>
  );
};

export default SetupChamps;