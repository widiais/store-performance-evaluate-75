
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, ComplaintRecord } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart } from "@/components/charts/LineChart";
import { format } from "date-fns";

interface ComplaintKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

const StoreComplaintCard = ({ 
  store, 
  data 
}: { 
  store: Store; 
  data: ComplaintRecord[];
}) => {
  // Group data by month for the chart
  const monthlyData = data.reduce((acc, record) => {
    const monthKey = format(new Date(record.input_date), 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = {
        kpi_score: 0,
        complaints: 0,
        count: 0
      };
    }
    acc[monthKey].kpi_score += record.kpi_score;
    acc[monthKey].complaints += record.total_weighted_complaints;
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { kpi_score: number; complaints: number; count: number }>);

  // Format data for chart
  const chartData = Object.entries(monthlyData).map(([month, values]) => ({
    date: month,
    'KPI Score': Number((values.kpi_score / values.count).toFixed(2)),
    'Complaints': values.complaints
  }));

  // Calculate averages
  const averageKPI = data.length > 0
    ? (data.reduce((sum, r) => sum + r.kpi_score, 0) / data.length).toFixed(2)
    : '0';

  const totalComplaints = data.reduce((sum, r) => sum + r.total_weighted_complaints, 0);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>
        
        {/* KPI Score Box */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Final KPI Score</h3>
            <div className="text-2xl font-bold">{averageKPI}</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Total Complaints</h3>
            <div className="text-2xl font-bold">{totalComplaints}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] mt-4">
          <LineChart
            data={chartData}
            xField="date"
            yField={['KPI Score', 'Complaints']}
            title="Monthly Complaint Trend"
          />
        </div>

        {/* Details Table */}
        <ScrollArea className="h-[200px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Complaints</TableHead>
                <TableHead>KPI Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.input_date), 'dd/MM/yy')}</TableCell>
                  <TableCell>{record.total_weighted_complaints}</TableCell>
                  <TableCell className={record.kpi_score >= 3 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {record.kpi_score}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </Card>
  );
};

export const ComplaintKPI = ({ selectedStores, selectedMonth, selectedYear }: ComplaintKPIProps) => {
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

  const { data: complaintData } = useQuery({
    queryKey: ["complaintData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("complaint_records_report")
        .select("*")
        .in("store_name", selectedStores.map((store) => store.name))
        .in('input_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as ComplaintRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedStores.map(store => (
        <StoreComplaintCard
          key={store.id}
          store={store}
          data={(complaintData || []).filter(record => record.store_name === store.name)}
        />
      ))}
    </div>
  );
};
