
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeSanctionRecord } from "@/integrations/supabase/client-types";
import { mapToActiveSanctions } from "@/utils/typeUtils";

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

  const { data: sanctionsData = [], isLoading } = useQuery({
    queryKey: ['store-sanctions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_employee_sanctions_by_store', { 
          store_id_param: parseInt(id || '0') 
        });

      if (error) throw error;
      
      // Transform the data with proper typing
      return data || [];
    },
  });

  // Map to proper format with all required fields
  const sanctions = mapToActiveSanctions(sanctionsData);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const activeSanctions = sanctions.filter(sanction => 
    'is_active' in (sanction as any) ? (sanction as any).is_active : true
  );
  const inactiveSanctions = sanctions.filter(sanction => 
    'is_active' in (sanction as any) ? !(sanction as any).is_active : false
  );

  const totalSanctionScore = activeSanctions.reduce((total, sanction) => {
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

  const maxViolationScore = (store?.total_crew || 0);
  const kpiScore = maxViolationScore > 0 
    ? Math.max(0, (1 - (totalSanctionScore / maxViolationScore)) * 4)
    : 4;

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
            <p className="text-2xl font-bold">{activeSanctions.length}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">Violation Score</h3>
            <p className="text-2xl font-bold">{totalSanctionScore}</p>
            <p className="text-xs text-gray-500 mt-1">Max allowed: {maxViolationScore.toFixed(1)}</p>
          </Card>
          <Card className="p-4">
            <h3 className="text-sm font-medium text-gray-500">KPI Score</h3>
            <p className={`text-2xl font-bold ${
              kpiScore >= 3 ? 'text-green-600' :
              kpiScore >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {kpiScore.toFixed(2)}
            </p>
          </Card>
        </div>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Sanctions</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Sanctions</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Sanction Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Violation Details</TableHead>
                    <TableHead>PIC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSanctions.map((sanction) => (
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
                      <TableCell>
                        {sanction.expiry_date && new Date(sanction.expiry_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{sanction.violation_details}</TableCell>
                      <TableCell>{sanction.pic}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="inactive">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead>Sanction Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Expiry Date</TableHead>
                    <TableHead>Violation Details</TableHead>
                    <TableHead>PIC</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inactiveSanctions.map((sanction) => (
                    <TableRow key={sanction.id}>
                      <TableCell className="font-medium">
                        {sanction.employee_name}
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
                          {sanction.sanction_type}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(sanction.sanction_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{sanction.duration_months} months</TableCell>
                      <TableCell>
                        {sanction.expiry_date && new Date(sanction.expiry_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{sanction.violation_details}</TableCell>
                      <TableCell>{sanction.pic}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default WorkplaceReportDetail;
