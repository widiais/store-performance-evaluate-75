
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

const WorkplaceReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: store } = useQuery({
    queryKey: ['store-detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', parseInt(id || '0'))
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: kpiData } = useQuery({
    queryKey: ['store-kpi', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sanctions_kpi')
        .select('*')
        .eq('store_id', parseInt(id || '0'))
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: sanctions = [], isLoading } = useQuery({
    queryKey: ['store-sanctions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sanctions_report')
        .select('*')
        .eq('store_id', parseInt(id || '0'))
        .eq('is_active', true)
        .order('sanction_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const totalSanctionScore = sanctions.reduce((total, sanction) => {
    switch (sanction.sanction_type) {
      case 'Peringatan Tertulis':
        return total + 1;
      case 'SP1':
        return total + 2;
      case 'SP2':
        return total + 3;
      default:
        return total;
    }
  }, 0);

  return (
    <div className="p-8">
      <Button 
        variant="outline" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Workplace Report
      </Button>

      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{store?.name}</h2>
          <p className="text-gray-600">
            Area {store?.area} - Region {store?.regional}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Crew</h3>
            <p className="text-2xl font-bold">{store?.total_crew || 0}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Active Sanctions</h3>
            <p className="text-2xl font-bold">{sanctions.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Total Score</h3>
            <p className="text-2xl font-bold">{totalSanctionScore}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">KPI Score</h3>
            <p className={`text-2xl font-bold ${
              (kpiData?.kpi_score || 0) >= 3 ? 'text-green-600' :
              (kpiData?.kpi_score || 0) >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {kpiData?.kpi_score?.toFixed(2) || '-'}
            </p>
          </Card>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Sanction Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Violation Details</TableHead>
                <TableHead>PIC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sanctions.map((sanction) => (
                <TableRow key={sanction.id}>
                  <TableCell className="font-medium">
                    {sanction.employee_name}
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${sanction.sanction_type === 'SP2' ? 'bg-red-100 text-red-800' :
                        sanction.sanction_type === 'SP1' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {sanction.sanction_type}
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(sanction.sanction_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{sanction.duration_months} months</TableCell>
                  <TableCell>{sanction.violation_details}</TableCell>
                  <TableCell>{sanction.pic}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default WorkplaceReportDetail;
