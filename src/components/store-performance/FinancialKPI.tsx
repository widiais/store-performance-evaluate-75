
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, FinancialRecord } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart } from "@/components/charts/LineChart";
import { format, startOfMonth } from "date-fns";

interface FinancialKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

const StoreFinanceCard = ({ 
  store, 
  data 
}: { 
  store: Store; 
  data: FinancialRecord[];
}) => {
  // Group data by month for the chart
  const monthlyData = data.reduce((acc, record) => {
    const monthKey = format(new Date(record.input_date), 'yyyy-MM');
    if (!acc[monthKey]) {
      acc[monthKey] = {
        total_sales: 0,
        target_sales: 0,
        cogs_achieved: 0,
        total_opex: 0,
        count: 0
      };
    }
    acc[monthKey].total_sales += record.total_sales;
    acc[monthKey].target_sales += record.target_sales;
    acc[monthKey].cogs_achieved += record.cogs_achieved;
    acc[monthKey].total_opex += record.total_opex;
    acc[monthKey].count += 1;
    return acc;
  }, {} as Record<string, { total_sales: number; target_sales: number; cogs_achieved: number; total_opex: number; count: number }>);

  // Format data for chart
  const chartData = Object.entries(monthlyData).map(([month, values]) => ({
    date: month,
    'Sales Achievement': Number((values.total_sales / values.target_sales * 100).toFixed(2)),
    'COGS': Number((values.cogs_achieved / values.count).toFixed(2)),
    'OPEX': Number(((values.total_opex / values.total_sales) * 100).toFixed(2))
  }));

  // Calculate KPIs
  const averageSalesAchievement = data.length > 0
    ? (data.reduce((sum, r) => sum + (r.total_sales / r.target_sales * 100), 0) / data.length).toFixed(2)
    : '0';

  const averageCOGS = data.length > 0
    ? (data.reduce((sum, r) => sum + r.cogs_achieved, 0) / data.length).toFixed(2)
    : '0';

  const averageOPEX = data.length > 0
    ? (data.reduce((sum, r) => sum + ((r.total_opex / r.total_sales) * 100), 0) / data.length).toFixed(2)
    : '0';

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold mb-4">{store.name} - {store.city}</h2>
        
        {/* KPI Score Boxes */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Sales Achievement</h3>
            <div className="text-2xl font-bold">{averageSalesAchievement}%</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">COGS</h3>
            <div className="text-2xl font-bold">{averageCOGS}%</div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">OPEX</h3>
            <div className="text-2xl font-bold">{averageOPEX}%</div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[200px] mt-4">
          <LineChart
            data={chartData}
            xField="date"
            yField={['Sales Achievement', 'COGS', 'OPEX']}
            title="Monthly Performance Trend"
          />
        </div>

        {/* Details Table */}
        <ScrollArea className="h-[200px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Achievement</TableHead>
                <TableHead>COGS</TableHead>
                <TableHead>OPEX</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{format(new Date(record.input_date), 'dd/MM/yy')}</TableCell>
                  <TableCell>{record.total_sales.toLocaleString()}</TableCell>
                  <TableCell>{record.target_sales.toLocaleString()}</TableCell>
                  <TableCell className={(record.total_sales / record.target_sales) >= 1 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                    {((record.total_sales / record.target_sales) * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell>{record.cogs_achieved}%</TableCell>
                  <TableCell>{((record.total_opex / record.total_sales) * 100).toFixed(2)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </Card>
  );
};

export const FinancialKPI = ({ selectedStores, selectedMonth, selectedYear }: FinancialKPIProps) => {
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

  const { data: financialData } = useQuery({
    queryKey: ["financialData", selectedMonth, selectedYear],
    queryFn: async () => {
      if (!filteredDates?.length) return [];
      
      const { data, error } = await supabase
        .from("financial_records_report")
        .select("*")
        .in("store_name", selectedStores.map((store) => store.name))
        .in('input_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as FinancialRecord[];
    },
    enabled: selectedStores.length > 0 && !!filteredDates?.length
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {selectedStores.map(store => (
        <StoreFinanceCard
          key={store.id}
          store={store}
          data={(financialData || []).filter(record => record.store_name === store.name)}
        />
      ))}
    </div>
  );
};
