
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

export const ComplaintKPI = ({ selectedStores, selectedMonth, selectedYear }: ComplaintKPIProps) => {
  const queryKey = ["complaintData", selectedMonth, selectedYear];
  
  const { data: complaintData } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: filteredDates, error: dateError } = await supabase.rpc('filter_evaluation_by_month_year', {
        target_month: selectedMonth,
        target_year: selectedYear
      });

      if (dateError) throw dateError;
      if (!filteredDates?.length) return [];

      const { data, error } = await supabase
        .from("complaint_records_report")
        .select("*")
        .in(
          "store_name",
          selectedStores.map((store) => store.name)
        )
        .in('input_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as ComplaintRecord[];
    },
    enabled: selectedStores.length > 0
  });

  const chartData = complaintData?.map(record => ({
    date: record.input_date,
    [record.store_name]: record.kpi_score
  })) || [];

  const averageKPI = complaintData?.length 
    ? (complaintData.reduce((sum, record) => sum + record.kpi_score, 0) / complaintData.length).toFixed(2)
    : '0';

  const totalComplaints = complaintData?.reduce((sum, record) => sum + record.total_weighted_complaints, 0) || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Column - KPI Chart */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* KPI Score Box */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">KPI Score</h3>
            <div className="text-2xl font-bold">{averageKPI}</div>
          </div>

          {/* Total Complaints Box */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Total Complaints</h3>
            <div className="text-2xl font-bold">{totalComplaints}</div>
          </div>

          {/* Chart */}
          <div className="h-[300px] mt-4">
            <LineChart
              data={chartData}
              xField="date"
              yField={selectedStores.map((store) => store.name)}
              title="Complaints Trend"
            />
          </div>
        </div>
      </Card>

      {/* Right Column - Detailed Data */}
      <Card className="p-6">
        <h3 className="font-medium text-lg mb-4">Complaint Details</h3>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>KPI Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {complaintData?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.input_date), 'dd/MM/yy')}</TableCell>
                  <TableCell>{record.store_name}</TableCell>
                  <TableCell>{record.total_weighted_complaints}</TableCell>
                  <TableCell className={record.kpi_score >= 3 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {record.kpi_score}
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
