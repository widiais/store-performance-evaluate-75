
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { format } from "date-fns";

interface ChampEvaluation {
  id: number;
  store_name: string;
  store_city: string;
  evaluation_date: string;
  total_score: number;
  pic: string;
}

interface DetailedQuestion {
  question: string;
  points: number;
  status: 'cross' | 'exclude' | 'none';
}

const ChampReport = () => {
  const [selectedEvalId, setSelectedEvalId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['champs-evaluations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('champs_evaluation_report')
        .select('*')
        .order('evaluation_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: detailedQuestions = [], isLoading: isLoadingDetails } = useQuery({
    queryKey: ['evaluation-details', selectedEvalId],
    queryFn: async () => {
      if (!selectedEvalId) return [];
      
      const { data: answers, error } = await supabase
        .from('champs_evaluation_answers')
        .select(`
          question_id,
          answer,
          score,
          champs_questions (
            question,
            points
          )
        `)
        .eq('evaluation_id', selectedEvalId);
      
      if (error) throw error;
      return answers.map(answer => ({
        question: answer.champs_questions?.question || '',
        points: answer.champs_questions?.points || 0,
        status: answer.answer ? 'none' : 'cross'
      }));
    },
    enabled: !!selectedEvalId,
  });

  const handleViewDetails = (evalId: number) => {
    setSelectedEvalId(evalId);
    setIsDetailOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">CHAMPS Evaluation Report</h2>
      
      <div className="glass-card p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Evaluation Date</TableHead>
              <TableHead className="text-right">KPI Score</TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((eval, index) => (
              <TableRow key={eval.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{eval.store_name} - {eval.store_city}</TableCell>
                <TableCell>{format(new Date(eval.evaluation_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="text-right">{eval.total_score}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(eval.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Evaluation Details</DialogTitle>
          </DialogHeader>
          {isLoadingDetails ? (
            <div>Loading details...</div>
          ) : (
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead className="w-[100px] text-right">Points</TableHead>
                    <TableHead className="w-[100px] text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailedQuestions.map((q, index) => (
                    <TableRow key={index}>
                      <TableCell>{q.question}</TableCell>
                      <TableCell className="text-right">{q.points}</TableCell>
                      <TableCell className="text-right">
                        <span className={q.status === 'cross' ? 'text-red-500' : ''}>
                          {q.status === 'cross' ? 'Lost' : 'Earned'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChampReport;
