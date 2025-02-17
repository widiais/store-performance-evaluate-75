
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { AlertCircle, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart } from "@/components/charts/LineChart";

interface SanctionKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

const StoreSanctionCard = ({ store }: { store: Store }) => {
  const { data: sanctionData } = useQuery({
    queryKey: ["sanctionData", store.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_sanctions_kpi")
        .select()
        .eq("store_id", store.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: activeSanctions } = useQuery({
    queryKey: ["activeSanctions", store.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employee_sanctions_report")
        .select()
        .eq("store_id", store.id)
        .eq("is_active", true)
        .order("sanction_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Calculate KPI score based on crew count from store
  const calculateKPIScore = () => {
    if (!sanctionData || !store.total_crew) return 0;

    const peringatanWeight = sanctionData.active_peringatan * 0.5;
    const sp1Weight = sanctionData.active_sp1 * 1;
    const sp2Weight = sanctionData.active_sp2 * 2;
    
    const totalWeight = peringatanWeight + sp1Weight + sp2Weight;
    const maxWeight = store.total_crew * 2; // Using total_crew instead of total_employees
    
    const kpiScore = 4 * (1 - totalWeight / maxWeight);
    return Math.max(0, Math.min(4, kpiScore));
  };

  const kpiScore = calculateKPIScore();

  // Prepare chart data - using monthly grouping
  const monthlyData = activeSanctions?.reduce((acc, sanction) => {
    const monthKey = format(new Date(sanction.sanction_date), 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = {
        total: 0,
        sanctions: { SP2: 0, SP1: 0, Peringatan: 0 }
      };
    }
    acc[monthKey].total += 1;
    acc[monthKey].sanctions[sanction.sanction_type] += 1;
    return acc;
  }, {} as Record<string, { total: number; sanctions: Record<string, number> }>) || {};

  const chartData = Object.entries(monthlyData).map(([month, data]) => ({
    date: month,
    'Total Active': data.total,
    'KPI Score': kpiScore
  }));

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{store.name} - {store.city}</h2>
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <span className="text-gray-500">{store.total_crew} Crew</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Active Warnings</p>
            <p className="text-xl font-medium text-yellow-600">{sanctionData?.active_peringatan || 0}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Active SP1</p>
            <p className="text-xl font-medium text-orange-600">{sanctionData?.active_sp1 || 0}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Active SP2</p>
            <p className="text-xl font-medium text-red-600">{sanctionData?.active_sp2 || 0}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">KPI Score</p>
            <p className={`text-xl font-medium ${
              kpiScore >= 3 ? 'text-green-600' :
              kpiScore >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {kpiScore.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] mt-4">
          <LineChart
            data={chartData}
            xField="date"
            yField={['Total Active', 'KPI Score']}
            title="Monthly Sanction Trend"
          />
        </div>

        <ScrollArea className="h-[200px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee Name</TableHead>
                <TableHead>Sanction Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeSanctions?.length ? (
                activeSanctions.map((sanction) => (
                  <TableRow key={sanction.id}>
                    <TableCell className="font-medium">{sanction.employee_name}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${sanction.sanction_type === 'SP2' ? 'bg-red-100 text-red-800' :
                          sanction.sanction_type === 'SP1' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                        {sanction.sanction_type}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(sanction.sanction_date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{sanction.violation_details}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    <div className="flex items-center justify-center text-gray-500">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      No active sanctions
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </Card>
  );
};

export const SanctionKPI = ({ selectedStores, selectedMonth, selectedYear }: SanctionKPIProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedStores.map(store => (
        <StoreSanctionCard key={store.id} store={store} />
      ))}
    </div>
  );
};
