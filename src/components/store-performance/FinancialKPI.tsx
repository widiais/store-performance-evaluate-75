
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Store, FinancialRecord } from "./types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart } from "@/components/charts/LineChart";
import { format } from "date-fns";

interface FinancialKPIProps {
  selectedStores: Store[];
  selectedMonth: number;
  selectedYear: number;
}

export const FinancialKPI = ({ selectedStores, selectedMonth, selectedYear }: FinancialKPIProps) => {
  const queryKey = ["financialData", selectedMonth, selectedYear];

  const { data: financialData } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data: filteredDates, error: dateError } = await supabase.rpc('filter_evaluation_by_month_year', {
        target_month: selectedMonth,
        target_year: selectedYear
      });

      if (dateError) throw dateError;
      if (!filteredDates?.length) return [];

      const { data, error } = await supabase
        .from("financial_records_report")
        .select("*")
        .in(
          "store_name",
          selectedStores.map((store) => store.name)
        )
        .in('input_date', filteredDates.map(d => d.evaluation_date));

      if (error) throw error;
      return data as FinancialRecord[];
    },
    enabled: selectedStores.length > 0
  });

  const calculateKPIs = (record: FinancialRecord) => {
    const salesKPI = record.total_sales / record.target_sales;
    const cogsKPI = record.cogs_target / record.cogs_achieved;
    const opexKPI = record.total_opex / (record.total_sales * 0.3);
    const productivityKPI = record.total_sales / (record.total_crew * 30000000);

    return {
      salesKPI: Number(salesKPI.toFixed(2)),
      cogsKPI: Number(cogsKPI.toFixed(2)),
      opexKPI: Number(opexKPI.toFixed(2)),
      productivityKPI: Number(productivityKPI.toFixed(2)),
    };
  };

  const chartData = financialData?.map(record => ({
    date: record.input_date,
    [record.store_name]: record.total_sales / record.target_sales
  })) || [];

  const averageSalesKPI = financialData?.length 
    ? (financialData.reduce((sum, record) => sum + (record.total_sales / record.target_sales), 0) / financialData.length).toFixed(2)
    : '0';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Column - KPI Chart */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* KPI Score Box */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Sales KPI</h3>
            <div className="text-2xl font-bold">{averageSalesKPI}</div>
          </div>

          {/* Average Financial Stats */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-lg mb-2">Financial Summary</h3>
            <div className="space-y-2">
              {financialData?.length ? (
                <>
                  <div>Total Sales: {(financialData.reduce((sum, r) => sum + r.total_sales, 0) / financialData.length).toFixed(2)}</div>
                  <div>COGS: {(financialData.reduce((sum, r) => sum + r.cogs_achieved, 0) / financialData.length).toFixed(2)}%</div>
                  <div>OPEX: {(financialData.reduce((sum, r) => sum + r.total_opex, 0) / financialData.length).toFixed(2)}</div>
                </>
              ) : (
                <div>No data available</div>
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px] mt-4">
            <LineChart
              data={chartData}
              xField="date"
              yField={selectedStores.map((store) => store.name)}
              title="Sales Performance Trend"
            />
          </div>
        </div>
      </Card>

      {/* Right Column - Detailed Data */}
      <Card className="p-6">
        <h3 className="font-medium text-lg mb-4">Financial Details</h3>
        <ScrollArea className="h-[500px] w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Sales KPI</TableHead>
                <TableHead>COGS KPI</TableHead>
                <TableHead>OPEX KPI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {financialData?.map((record) => {
                const kpis = calculateKPIs(record);
                return (
                  <TableRow key={record.id}>
                    <TableCell>{format(new Date(record.input_date), 'dd/MM/yy')}</TableCell>
                    <TableCell>{record.store_name}</TableCell>
                    <TableCell className={kpis.salesKPI >= 1 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {kpis.salesKPI}
                    </TableCell>
                    <TableCell className={kpis.cogsKPI >= 1 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {kpis.cogsKPI}
                    </TableCell>
                    <TableCell className={kpis.opexKPI <= 1 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {kpis.opexKPI}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    </div>
  );
};
