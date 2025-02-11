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
import ProductQualityReportPDF from "./ProductQualityReportPDF";

const ProductQualityReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch main evaluation
  const { data: evaluation, isLoading } = useQuery({
    queryKey: ['product-quality-evaluation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_quality_evaluation_report')
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
        .from('product_quality_evaluation_answers')
        .select(`
          question_id,
          answer,
          score,
          status,
          product_quality_questions (
            id,
            question,
            points
          )
        `)
        .eq('evaluation_id', parseInt(id))
        .order('question_id');
      
      if (error) throw error;
      
      return answers?.map(answer => ({
        id: answer.product_quality_questions?.id,
        question: answer.product_quality_questions?.question || '',
        points: answer.product_quality_questions?.points || 0,
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

  // Calculate total score
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
      ['Product Quality Evaluation Report'],
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
    XLSX.writeFile(workbook, `Product_Quality_Report_${evaluation.store_name}_${format(new Date(evaluation.evaluation_date), 'dd-MM-yyyy')}.xlsx`);
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-900/10 to-pink-900/10">
      <div className="max-w-5xl mx-auto">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>

        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Product Quality Evaluation Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
            <p className="text-lg font-semibold">
              {evaluation.evaluation_date ? format(new Date(evaluation.evaluation_date), 'dd MMMM yyyy') : '-'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <p className="text-sm text-dashboard-muted">Final Score</p>
            <p className="text-lg font-semibold">
              <span className={evaluation.total_score >= 3 ? 'text-green-500' : 'text-red-500'}>
                {evaluation.total_score}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <p className="text-sm text-dashboard-muted">Adjusted Points</p>
            <p className="text-lg font-semibold">{adjustedPoints}</p>
          </div>
          <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/10">
            <p className="text-sm text-dashboard-muted">Loss Points</p>
            <p className="text-lg font-semibold text-red-500">{crossPoints}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
            <p className="text-sm text-dashboard-muted">Gained Points</p>
            <p className="text-lg font-semibold text-green-500">{earnedPoints}</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handleExcelDownload}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Download Excel
          </Button>
          
          <PDFDownloadLink
            document={
              <ProductQualityReportPDF 
                evaluation={evaluation} 
                questions={questions}
              />
            }
            fileName={`Product_Quality_Report_${evaluation.store_name}_${format(new Date(evaluation.evaluation_date), 'dd-MM-yyyy')}.pdf`}
            className="inline-block"
          >
            {({ loading }) => (
              <Button
                variant="outline"
                disabled={loading}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {loading ? "Generating PDF..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
        </div>

        <div className="glass-card p-4 bg-dashboard-dark/30 rounded-lg border border-dashboard-text/10">
          <h3 className="text-lg font-semibold mb-4">Questions Details</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question</TableHead>
                <TableHead className="w-[100px] text-right">Points</TableHead>
                <TableHead className="w-[100px] text-right">Score</TableHead>
                <TableHead className="w-[120px] text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q, index) => (
                <TableRow key={index}>
                  <TableCell>{q.question}</TableCell>
                  <TableCell className="text-right font-medium">{q.points}</TableCell>
                  <TableCell className="text-right">
                    <span className={q.score === q.points ? 'text-green-500' : 'text-red-500'}>
                      {q.score}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {q.status === 'cross' && (
                      <div className="flex items-center justify-center text-red-500">
                        <X className="w-4 h-4 mr-1" />
                        <span>Cross</span>
                      </div>
                    )}
                    {q.status === 'exclude' && (
                      <div className="flex items-center justify-center text-yellow-500">
                        <Ban className="w-4 h-4 mr-1" />
                        <span>Exclude</span>
                      </div>
                    )}
                    {q.status === 'none' && (
                      <span className="text-green-500">Pass</span>
                    )}
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

export default ProductQualityReportDetail;
