
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";

const CleanlinessReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: report, isLoading } = useQuery({
    queryKey: ['cleanlinessReport', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleanliness_evaluation_report')
        .select('*')
        .eq('id', parseInt(id as string))
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
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
          Cleanliness Evaluation Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <p className="text-sm text-dashboard-muted">Store</p>
            <p className="text-lg font-semibold">{report?.store_name} - {report?.store_city}</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <p className="text-sm text-dashboard-muted">PIC</p>
            <p className="text-lg font-semibold">{report?.pic}</p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <p className="text-sm text-dashboard-muted">Evaluation Date</p>
            <p className="text-lg font-semibold">
              {report?.evaluation_date ? format(new Date(report.evaluation_date), 'dd MMMM yyyy') : '-'}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <p className="text-sm text-dashboard-muted">Score</p>
            <p className="text-lg font-semibold">
              <span className={report?.total_score >= 3 ? 'text-green-500' : 'text-red-500'}>
                {report?.total_score}%
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanlinessReportDetail;
