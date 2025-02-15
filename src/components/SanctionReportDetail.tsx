
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";

const SanctionReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: sanction, isLoading } = useQuery({
    queryKey: ['sanctionDetail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sanctions_report')
        .select('*')
        .eq('id', parseInt(id || '0'))
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!sanction) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Sanction record not found</p>
          <Button
            variant="outline"
            onClick={() => navigate('/sanction-report')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Report
          </Button>
        </div>
      </div>
    );
  }

  const getSanctionColor = (type: string) => {
    switch (type) {
      case 'Peringatan Tertulis':
        return 'bg-yellow-100 text-yellow-800';
      case 'SP1':
        return 'bg-orange-100 text-orange-800';
      case 'SP2':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/sanction-report')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Report
          </Button>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Sanction Details</h2>
            <p className="text-gray-500">
              {sanction.store_name} - {sanction.store_city}
            </p>
          </div>

          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-gray-900">{format(new Date(sanction.sanction_date), 'dd MMMM yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PIC</p>
                <p className="text-gray-900">{sanction.pic}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="grid gap-4">
                <div>
                  <p className="text-sm text-gray-500">Employee Name</p>
                  <p className="text-gray-900 font-medium">{sanction.employee_name}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Sanction Type</p>
                    <Badge className={getSanctionColor(sanction.sanction_type)}>
                      {sanction.sanction_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-gray-900">{sanction.duration_months} months</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Violation Details</p>
                  <p className="text-gray-900 whitespace-pre-wrap">{sanction.violation_details}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Submitted By</p>
                  <p className="text-gray-900">{sanction.submitted_by}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SanctionReportDetail;
