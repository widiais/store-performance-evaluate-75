
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const ServiceReportDetail = () => {
  const { id } = useParams();

  const { data: report, isLoading: isReportLoading } = useQuery({
    queryKey: ['serviceReport', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_evaluation_report')
        .select('*')
        .eq('id', parseInt(id as string))
        .single();

      if (error) throw error;
      return data;
    }
  });

  if (isReportLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Report Detail</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold">Store Information</h3>
              <p>Store Name: {report?.store_name}</p>
              <p>Store City: {report?.store_city}</p>
              <p>PIC: {report?.pic}</p>
            </div>
            <div>
              <h3 className="font-semibold">Evaluation Information</h3>
              <p>Date: {new Date(report?.evaluation_date).toLocaleDateString()}</p>
              <p>Total Score: {report?.total_score}%</p>
              <p>Status: {report?.status}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceReportDetail;
