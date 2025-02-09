
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
import { Eye, Search, SortAsc, SortDesc } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";

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

type SortField = 'store_name' | 'pic' | 'evaluation_date' | 'total_score';
type SortOrder = 'asc' | 'desc';

const ChampReport = () => {
  const [selectedEvalId, setSelectedEvalId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('evaluation_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['champs-evaluations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('champs_evaluation_report')
        .select('*')
        .order('evaluation_date', { ascending: false });
      
      if (error) throw error;
      return data as ChampEvaluation[];
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
      
      return answers
        .map(answer => ({
          question: answer.champs_questions?.question || '',
          points: answer.champs_questions?.points || 0,
          status: answer.answer ? 'none' : 'cross'
        }))
        .filter(q => q.status !== 'none');
    },
    enabled: !!selectedEvalId,
  });

  const handleViewDetails = (evalId: number) => {
    setSelectedEvalId(evalId);
    setIsDetailOpen(true);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? 
      <SortAsc className="w-4 h-4 ml-1" /> : 
      <SortDesc className="w-4 h-4 ml-1" />;
  };

  const filteredAndSortedEvaluations = evaluations
    .filter(eval => 
      eval.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eval.store_city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      eval.pic.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a: ChampEvaluation, b: ChampEvaluation) => {
      if (sortField === 'evaluation_date') {
        return sortOrder === 'asc' 
          ? new Date(a.evaluation_date).getTime() - new Date(b.evaluation_date).getTime()
          : new Date(b.evaluation_date).getTime() - new Date(a.evaluation_date).getTime();
      }
      
      const aValue = String(a[sortField]).toLowerCase();
      const bValue = String(b[sortField]).toLowerCase();
      
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });

  const selectedEvaluation = evaluations.find(e => e.id === selectedEvalId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
        CHAMPS Evaluation Report
      </h2>
      
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by store, city, or PIC..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-dashboard-dark/50 border-dashboard-text/20"
          />
        </div>
      </div>

      <div className="glass-card p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No</TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort('store_name')}
              >
                <div className="flex items-center">
                  Store {getSortIcon('store_name')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort('pic')}
              >
                <div className="flex items-center">
                  PIC {getSortIcon('pic')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => toggleSort('evaluation_date')}
              >
                <div className="flex items-center">
                  Evaluation Date {getSortIcon('evaluation_date')}
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer"
                onClick={() => toggleSort('total_score')}
              >
                <div className="flex items-center justify-end">
                  KPI Score {getSortIcon('total_score')}
                </div>
              </TableHead>
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedEvaluations.map((evaluation, index) => (
              <TableRow key={evaluation.id} className="cursor-pointer hover:bg-dashboard-dark/50">
                <TableCell>{index + 1}</TableCell>
                <TableCell>{evaluation.store_name} - {evaluation.store_city}</TableCell>
                <TableCell>{evaluation.pic}</TableCell>
                <TableCell>{format(new Date(evaluation.evaluation_date), 'dd/MM/yyyy')}</TableCell>
                <TableCell className="text-right font-medium">
                  <span className={`${evaluation.total_score >= 3 ? 'text-green-500' : 'text-red-500'}`}>
                    {evaluation.total_score}
                  </span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(evaluation.id)}
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
        <DialogContent className="max-w-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Evaluation Details
            </DialogTitle>
          </DialogHeader>
          {isLoadingDetails ? (
            <div>Loading details...</div>
          ) : (
            <div className="mt-4 space-y-6">
              {selectedEvaluation && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <p className="text-sm text-dashboard-muted">Store</p>
                    <p className="text-lg font-semibold">{selectedEvaluation.store_name} - {selectedEvaluation.store_city}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <p className="text-sm text-dashboard-muted">PIC</p>
                    <p className="text-lg font-semibold">{selectedEvaluation.pic}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <p className="text-sm text-dashboard-muted">Evaluation Date</p>
                    <p className="text-lg font-semibold">{format(new Date(selectedEvaluation.evaluation_date), 'dd MMMM yyyy')}</p>
                  </div>
                </div>
              )}
              <div className="glass-card p-4">
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChampReport;
