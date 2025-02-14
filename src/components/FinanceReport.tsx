import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

// Updated KPI calculation function using the formula: min((actual/target) * 4, 4)
const calculateKPI = (actual: number, target: number): number => {
  if (!target) return 0;
  return Math.min((actual / target) * 4, 4);
};

// Updated OPEX KPI calculation
const calculateOPEXKPI = (totalSales: number, actualOPEX: number, targetOPEXPercentage: number): number => {
  if (!totalSales || !targetOPEXPercentage) return 0;
  const actualOPEXPercentage = (actualOPEX / totalSales) * 100;
  return Math.max(0, Math.min((targetOPEXPercentage / actualOPEXPercentage) * 4, 4));
};

const FinanceReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: records, isLoading } = useQuery({
    queryKey: ['finance-records'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_records_report')
        .select('*')
        .order('input_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  const filteredRecords = records?.filter(record => 
    record.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.store_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.regional?.toString().includes(searchTerm) ||
    record.area?.toString().includes(searchTerm)
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-[95%] mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Financial Records Report
        </h2>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by store, city, regional, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        <div className="glass-card p-6 bg-white rounded-lg border border-gray-200 shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700">Date</TableHead>
                <TableHead className="text-gray-700">Store Name</TableHead>
                <TableHead className="text-gray-700">City</TableHead>
                <TableHead className="text-gray-700">Regional</TableHead>
                <TableHead className="text-gray-700">Area</TableHead>
                <TableHead className="text-gray-700 text-center">KPI COGS</TableHead>
                <TableHead className="text-gray-700 text-center">KPI Sales</TableHead>
                <TableHead className="text-gray-700 text-center">KPI Productivity</TableHead>
                <TableHead className="text-gray-700 text-center">KPI OPEX</TableHead>
                <TableHead className="text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords?.map((record) => {
                const salesKPI = calculateKPI(record.total_sales, record.target_sales || 0);
                const cogsKPI = calculateKPI(record.cogs_target || 0, record.cogs_achieved);
                const productivityKPI = calculateKPI(record.total_sales / (record.total_crew || 1), 30000000);
                // Updated OPEX KPI calculation
                const opexKPI = calculateOPEXKPI(record.total_sales, record.total_opex, 4); // 4% is the target

                return (
                  <TableRow key={record.id} className="hover:bg-gray-50">
                    <TableCell className="text-gray-900">
                      {format(new Date(record.input_date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell className="text-gray-900">{record.store_name}</TableCell>
                    <TableCell className="text-gray-900">{record.store_city}</TableCell>
                    <TableCell className="text-gray-900">{record.regional}</TableCell>
                    <TableCell className="text-gray-900">{record.area}</TableCell>
                    <TableCell className="text-center">
                      <span className={cogsKPI >= 3 ? 'text-green-600' : cogsKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                        {cogsKPI.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={salesKPI >= 3 ? 'text-green-600' : salesKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                        {salesKPI.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={productivityKPI >= 3 ? 'text-green-600' : productivityKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                        {productivityKPI.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={opexKPI >= 3 ? 'text-green-600' : opexKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                        {opexKPI.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/finance-report/${record.id}`)}
                      >
                        View Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default FinanceReport;
