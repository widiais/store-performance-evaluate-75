
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, ESPRecord } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart } from "@/components/charts/LineChart";
import { format } from "date-fns";

interface AuditKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

const StoreAuditCard = ({ 
  store, 
  data 
}: { 
  store: Store; 
  data: ESPRecord[];
}) => {
  // Group data by month for the chart
  const monthlyData = data.reduce((acc, record) => {
    const monthKey = format(new Date(record.evaluation_date), 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = {
        kpi_score: 0,
        final_score: 0,
        count: 0
      };
    }
    acc[monthKey].kpi_score += record.kpi_score;
    acc[monthKey].final_score += record.final_score;
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { kpi_score: number; final_score: number; count: number }>);

  // Format data for chart
  const chartData = Object.entries(monthlyData).map(([month, values]) => ({
    date: month,
    'KPI Score': Number((values.kpi_score / values.count).toFixed(2)),
    'Final Score': Number((values.final_score / values.count).toFixed(2))
  }));

  // Calculate averages
  const averageKPI = data.length > 0
    ? (data.reduce((sum, r) => sum + r.kpi_score, 0) / data.length).toFixed(2)
    : '0';

  const averageFinalScore = data.length > 0
    ? (data.reduce((sum, r) => sum + r.final_score, 0) / data.length).toFixed(2)
    : '0';

  // Get findings from the latest evaluation
  const latestEvaluation = data.sort((a, b) => 
    new Date(b.evaluation_date).getTime() - new Date(a.evaluation_date).getTime()
  )[0];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>
        
        {/* KPI Score Boxes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">KPI Score</h3>
            <div className="text-2xl font-bold">{averageKPI}</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Final Score</h3>
            <div className="text-2xl font-bold">{averageFinalScore}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] mt-4">
          <LineChart
            data={chartData}
            xField="date"
            yField={['KPI Score', 'Final Score']}
            title="Monthly Audit Performance"
          />
        </div>

        {/* Details Table */}
        <ScrollArea className="h-[200px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Final Score</TableHead>
                <TableHead>KPI Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.evaluation_date), 'dd/MM/yy')}</TableCell>
                  <TableCell className={record.final_score >= 90 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {record.final_score}
                  </TableCell>
                  <TableCell className={record.kpi_score >= 3 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {record.kpi_score}
                  </TableCell>
                  <TableCell>{record.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>

        {/* Findings Section */}
        {latestEvaluation && (
          <div className="mt-4">
            <h3 className="font-medium text-lg mb-2">Latest Findings</h3>
            <div className="space-y-2">
              {latestEvaluation.findings?.map((finding, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                  {finding}
                </div>
              ))}
              {(!latestEvaluation.findings || latestEvaluation.findings.length === 0) && (
                <div className="text-gray-500 italic">No findings recorded</div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export const AuditKPI = ({ selectedStores, selectedMonth, selectedYear }: AuditKPIProps) => {
  const { data: filteredDates } = useQuery({
    queryKey: ['filteredDates', selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('filter_evaluation_by_month_year', {
        target_month: selectedMonth,
        target_year: selectedYear
      });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: auditData } = useQuery({
    queryKey: ["auditData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("esp_evaluation_report")
        .select("*")
        .in("store_name", selectedStores.map((store) => store.name))
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as ESPRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedStores.map(store => (
        <StoreAuditCard
          key={store.id}
          store={store}
          data={(auditData || []).filter(record => record.store_name === store.name)}
        />
      ))}
    </div>
  );
};
