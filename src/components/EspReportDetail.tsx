
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { EspFinding } from "@/integrations/supabase/client-types";

interface Finding {
  id: number;
  evaluation_id: number;
  finding: string;
  deduction_points: number;
}

const EspReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: report, isLoading: reportLoading } = useQuery({
    queryKey: ["esp-report", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("esp_evaluation_report")
        .select("*")
        .eq("id", parseInt(id || "0"))
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: findings = [], isLoading: findingsLoading } = useQuery<Finding[]>({
    queryKey: ["esp-findings", id],
    queryFn: async () => {
      if (!id) return [];
      
      const { data, error } = await supabase
        .from("esp_findings")
        .select("*")
        .eq("evaluation_id", parseInt(id));

      if (error) throw error;
      return data as Finding[];
    },
    enabled: !!id,
  });

  const isLoading = reportLoading || findingsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Report Not Found</h2>
          <p className="text-gray-500">
            The ESP evaluation report you're looking for does not exist.
          </p>
          <Button
            variant="outline"
            onClick={() => navigate("/esp-report")}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reports
          </Button>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getKpiScoreColor = (score: number) => {
    if (score >= 3) return "text-green-600";
    if (score >= 2) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-8">
      <Button
        variant="outline"
        onClick={() => navigate("/esp-report")}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Reports
      </Button>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {report.store_name} - {report.store_city}
          </h2>
          <p className="text-gray-500">
            {format(new Date(report.evaluation_date), "PPP")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Base Score
            </h3>
            <p className="text-2xl font-bold">{report.total_score}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Total Deductions
            </h3>
            <p className="text-2xl font-bold text-red-600">
              {report.total_score - report.final_score}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              Final Score
            </h3>
            <p
              className={`text-2xl font-bold ${getScoreColor(
                report.final_score
              )}`}
            >
              {report.final_score}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              KPI Score
            </h3>
            <p
              className={`text-2xl font-bold ${getKpiScoreColor(
                report.kpi_score
              )}`}
            >
              {report.kpi_score}/4
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Findings</h3>
          {findings.length === 0 ? (
            <p className="text-gray-500 italic">No findings recorded</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border-b">Finding</th>
                  <th className="text-right p-3 border-b w-32">
                    Deduction Points
                  </th>
                </tr>
              </thead>
              <tbody>
                {findings.map((finding) => (
                  <tr key={finding.id} className="border-b">
                    <td className="p-3">{finding.finding}</td>
                    <td className="p-3 text-right text-red-600">
                      {finding.deduction_points}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="p-3">Total</td>
                  <td className="p-3 text-right text-red-600">
                    {findings.reduce(
                      (sum, finding) => sum + finding.deduction_points,
                      0
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-gray-500">
            <span className="font-medium">PIC:</span> {report.pic}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-medium">Status:</span>{" "}
            <span
              className={
                report.status === "completed"
                  ? "text-green-600"
                  : "text-yellow-600"
              }
            >
              {report.status}
            </span>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EspReportDetail;
