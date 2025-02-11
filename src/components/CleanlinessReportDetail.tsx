import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
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
import { ArrowLeft, Ban, X, FileSpreadsheet, FileText } from "lucide-react";
import CleanlinessReportPDF from "./CleanlinessReportPDF";

const CleanlinessReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch main evaluation
  const { data: evaluation, isLoading } = useQuery({
    queryKey: ['cleanliness-evaluation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleanliness_evaluation_report')
        .select('*')
        .eq('id', parseInt(id || '0'))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch questions and answers
  const { data: questions = [], isLoading: isLoadingDetails } = useQuery({
    queryKey: ['evaluation-details', id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data: answers, error } = await supabase
        .from('cleanliness_evaluation_answers')
        .select(`
          question_id,
          answer,
          score,
          status,
          cleanliness_questions (
            id,
            question,
            points
          )
        `)
        .eq('evaluation_id', parseInt(id))
        .order('question_id');
      
      if (error) throw error;
      
      return answers?.map(answer => ({
        id: answer.cleanliness_questions?.id,
        question: answer.cleanliness_questions?.question || '',
        points: answer.cleanliness_questions?.points || 0,
        status: answer.status,
        score: answer.score
      })) || [];
    },
    enabled: !!id,
  });

  if (isLoading || isLoadingDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>
        <p>No evaluation found.</p>
      </div>
    );
  }

  const adjustedPoints = questions
    .filter(q => q.status !== 'exclude')
    .reduce((sum, q) => sum + q.points, 0);

  const crossPoints = questions
    .filter(q => q.status === 'cross')
    .reduce((sum, q) => sum + q.points, 0);

  const earnedPoints = adjustedPoints - crossPoints;

  const handleExcelDownload = () => {
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: General Info
    const generalInfo = [
      ['CRS-Store Cleanliness Evaluation Report'],
      [],
      ['Store', `${evaluation.store_name} - ${evaluation.store_city}`],
      ['PIC', evaluation.pic],
      ['Evaluation Date', format(new Date(evaluation.evaluation_date), 'dd MMMM yyyy')],
      ['Final Score', evaluation.total_score],
      [],
      ['Score Summary'],
      ['Total Points', adjustedPoints],
      ['Earned Points', earnedPoints],
      ['Lost Points', crossPoints]
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(generalInfo);
    XLSX.utils.book_append_sheet(workbook, ws1, "General Info");

    // Sheet 2: Questions Detail
    const questionDetails = [
      ['Question', 'Points', 'Score', 'Status']
    ];
    questions.forEach(q => {
      questionDetails.push([q.question, q.points.toString(), q.score.toString(), q.status]);
    });
    
    const ws2 = XLSX.utils.aoa_to_sheet(questionDetails);
    XLSX.utils.book_append_sheet(workbook, ws2, "Questions Detail");

    // Download file
    XLSX.writeFile(workbook, `Cleanliness_Report_${evaluation.store_name}_${format(new Date(evaluation.evaluation_date), 'dd-MM-yyyy')}.xlsx`);
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mb-4 sm:mb-6 border-gray-200 hover:bg-gray-100 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>

        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">
          Cleanliness Evaluation Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Store</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">{evaluation.store_name} - {evaluation.store_city}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">PIC</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">{evaluation.pic}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Evaluation Date</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              {evaluation.evaluation_date ? format(new Date(evaluation.evaluation_date), 'dd MMMM yyyy') : '-'}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Final Score</p>
            <p className="text-base sm:text-lg font-semibold">
              <span className={evaluation.total_score >= 3 ? 'text-green-600' : 'text-red-600'}>
                {evaluation.total_score}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Adjusted Points</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">{adjustedPoints}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Loss Points</p>
            <p className="text-base sm:text-lg font-semibold text-red-600">{crossPoints}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Gained Points</p>
            <p className="text-base sm:text-lg font-semibold text-green-600">{earnedPoints}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Button
            variant="outline"
            onClick={handleExcelDownload}
            className="flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-100 w-full sm:w-auto"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Excel
          </Button>
          
          <PDFDownloadLink
            document={
              <CleanlinessReportPDF 
                evaluation={evaluation}
                questions={questions}
              />
            }
            fileName={`Cleanliness_Report_${evaluation.store_name}_${format(new Date(evaluation.evaluation_date), 'dd-MM-yyyy')}.pdf`}
            className="w-full sm:w-auto"
          >
            {({ loading }) => (
              <Button
                variant="outline"
                disabled={loading}
                className="flex items-center justify-center gap-2 border-gray-200 hover:bg-gray-100 w-full"
              >
                <FileText className="w-4 h-4" />
                {loading ? "Generating PDF..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>

        <div className="glass-card p-3 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Questions Details</h3>
          <div className="min-w-[640px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-700">Question</TableHead>
                  <TableHead className="text-gray-700 w-[100px] text-right">Points</TableHead>
                  <TableHead className="text-gray-700 w-[100px] text-right">Score</TableHead>
                  <TableHead className="text-gray-700 w-[120px] text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((q, index) => (
                  <TableRow key={index} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900 text-sm sm:text-base">{q.question}</TableCell>
                    <TableCell className="text-right font-medium text-gray-900 text-sm sm:text-base">{q.points}</TableCell>
                    <TableCell className="text-right text-sm sm:text-base">
                      <span className={q.score === q.points ? 'text-green-600' : 'text-red-600'}>
                        {q.score}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm sm:text-base">
                      {q.status === 'cross' && (
                        <div className="flex items-center justify-center text-red-600">
                          <X className="w-4 h-4 mr-1" />
                          <span>Cross</span>
                        </div>
                      )}
                      {q.status === 'exclude' && (
                        <div className="flex items-center justify-center text-yellow-600">
                          <Ban className="w-4 h-4 mr-1" />
                          <span>Exclude</span>
                        </div>
                      )}
                      {q.status === 'none' && (
                        <span className="text-green-600">Pass</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanlinessReportDetail;
