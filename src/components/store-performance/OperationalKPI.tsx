
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart } from "@/components/charts/LineChart";
import { Store, EvaluationRecord, ChartDataPoint } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OperationalKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const OperationalKPI = ({ selectedStores, selectedMonth, selectedYear }: OperationalKPIProps) => {
  const champsQueryKey = ["champsData", selectedMonth, selectedYear];
  const cleanlinessQueryKey = ["cleanlinessData", selectedMonth, selectedYear];

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

  const { data: performanceData } = useQuery({
    queryKey: champsQueryKey,
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("champs_evaluation_report")
        .select("*")
        .in(
          "store_name",
          selectedStores.map((store) => store.name)
        )
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as EvaluationRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  const formatChartData = (data: EvaluationRecord[]): ChartDataPoint[] => {
    const groupedData = data?.reduce((acc, record) => {
      const date = record.evaluation_date;
      if (!acc[date]) {
        acc[date] = {
          records: [],
          averages: {},
        };
      }
      acc[date].records.push(record);
      return acc;
    }, {} as Record<string, { records: EvaluationRecord[]; averages: Record<string, number> }>) || {};

    return Object.entries(groupedData).map(([date, { records }]) => {
      const point: ChartDataPoint = { date };
      selectedStores.forEach((store) => {
        const storeRecords = records.filter((r) => r.store_name === store.name);
        if (storeRecords.length > 0) {
          const avg = storeRecords.reduce((sum, r) => sum + r.total_score, 0) / storeRecords.length;
          point[store.name] = Number(avg.toFixed(2));
        } else {
          point[store.name] = null;
        }
      });
      return point;
    });
  };

  const chartData = performanceData ? formatChartData(performanceData) : [];
  const averageScore = performanceData?.length 
    ? (performanceData.reduce((sum, record) => sum + record.total_score, 0) / performanceData.length).toFixed(2)
    : '0';
  const totalEvaluations = performanceData?.length || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Column - KPI Chart */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* KPI Score Box */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">KPI Score</h3>
            <div className="text-2xl font-bold">{averageScore}</div>
          </div>

          {/* Date Taken Box */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Evaluation Dates</h3>
            <div className="text-sm">
              {performanceData?.map(record => format(new Date(record.evaluation_date), 'dd/MM/yy')).join(', ')}
            </div>
          </div>

          {/* Average KPI Box */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Average KPI</h3>
            <div>Store Average: {averageScore}</div>
            <div>Total Evaluations: {totalEvaluations}</div>
          </div>

          {/* Chart */}
          <div className="h-[200px] mt-4">
            <LineChart
              data={chartData}
              xField="date"
              yField={selectedStores.map((store) => store.name)}
              title="Performance Trend"
            />
          </div>
        </div>
      </Card>

      {/* Right Column - Detailed Data */}
      <Card className="p-6">
        <h3 className="font-medium text-lg mb-4">Performance Details</h3>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>KPI Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {performanceData?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.evaluation_date), 'dd/MM/yy')}</TableCell>
                  <TableCell>{record.store_name}</TableCell>
                  <TableCell className={record.total_score >= 3 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {record.total_score.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
};
