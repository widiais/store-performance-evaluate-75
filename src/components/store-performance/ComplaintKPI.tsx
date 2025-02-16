import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, ComplaintRecord } from "./types";

interface ComplaintKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const ComplaintKPI = ({ selectedStores, selectedMonth, selectedYear }: ComplaintKPIProps) => {
  const { data: complaintData } = useQuery({
    queryKey: ["complaintData", selectedStores, selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("complaint_records_report")
        .select("*")
        .in(
          "store_id",
          selectedStores.map((store) => store.id)
        )
        .eq("month", selectedMonth)
        .eq("year", selectedYear);

      if (error) throw error;
      return data as ComplaintRecord[];
    },
  });

  const calculateComplaintKPI = (record: ComplaintRecord) => {
    // KPI Score calculation based on weighted complaints and average customers
    const kpiScore = 4 - (record.total_weighted_complaints / record.avg_cu_per_day) * 100;
    return Math.max(0, Math.min(4, kpiScore));
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 h-[600px]">
        <div className="overflow-auto" style={{ maxHeight: "550px" }}>
          <table className="w-full">
            <thead>
              <tr>
                <th>Store</th>
                <th>Total Weighted Complaints</th>
                <th>Avg. Customers/Day</th>
                <th>KPI Score</th>
              </tr>
            </thead>
            <tbody>
              {complaintData?.map((record) => {
                const kpiScore = calculateComplaintKPI(record);
                return (
                  <tr key={record.id}>
                    <td>{record.store_name}</td>
                    <td className="text-red-500">{record.total_weighted_complaints}</td>
                    <td>{record.avg_cu_per_day}</td>
                    <td className={kpiScore >= 3 ? "text-green-500" : "text-red-500"}>
                      {kpiScore.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}; 