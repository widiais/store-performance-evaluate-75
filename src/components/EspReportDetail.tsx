
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PDFDownloadLink } from '@react-pdf/renderer';
import * as XLSX from 'xlsx';
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
import { ArrowLeft, FileSpreadsheet, FileText, Trash2 } from "lucide-react";
import EspPDF from "./EspReportPDF";
import { useToast } from "@/hooks/use-toast"; // Fixed import

interface Finding {
  id: number;
  finding: string;
  deduction_points: number;
}

const EspReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch evaluation details
  const { data: evaluation, isLoading } = useQuery({
    queryKey: ['esp-evaluation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esp_evaluation_report')
        .select('*')
        .eq('id', parseInt(id || '0'))
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch findings
  const { data: findings = [], isLoading: isLoadingFindings } = useQuery({
    queryKey: ['esp-findings', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esp_findings')
        .select('*')
        .eq('evaluation_id', parseInt(id || '0'))
        .order('id');
      
      if (error) throw error;
      return data as Finding[];
    },
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('esp_evaluations')
        .delete()
        .eq('id', parseInt(id || '0'));
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Evaluation deleted",
        description: "The ESP evaluation has been successfully deleted.",
      });
      navigate('/esp-report');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete evaluation: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this ESP evaluation?')) {
      deleteMutation.mutate();
    }
  };

  const handleExcelDownload = () => {
    const workbook = XLSX.utils.book_new();
    
    // Sheet 1: General Info
    const generalInfo = [
      ['ESP Evaluation Report'],
      [],
      ['Store', `${evaluation?.store_name} - ${evaluation?.store_city}`],
      ['PIC', evaluation?.pic],
      ['Evaluation Date', format(new Date(evaluation?.evaluation_date || ''), 'dd MMMM yyyy')],
      ['Final Score', evaluation?.final_score],
      ['KPI Score', evaluation?.kpi_score],
      [],
      ['Findings']
    ];
    
    const ws1 = XLSX.utils.aoa_to_sheet(generalInfo);
    XLSX.utils.book_append_sheet(workbook, ws1, "General Info");

    // Sheet 2: Findings Detail
    const findingsData = [
      ['Finding', 'Deduction Points']
    ];
    findings.forEach(f => {
      findingsData.push([f.finding, f.deduction_points.toString()]);
    });
    
    const ws2 = XLSX.utils.aoa_to_sheet(findingsData);
    XLSX.utils.book_append_sheet(workbook, ws2, "Findings Detail");

    // Download file
    XLSX.writeFile(workbook, `ESP_Report_${evaluation?.store_name}_${format(new Date(evaluation?.evaluation_date || ''), 'dd-MM-yyyy')}.xlsx`);
  };

  if (isLoading || isLoadingFindings) {
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

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="border-gray-200 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="ml-4"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Record
          </Button>
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-gray-900">
          ESP Evaluation Details
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
              {format(new Date(evaluation.evaluation_date), 'dd MMMM yyyy')}
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">{evaluation.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Total Score</p>
            <p className="text-base sm:text-lg font-semibold text-gray-900">{evaluation.total_score}</p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">Final Score</p>
            <p className="text-base sm:text-lg font-semibold">
              <span className={evaluation.final_score >= 90 ? 'text-green-600' : 'text-red-600'}>
                {evaluation.final_score}
              </span>
            </p>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600">KPI Score</p>
            <p className="text-base sm:text-lg font-semibold">
              <span className={evaluation.kpi_score >= 3 ? 'text-green-600' : 'text-red-600'}>
                {evaluation.kpi_score}
              </span>
            </p>
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
              <EspPDF 
                evaluation={evaluation} 
                findings={findings}
              />
            }
            fileName={`ESP_Report_${evaluation.store_name}_${format(new Date(evaluation.evaluation_date), 'dd-MM-yyyy')}.pdf`}
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
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900">Findings</h3>
          <div className="min-w-[640px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-700">No</TableHead>
                  <TableHead className="text-gray-700">Finding</TableHead>
                  <TableHead className="text-gray-700 text-right">Deduction Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {findings.map((finding, index) => (
                  <TableRow key={finding.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900 text-sm sm:text-base">{index + 1}</TableCell>
                    <TableCell className="text-gray-900 text-sm sm:text-base">{finding.finding}</TableCell>
                    <TableCell className="text-right font-medium text-red-600 text-sm sm:text-base">
                      -{finding.deduction_points}
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

export default EspReportDetail;
