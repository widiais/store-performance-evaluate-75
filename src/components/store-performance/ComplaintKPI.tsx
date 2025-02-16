
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, ComplaintRecord } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ComplaintKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const ComplaintKPI = ({ selectedStores, selectedMonth, selectedYear }: ComplaintKPIProps) => {
  const { data: complaintData } = useQuery<ComplaintRecord[]>({
    queryKey: ["complaintData", selectedMonth, selectedYear, selectedStores.map(s => s.id)],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaint_records_report")
        .select("*")
        .in(
          "store_name",
          selectedStores.map((store) => store.name)
        )
        .eq("EXTRACT(MONTH FROM input_date)::integer", selectedMonth)
        .eq("EXTRACT(YEAR FROM input_date)::integer", selectedYear);

      if (error) throw error;
      return data;
    },
    enabled: selectedStores.length > 0
  });

  if (!complaintData) {
    return (
      <Card className="p-4">
        <p className="text-center text-gray-500">No complaint data available</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="p-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Store</TableHead>
              <TableHead>Total Complaints</TableHead>
              <TableHead>Avg. CU/Day</TableHead>
              <TableHead>KPI Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {complaintData.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.store_name}</TableCell>
                <TableCell>{record.total_weighted_complaints}</TableCell>
                <TableCell>{record.avg_cu_per_day}</TableCell>
                <TableCell>{record.kpi_score}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};
