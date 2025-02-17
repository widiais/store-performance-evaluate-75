
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, ComplaintRecord } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ComplaintKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

const StoreComplaintCard = ({ 
  store, 
  selectedMonth,
  selectedYear
}: { 
  store: Store;
  selectedMonth: number;
  selectedYear: number;
}) => {
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

  const { data: complaints = [] } = useQuery({
    queryKey: ["complaintData", store.id, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("complaint_records_report")
        .select("*")
        .eq("store_name", store.name)
        .in('input_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data || [];
    },
    enabled: !!filteredDates?.length,
  });

  const latestComplaint = complaints[0] || null;

  if (!latestComplaint) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>
        <p className="text-gray-500">No complaint data available for this period</p>
      </Card>
    );
  }

  // Calculate KPI score based on complaints
  const kpiPercentage = (latestComplaint.total_weighted_complaints / (latestComplaint.avg_cu_per_day * 30)) * 100;
  const calculateKPIScore = (percentage: number) => {
    if (percentage <= 0.1) return 4;
    if (percentage <= 0.3) return 3;
    if (percentage <= 0.5) return 2;
    if (percentage <= 0.7) return 1;
    return 0;
  };
  const kpiScore = calculateKPIScore(kpiPercentage);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Total Weighted Complaints</h3>
            <div className="text-2xl font-bold">{latestComplaint.total_weighted_complaints}</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">KPI Score</h3>
            <div className={`text-2xl font-bold ${
              kpiScore >= 3 ? 'text-green-600' :
              kpiScore >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {kpiScore.toFixed(2)} ({kpiPercentage.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">KPI Calculation</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-blue-700">Average CU per day:</p>
              <p className="text-sm text-blue-900 font-medium">{latestComplaint.avg_cu_per_day}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-blue-700">Monthly Factor (30 days):</p>
              <p className="text-sm text-blue-900 font-medium">{latestComplaint.avg_cu_per_day * 30}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-blue-700">Complaint Percentage:</p>
              <p className="text-sm text-blue-900 font-medium">{kpiPercentage.toFixed(2)}%</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-blue-700">Final KPI Score:</p>
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
    </Card>
  );
};

export const ComplaintKPI = ({ selectedStores, selectedMonth, selectedYear }: ComplaintKPIProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedStores.map(store => (
        <StoreComplaintCard 
          key={store.id} 
          store={store}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      ))}
    </div>
  );
};
