import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart } from "@/components/charts/LineChart";
import { Store, ChartDataPoint, EvaluationRecord } from "./types";

interface OperationalKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const OperationalKPI = ({ selectedStores, selectedMonth, selectedYear }: OperationalKPIProps) => {
  const { data: performanceData } = useQuery({
    queryKey: ["performanceData", selectedStores, selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("performance_records_report")
        .select("*")
        .in(
          "store_id",
          selectedStores.map((store) => store.id)
        )
        .eq("month", selectedMonth)
        .eq("year", selectedYear);

      if (error) throw error;
      return data as EvaluationRecord[];
    },
  });

  const formatChartData = (data: EvaluationRecord[]): ChartDataPoint[] => {
    const groupedData = data.reduce((acc, record) => {
      const date = record.evaluation_date;
      if (!acc[date]) {
        acc[date] = {
          records: [],
          averages: {},
        };
      }
      acc[date].records.push(record);
      return acc;
    }, {} as Record<string, { records: EvaluationRecord[]; averages: Record<string, number> }>);

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

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-4 h-[600px]">
        <div className="h-[300px]">
          <LineChart
            data={chartData}
            xField="date"
            yField={selectedStores.map((store) => store.name)}
            title="Performance Trend"
          />
        </div>
        <div className="mt-4 overflow-auto" style={{ maxHeight: "250px" }}>
          <table className="w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Store</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {performanceData?.map((record) => (
                <tr key={record.id}>
                  <td>{record.evaluation_date}</td>
                  <td>{record.store_name}</td>
                  <td className={record.total_score >= 3 ? "text-green-500" : "text-red-500"}>
                    {record.total_score.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 border-t pt-4">
          <h3 className="font-semibold mb-2">Average Scores</h3>
          {selectedStores.map((store) => {
            const storeRecords = performanceData?.filter((r) => r.store_name === store.name) || [];
            const avgScore = storeRecords.length
              ? storeRecords.reduce((sum, r) => sum + r.total_score, 0) / storeRecords.length
              : 0;
            return (
              <div key={store.id} className="flex justify-between">
                <span>{store.name}</span>
                <span className={avgScore >= 3 ? "text-green-500" : "text-red-500"}>
                  {avgScore.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}; 