
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, AlertCircle, Trash2, FileDown } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { PDFDownloadLink } from "@react-pdf/renderer";
import SanctionReportPDF from './SanctionReportPDF';
import { EmployeeSanctionRecord } from '@/integrations/supabase/client-types';
import { mapToEmployeeSanctionRecord } from '@/utils/typeUtils';

const SanctionReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sanctionData, isLoading } = useQuery<EmployeeSanctionRecord>({
    queryKey: ["sanction", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Sanction ID is required");
      }
      
      const { data, error } = await supabase
        .from("employee_sanctions")
        .select(`
          id,
          store_id,
          employee_name,
          sanction_type,
          input_date,
          duration_months,
          expiry_date,
          violation_details,
          submitted_by,
          is_active,
          pic,
          created_at,
          updated_at,
          stores:store_id (
            name,
            city,
            total_crew,
            area,
            regional
          )
        `)
        .eq("id", parseInt(id, 10))
        .single();

      if (error) throw error;
      
      // Transform data to include store properties
      const transformedData = {
        ...data,
        store_name: data.stores?.name || '',
        store_city: data.stores?.city || '',
        total_crew: data.stores?.total_crew || 0,
        area: data.stores?.area || 0,
        regional: data.stores?.regional || 0,
        sanction_date: data.input_date
      };
      
      return mapToEmployeeSanctionRecord(transformedData);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) {
        throw new Error("Sanction ID is required");
      }
      
      const { error } = await supabase
        .from('employee_sanctions')
        .delete()
        .eq('id', parseInt(id, 10));
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sanction deleted",
        description: "The sanction record has been successfully deleted.",
      });
      navigate('/sanction-report');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete sanction: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this sanction record?')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!sanctionData) {
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

  const getSanctionWeight = (type: string) => {
    switch (type) {
      case 'Peringatan Tertulis':
        return 1;
      case 'SP1':
        return 2;
      case 'SP2':
        return 3;
      default:
        return 0;
    }
  };

  const totalCrew = sanctionData.total_crew || 0;
  const sanctionWeight = getSanctionWeight(sanctionData.sanction_type);
  const violationRatio = totalCrew > 0 ? sanctionWeight / totalCrew : 0;
  const maxViolationRatio = 0.5; // 50% of total crew
  const kpiScore = Math.max(0, (1 - (violationRatio / maxViolationRatio)) * 4);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/sanction-report')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Report
            </Button>
            
            <PDFDownloadLink
              document={<SanctionReportPDF data={sanctionData} />}
              fileName={`sanction-${sanctionData.employee_name}-${format(new Date(sanctionData.sanction_date), 'yyyy-MM-dd')}.pdf`}
            >
              {({ loading }) => (
                <Button variant="secondary" disabled={loading}>
                  <FileDown className="h-4 w-4 mr-2" />
                  {loading ? "Generating PDF..." : "Download PDF"}
                </Button>
              )}
            </PDFDownloadLink>
          </div>

          <Button
            variant="destructive"
            onClick={handleDelete}
            className="ml-4"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Record
          </Button>
        </div>

        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Sanction Details</h2>
            <p className="text-gray-500">
              {sanctionData.store_name} - {sanctionData.store_city}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="text-gray-900">{format(new Date(sanctionData.sanction_date), 'dd MMMM yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">PIC</p>
              <p className="text-gray-900">{sanctionData.pic}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-gray-500">Employee Name</p>
                <p className="text-gray-900 font-medium">{sanctionData.employee_name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Sanction Type</p>
                  <Badge className={getSanctionColor(sanctionData.sanction_type)}>
                    {sanctionData.sanction_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Duration</p>
                  <p className="text-gray-900">{sanctionData.duration_months} months</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Violation Details</p>
                <p className="text-gray-900 whitespace-pre-wrap">{sanctionData.violation_details}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Submitted By</p>
                <p className="text-gray-900">{sanctionData.submitted_by}</p>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">KPI Calculation</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-blue-700">Total Crew:</p>
                    <p className="text-sm text-blue-900 font-medium">{totalCrew}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-blue-700">Sanction Weight:</p>
                    <p className="text-sm text-blue-900 font-medium">{sanctionWeight}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-blue-700">Violation Ratio:</p>
                    <p className="text-sm text-blue-900 font-medium">
                      {(violationRatio * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <p className="text-sm text-blue-700">KPI Score:</p>
                    <p className={`text-sm font-medium ${
                      kpiScore >= 3 ? 'text-green-600' :
                      kpiScore >= 2 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {kpiScore.toFixed(2)}
                    </p>
                  </div>
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
