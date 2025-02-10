
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
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = questions.reduce((sum, q) => sum + q.score, 0);
  const lostPoints = totalPoints - earnedPoints;

  const gainedPoints = questions
    .filter(q => q.status !== 'cross' && q.status !== 'exclude')
    .reduce((sum, q) => sum + q.points, 0);

  const lossPoints = questions
    .filter(q => q.status === 'cross')
    .reduce((sum, q) => sum + q.points, 0);

  const adjustedPoints = questions
    .filter(q => q.status !== 'exclude')
    .reduce((sum, q) => sum + q.points, 0);

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
      ['Total Points', totalPoints],
      ['Earned Points', earnedPoints],
      ['Lost Points', lostPoints]
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
          <div className="p