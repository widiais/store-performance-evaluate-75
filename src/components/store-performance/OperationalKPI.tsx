
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LineChart } from "@/components/charts/LineChart";
import { Store, EvaluationRecord } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OperationalKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

const PerformanceCard = ({ 
  title, 
  data, 
  selectedStores 
}: { 
  title: string; 
  data: EvaluationRecord[]; 
  selectedStores: Store[] 
}) => {
  // Calculate average score for same-day evaluations
  const averagedData = data.reduce((acc, record) => {
    const date = record.evaluation_date;
    const storeName = record.store_name;
    
    if (!acc[date]) {
      acc[date] = {};
    }
    if (!acc[date][storeName]) {
      acc[date][storeName] = {
        total: 0,
        count: 0,
        records: []
      };
    }
    
    acc[date][storeName].total += record.total_score;
    acc[date][storeName].count += 1;
    acc[date][storeName].records.push(record);
    
    return acc;
  }, {} as Record<string, Record<string, { total: number; count: number; records: EvaluationRecord[] }>>);

  // Format data for chart
  const chartData = Object.entries(averagedData).map(([date, stores]) => {
    const point: any = { date };
    selectedStores.forEach(store => {
      const storeData = stores[store.name];
      if (storeData) {
        point[store.name] = Number((storeData.total / storeData.count).toFixed(2));
      } else {
        point[store.name] = null;
      }
    });
    return point;
  });

  // Calculate overall average
  const overallAverage = data.length > 0
    ? (data.reduce((sum, record) => sum + record.total_score, 0) / data.length).toFixed(2)
    : '0';

  // Get unique evaluation dates
  const evaluationDates = [...new Set(data.map(record => 
    format(new Date(record.evaluation_date), 'dd/MM/yy')
  ))].join(', ');

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        
        {/* KPI Score Box */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">KPI Score</h3>
          <div className="text-2xl font-bold">{overallAverage}</div>
        </div>

        {/* Date Taken Box */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">Evaluation Dates</h3>
          <div className="text-sm">{evaluationDates}</div>
        </div>

        {/* Chart */}
        <div className="h-[200px] mt-4">
          <LineChart
            data={chartData}
            xField="date"
            yField={selectedStores.map((store) => store.name)}
            title={`${title} Trend`}
          />
        </div>

        {/* Details Table */}
        <ScrollArea className="h-[200px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(averagedData).map(([date, stores]) => 
                Object.entries(stores).map(([storeName, data]) => (
                  <TableRow key={`${date}-${storeName}`}>
                    <TableCell>{format(new Date(date), 'dd/MM/yy')}</TableCell>
                    <TableCell>{storeName}</TableCell>
                    <TableCell className={(data.total / data.count) >= 3 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {(data.total / data.count).toFixed(2)}
                    </TableCell>
                    <TableCell>{data.records[0].status}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </Card>
  );
};

export const OperationalKPI = ({ selectedStores, selectedMonth, selectedYear }: OperationalKPIProps) => {
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

  const { data: champsData } = useQuery({
    queryKey: ["champsData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("champs_evaluation_report")
        .select("*")
        .in("store_name", selectedStores.map((store) => store.name))
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as EvaluationRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  const { data: cleanlinessData } = useQuery({
    queryKey: ["cleanlinessData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("cleanliness_evaluation_report")
        .select("*")
        .in("store_name", selectedStores.map((store) => store.name))
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as EvaluationRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  const { data: serviceData } = useQuery({
    queryKey: ["serviceData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("service_evaluation_report")
        .select("*")
        .in("store_name", selectedStores.map((store) => store.name))
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as EvaluationRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  const { data: productQualityData } = useQuery({
    queryKey: ["productQualityData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("product_quality_evaluation_report")
        .select("*")
        .in("store_name", selectedStores.map((store) => store.name))
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as EvaluationRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <PerformanceCard
        title="CHAMPS"
        data={champsData || []}
        selectedStores={selectedStores}
      />
      <PerformanceCard
        title="Cleanliness"
        data={cleanlinessData || []}
        selectedStores={selectedStores}
      />
      <PerformanceCard
        title="Service"
        data={serviceData || []}
        selectedStores={selectedStores}
      />
      <PerformanceCard
        title="Product Quality"
        data={productQualityData || []}
        selectedStores={selectedStores}
      />
    </div>
  );
};
