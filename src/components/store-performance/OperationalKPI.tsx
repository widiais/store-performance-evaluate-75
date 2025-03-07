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
  // Sort data by date first and ensure valid dates
  const sortedData = [...data]
    .filter(record => record.evaluation_date) // Filter out records with null dates
    .sort((a, b) => 
      new Date(a.evaluation_date).getTime() - new Date(b.evaluation_date).getTime()
    );

  // Get all unique valid dates
  const uniqueDates = [...new Set(sortedData
    .map(record => record.evaluation_date)
    .filter(date => date && !isNaN(new Date(date).getTime()))
  )];

  // If no valid dates, show empty state
  if (uniqueDates.length === 0) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-muted-foreground">No data available for selected period</p>
        </div>
      </Card>
    );
  }

  // Create chart data with all stores for each date
  const chartData = uniqueDates.map(date => {
    const point: any = { 
      date: format(new Date(date), 'dd/MM/yy'),
      tooltip_date: date
    };
    
    selectedStores.forEach(store => {
      const storeRecords = sortedData.filter(
        record => record.evaluation_date === date && record.store_name === store.name
      );
      
      if (storeRecords.length > 0) {
        const average = storeRecords.reduce((sum, record) => sum + record.total_score, 0) / storeRecords.length;
        point[store.name] = Number(average.toFixed(2));
      } else {
        point[store.name] = null;
      }
    });
    
    return point;
  });

  // Calculate overall statistics
  const overallStats = selectedStores.map(store => {
    const storeData = sortedData.filter(record => record.store_name === store.name);
    const average = storeData.length > 0
      ? (storeData.reduce((sum, record) => sum + record.total_score, 0) / storeData.length).toFixed(2)
      : '0';
    return { store: store.name, average };
  });

  // Safely format dates for display
  const startDate = new Date(uniqueDates[0]);
  const endDate = new Date(uniqueDates[uniqueDates.length - 1]);

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          {!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && (
            <div className="text-sm text-muted-foreground">
              {format(startDate, 'MMM dd')} - {format(endDate, 'MMM dd, yyyy')}
            </div>
          )}
        </div>

        {/* Store Averages */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {overallStats.map(({ store, average }) => (
            <div key={store} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-sm mb-1 truncate" title={store}>{store}</h3>
              <div className={`text-lg font-bold ${
                Number(average) >= 3 ? 'text-green-600' : 
                Number(average) >= 2 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {average}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="h-[300px] mt-4">
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
              {sortedData.map((record) => (
                <TableRow key={`${record.evaluation_date}-${record.store_name}`}>
                  <TableCell>{format(new Date(record.evaluation_date), 'dd/MM/yy')}</TableCell>
                  <TableCell>{record.store_name}</TableCell>
                  <TableCell className={record.total_score >= 3 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {record.total_score.toFixed(2)}
                  </TableCell>
                  <TableCell>{record.status}</TableCell>
                </TableRow>
              ))}
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
        .from("champs_evaluations")
        .select(`
          id,
          evaluation_date,
          total_score,
          status,
          pic,
          stores:store_id (
            name,
            city
          )
        `)
        .in("store_id", selectedStores.map((store) => store.id))
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        store_name: item.stores?.name || '',
        store_city: item.stores?.city || '',
        evaluation_date: item.evaluation_date,
        total_score: item.total_score || 0,
        pic: item.pic,
        status: item.status
      })) as EvaluationRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  const { data: cleanlinessData } = useQuery({
    queryKey: ["cleanlinessData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("cleanliness_evaluations")
        .select(`
          id,
          evaluation_date,
          total_score,
          status,
          pic,
          stores:store_id (
            name,
            city
          )
        `)
        .in("store_id", selectedStores.map((store) => store.id))
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        store_name: item.stores?.name || '',
        store_city: item.stores?.city || '',
        evaluation_date: item.evaluation_date,
        total_score: item.total_score || 0,
        pic: item.pic,
        status: item.status
      })) as EvaluationRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  const { data: serviceData } = useQuery({
    queryKey: ["serviceData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("service_evaluations")
        .select(`
          id,
          evaluation_date,
          total_score,
          status,
          pic,
          stores:store_id (
            name,
            city
          )
        `)
        .in("store_id", selectedStores.map((store) => store.id))
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        store_name: item.stores?.name || '',
        store_city: item.stores?.city || '',
        evaluation_date: item.evaluation_date,
        total_score: item.total_score || 0,
        pic: item.pic,
        status: item.status
      })) as EvaluationRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  const { data: productQualityData } = useQuery({
    queryKey: ["productQualityData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("product_quality_evaluations")
        .select(`
          id,
          evaluation_date,
          total_score,
          status,
          pic,
          stores:store_id (
            name,
            city
          )
        `)
        .in("store_id", selectedStores.map((store) => store.id))
        .in('evaluation_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        store_name: item.stores?.name || '',
        store_city: item.stores?.city || '',
        evaluation_date: item.evaluation_date,
        total_score: item.total_score || 0,
        pic: item.pic,
        status: item.status
      })) as EvaluationRecord[];
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
