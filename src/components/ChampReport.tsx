
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
import { Eye, Search, SortAsc, SortDesc, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import _ from "lodash";

interface ChampEvaluation {
  id: number;
  store_name: string;
  store_city: string;
  evaluation_date: string;
  total_score: number;
  pic: string;
}

type SortField = 'store_name' | 'pic' | 'evaluation_date' | 'total_score';
type SortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 10;

const ChampReport = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>('evaluation_date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: evaluations = [], isLoading } = useQuery({
    queryKey: ['champs-evaluations'],
    queryFn: async () => {
      // Use a join to get the data that would be in the view
      const { data, error } = await supabase
        .from('champs_evaluations')
        .select(`
          id,
          evaluation_date,
          pic,
          total_score,
          stores:store_id (
            name,
            city
          )
        `)
        .order('evaluation_date', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match the expected format
      const transformedData = (data || []).map(item => ({
        id: item.id,
        store_name: item.stores?.name || '',
        store_city: item.stores?.city || '',
        evaluation_date: item.evaluation_date,
        total_score: item.total_score || 0,
        pic: item.pic
      }));
      
      return transformedData as ChampEvaluation[];
    },
  });

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

  // Menggunakan lodash untuk filter dan sort
  const filteredAndSortedEvaluations = _.chain(evaluations)
    .filter(evaluation => 
      _.some([
        evaluation.store_name.toLowerCase(),
        evaluation.store_city.toLowerCase(),
        evaluation.pic.toLowerCase()
      ], field => field.includes(searchQuery.toLowerCase()))
    )
    .orderBy([
      item => {
        if (sortField === 'evaluation_date') {
          return new Date(item[sortField]).getTime();
        }
        return _.get(item, sortField, '').toLowerCase();
      }
    ], [sortOrder])
    .value();

  // Paginasi
  const totalPages = Math.ceil(filteredAndSortedEvaluations.length / ITEMS_PER_PAGE);
  const paginatedData = _.slice(
    filteredAndSortedEvaluations,
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          CHAMPS Evaluation Report
        </h2>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by store, city, or PIC..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        <div className="glass-card p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700">No</TableHead>
                <TableHead className="text-gray-700 cursor-pointer" onClick={() => toggleSort('store_name')}>
                  <div className="flex items-center">
                    Store {getSortIcon('store_name')}
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 cursor-pointer" onClick={() => toggleSort('pic')}>
                  <div className="flex items-center">
                    PIC {getSortIcon('pic')}
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 cursor-pointer" onClick={() => toggleSort('evaluation_date')}>
                  <div className="flex items-center">
                    Evaluation Date {getSortIcon('evaluation_date')}
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 text-right cursor-pointer" onClick={() => toggleSort('total_score')}>
                  <div className="flex items-center justify-end">
                    Score {getSortIcon('total_score')}
                  </div>
                </TableHead>
                <TableHead className="text-gray-700 w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((evaluation, index) => (
                <TableRow key={evaluation.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="text-gray-900">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                  <TableCell className="text-gray-900">{evaluation.store_name} - {evaluation.store_city}</TableCell>
                  <TableCell className="text-gray-900">{evaluation.pic}</TableCell>
                  <TableCell className="text-gray-900">{format(new Date(evaluation.evaluation_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={`${evaluation.total_score >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                      {evaluation.total_score}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/report/${evaluation.id}`)}
                      className="border-gray-200 hover:bg-gray-100"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedEvaluations.length)} of {filteredAndSortedEvaluations.length} entries
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {_.range(1, totalPages + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChampReport;
