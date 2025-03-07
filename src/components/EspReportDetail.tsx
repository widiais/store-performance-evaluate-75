
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
  TableRow 
} from "@/components/ui/table";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, FileText, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import EspReportPDF from "./EspReportPDF";
import { EspFinding } from "@/integrations/supabase/client-types";

interface Finding {
  id: number;
  evaluation_id: number;
  finding: string;
  deduction_points: number;
}

interface Evaluation {
  id: number;
  store_name: string;
  store_city: string;
  evaluation_date: string;
  pic: string;
  total_score: number;
  final_score: number;
  kpi_score: number;
  status: string;
}

const EspReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: evaluation, isLoading } = useQuery<Evaluation>({
    queryKey: ['esp-evaluation', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('esp_evaluation_report')
        .select('*')
        .eq('id', parseInt(id || '0'))
        .single();
      
      if (error) throw error;
      return data as Evaluation;
    },
    enabled: !!id,
  });

  const { data: findings = [], isLoading: isLoadingFindings } = useQuery<Finding[]>({
    queryKey: ['esp-findings', id],
    queryFn: async () => {
      // Direct query instead of RPC function
      const { data, error } = await supabase
        .from('esp_findings')
        .select('*')
        .eq('evaluation_id', parseInt(id || '0'));
      
      if (error) throw error;
      return (data as Finding[]) || [];
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
        title: "ESP evaluation deleted",
        description: "The ESP evaluation has been successfully deleted.",
      });
      navigate('/esp-report');
      queryClient.invalidateQueries({ queryKey: ['esp-evaluations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to delete evaluation: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this ESP evaluation?")) {
      deleteMutation.mutate();
    }
  };

  const exportToExcel = () => {
    if (!evaluation || findings.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet([
      {
        "Store": evaluation.store_name,
        "Date": format(new Date(evaluation.evaluation_date), "dd/MM/yyyy"),
        "PIC": evaluation.pic,
        "Total Score": evaluation.total_score,
        "Final Score": evaluation.final_score,
        "KPI Score": evaluation.kpi_score,
      }
    ]);

    // Add empty row
    XLSX.utils.sheet_add_json(worksheet, [{}], { origin: -1 });

    // Add findings
    XLSX.utils.sheet_add_json(worksheet, [{ "Findings": "Findings", "Deduction Points": "Deduction Points" }], { origin: -1 });
    XLSX.utils.sheet_add_json(
      worksheet,
      findings.map(f => ({ "Findings": f.finding, "Deduction Points": f.deduction_points })),
      { origin: -1 }
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ESP Evaluation");
    XLSX.writeFile(workbook, `ESP_Evaluation_${evaluation.store_name}_${format(new Date(evaluation.evaluation_date), "yyyyMMdd")}.xlsx`);
  };

  if (isLoading || isLoadingFindings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!evaluation) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">ESP evaluation not found</p>
          <Button variant="outline" onClick={() => navigate('/esp-report')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Report
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate('/esp-report')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Report
        </Button>
        <div className="flex gap-2">
          <PDFDownloadLink
            document={<EspReportPDF evaluation={evaluation} findings={findings} />}
            fileName={`ESP_Evaluation_${evaluation.store_name}_${format(new Date(evaluation.evaluation_date), "yyyyMMdd")}.pdf`}
          >
            {({ loading }) => (
              <Button variant="outline" disabled={loading}>
                <FileText className="h-4 w-4 mr-2" />
                {loading ? "Generating PDF..." : "Download PDF"}
              </Button>
            )}
          </PDFDownloadLink>
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold">{evaluation.store_name}</h2>
            <p className="text-gray-600">{evaluation.store_city}</p>
          </div>

          <div className="md:text-right">
            <p className="text-gray-600">
              <span className="font-medium">PIC:</span> {evaluation.pic}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Date:</span> {format(new Date(evaluation.evaluation_date), "dd MMMM yyyy")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-1">Total Score</h3>
            <p className="text-3xl font-bold">{evaluation.total_score}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-1">Final Score</h3>
            <p className="text-3xl font-bold">{evaluation.final_score}</p>
            <Badge 
              className={
                evaluation.final_score >= 75 ? "bg-green-100 text-green-800" :
                evaluation.final_score >= 50 ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }
            >
              {evaluation.final_score >= 75 ? "Good" : 
              evaluation.final_score >= 50 ? "Average" : "Poor"}
            </Badge>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-1">KPI Score</h3>
            <p className={`text-3xl font-bold ${
              evaluation.kpi_score >= 3 ? "text-green-600" :
              evaluation.kpi_score >= 2 ? "text-yellow-600" :
              "text-red-600"
            }`}>
              {evaluation.kpi_score}
            </p>
          </div>
        </div>
      </Card>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-4">Findings & Deductions</h2>
        
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Finding</TableHead>
                <TableHead className="text-right">Deduction Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {findings.length > 0 ? (
                findings.map(finding => (
                  <TableRow key={finding.id}>
                    <TableCell>{finding.finding}</TableCell>
                    <TableCell className="text-right font-medium">{finding.deduction_points}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                    No findings recorded
                  </TableCell>
                </TableRow>
              )}
              {findings.length > 0 && (
                <TableRow>
                  <TableCell className="font-bold">Total Deductions</TableCell>
                  <TableCell className="text-right font-bold">
                    {findings.reduce((total, finding) => total + finding.deduction_points, 0)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default EspReportDetail;
