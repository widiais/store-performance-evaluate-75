
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
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface DetailedQuestion {
  question: string;
  points: number;
  status: 'cross' | 'exclude' | 'none';
}

const ChampReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: evaluation, isLoading } = useQuery({
    queryKey: ['champs-evaluation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('champs_evaluation_report')
        .select('*')
        .eq('id', parseInt(id || '0'))
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: detailedQuestions = [], isLoading: isLoadingDetails } = useQuery({
    queryKey: ['evaluation-details', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data: answers, error } = await supabase
        .from('champs_evaluation_answers')
        .select(`
          question_id,
          answer,
          score,
          status,
          champs_questions (
            question,
            points
          )
        `)
        .eq('evaluation_id', parseInt(id));
      
      if (error) throw error;
      
      return ((answers || []).map(answer => ({
        question: answer.champs_questions?.question || '',
        points: answer.champs_questions?.points || 0,
        status: answer.status as 'cross' | 'exclude' | 'none'
      }))
      .filter(q => q.status !== 'none')) as DetailedQuestion[];
    },
    enabled: !!id,
  });

  if (isLoading || isLoadingDetails) {
    return <div>Loading details...</div>;
  }

  if (!evaluation) {
    return (
      <div className="p-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
        <p>No evaluation found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-900/10 to-pink-900/10">
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>

        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          CHAMPS Evaluation Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <p className="text-sm text-dashboard-muted">Store</p>
            <p className="text-lg font-semibold">{evaluation.store_name} - {evaluation.store_city}</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <p className="text-sm text-dashboard-muted">PIC</p>
            <p className="text-lg font-semibold">{evaluation.pic}</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <p className="text-sm text-dashboard-muted">Evaluation Date</p>
            <p className="text-lg font-semibold">{format(new Date(evaluation.evaluation_date), 'dd MMMM yyyy')}</p>
          </div>
        </div>

        <div className="glass-card p-4 bg-dashboard-dark/30 rounded-lg border border-dashboard-text/10">
          <h3 className="text-lg font-semibold mb-4">Lost Points Details</h3>
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
                  <TableCell className="text-right font-medium">{q.points}</TableCell>
                  <TableCell className="text-right">
                    <span className="text-red-500 font-medium">Lost</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ChampReportDetail;
