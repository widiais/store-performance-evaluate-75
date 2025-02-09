
import { useQuery } from "@tanstack/react-query";
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
import { ArrowLeft, FileSpreadsheet, FileText } from "lucide-react";
import EspPDF from "./EspReportPDF";

interface Finding {
  id: number;
  finding: string;
  deduction_points: number;
}

const EspReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

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
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-900/10 to-pink-900/10">
      <div className="max-w-5xl mx-auto">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Button>

        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          ESP Evaluation Details
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
              {format(new Date(evaluation.evaluation_date), 'dd MMMM yyyy')}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <p className="text-sm text-dashboard-muted">Status</p>
            <p className="text-lg font-semibold">{evaluation.status}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/10">
            <p className="text-sm text-dashboard-muted">Total Score</p>
            <p className="text-lg font-semibold">{evaluation.total_score}</p>
          </div>
          <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/10">
            <p className="text-sm text-dashboard-muted">Final Score</p>
            <p className="text-lg font-semibold">
              <span className={evaluation.final_score >= 90 ? 'text-green-500' : 'text-red-500'}>
                {evaluation.final_score}
              </span>
            </p>
          </div>
          <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <p className="text-sm text-dashboard-muted">KPI Score</p>
            <p className="text-lg font-semibold">
              <span className={evaluation.kpi_score >= 3 ? 'text-green-500' : 'text-red-500'}>
                {evaluation.kpi_score}
              </span>
            </p>
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
              <EspPDF 
                evaluation={evaluation} 
                findings={findings}
              />
            }
            fileName={`ESP_Report_${evaluation.store_name}_${format(new Date(evaluation.evaluation_date), 'dd-MM-yyyy')}.pdf`}
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
          <h3 className="text-lg font-semibold mb-4">Findings</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Finding</TableHead>
                <TableHead className="text-right">Deduction Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.map((finding, index) => (
                <TableRow key={finding.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{finding.finding}</TableCell>
                  <TableCell className="text-right font-medium text-red-500">
                    -{finding.deduction_points}
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

export default EspReportDetail;
