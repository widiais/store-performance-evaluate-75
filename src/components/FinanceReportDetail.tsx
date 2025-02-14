import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const calculateKPI = (actual: number, target: number): number => {
  if (!target) return 0;
  return Math.min((actual / target) * 4, 4);
};

const calculateOPEXKPI = (totalSales: number, actualOPEX: number, targetOPEXPercentage: number): number => {
  if (!totalSales || !targetOPEXPercentage) return 0;
  const actualOPEXPercentage = (actualOPEX / totalSales) * 100;
  return Math.max(0, Math.min((targetOPEXPercentage / actualOPEXPercentage) * 4, 4));
};

const FinanceReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Convert id to number
  const numericId = id ? parseInt(id) : 0;

  const { data: record, isLoading } = useQuery({
    queryKey: ['finance-record', numericId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_records_report')
        .select('*')
        .eq('id', numericId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('financial_records')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', numericId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-records'] });
      toast.success('Record deleted successfully');
      navigate('/finance-report');
    },
    onError: (error) => {
      toast.error('Failed to delete record');
      console.error('Delete error:', error);
    },
  });

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">Record not found</div>
        <Button onClick={() => navigate('/finance-report')} className="mt-4">
          Back to Report
        </Button>
      </div>
    );
  }

  const salesKPI = calculateKPI(record.total_sales, record.target_sales || 0);
  const cogsKPI = calculateKPI(record.cogs_target || 0, record.cogs_achieved);
  const productivityKPI = calculateKPI(record.total_sales / (record.total_crew || 1), 30000000);
  const opexKPI = calculateOPEXKPI(record.total_sales, record.total_opex, 4); // 4% is the target

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Financial Record Detail
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/finance-report')}
            >
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              Delete Record
            </Button>
          </div>
        </div>

        <Card className="p-6 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Store Information</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Date:</span> {format(new Date(record.input_date), 'dd/MM/yyyy')}</p>
                <p><span className="font-medium">Store Name:</span> {record.store_name}</p>
                <p><span className="font-medium">City:</span> {record.store_city}</p>
                <p><span className="font-medium">Regional:</span> {record.regional}</p>
                <p><span className="font-medium">Area:</span> {record.area}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Financial Metrics</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Total Sales:</span> {record.total_sales?.toLocaleString()}</p>
                <p><span className="font-medium">Target Sales:</span> {record.target_sales?.toLocaleString()}</p>
                <p><span className="font-medium">COGS Achieved:</span> {record.cogs_achieved?.toLocaleString()}</p>
                <p><span className="font-medium">COGS Target:</span> {record.cogs_target?.toLocaleString()}</p>
                <p><span className="font-medium">Total OPEX:</span> {record.total_opex?.toLocaleString()}</p>
                <p><span className="font-medium">OPEX Target:</span> {record.opex_target?.toLocaleString()}</p>
                <p><span className="font-medium">Total Crew:</span> {record.total_crew}</p>
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-semibold mb-4">KPI Scores</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Sales KPI</p>
                  <p className={`text-2xl font-semibold ${salesKPI >= 3 ? 'text-green-600' : salesKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {salesKPI.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">COGS KPI</p>
                  <p className={`text-2xl font-semibold ${cogsKPI >= 3 ? 'text-green-600' : cogsKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {cogsKPI.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Productivity KPI</p>
                  <p className={`text-2xl font-semibold ${productivityKPI >= 3 ? 'text-green-600' : productivityKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {productivityKPI.toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">OPEX KPI</p>
                  <p className={`text-2xl font-semibold ${opexKPI >= 3 ? 'text-green-600' : opexKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {opexKPI.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FinanceReportDetail;
