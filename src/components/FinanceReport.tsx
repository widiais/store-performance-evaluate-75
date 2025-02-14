
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from 'react';
import { toast } from "sonner";

// KPI calculation functions
const calculateSalesKPI = (achievedSales: number, targetSales: number): number => {
  const percentage = (achievedSales / targetSales) * 100;
  if (percentage >= 100) return 4;
  if (percentage >= 90) return 3;
  if (percentage >= 80) return 2;
  if (percentage >= 70) return 1;
  return 0;
};

const calculateCOGSKPI = (achievedCOGS: number, targetCOGS: number): number => {
  // Lower COGS is better (achieved <= target)
  if (achievedCOGS <= targetCOGS) return 4;
  const difference = achievedCOGS - targetCOGS;
  if (difference <= 2) return 3;
  if (difference <= 4) return 2;
  if (difference <= 6) return 1;
  return 0;
};

const calculateProductivityKPI = (totalSales: number, totalCrew: number): number => {
  const salesPerPerson = totalSales / totalCrew;
  const target = 30000000; // 30M per person
  const ratio = salesPerPerson / target;
  if (ratio >= 1) return 4;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.8) return 2;
  if (ratio >= 0.7) return 1;
  return 0;
};

const calculateOPEXKPI = (totalOPEX: number, targetOPEX: number): number => {
  // Lower OPEX is better (achieved <= target)
  const percentage = (totalOPEX / targetOPEX) * 100;
  if (percentage <= 100) return 4;
  if (percentage <= 105) return 3;
  if (percentage <= 110) return 2;
  if (percentage <= 115) return 1;
  return 0;
};

const FinanceReport = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('financial_records')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance-records'] });
      toast.success('Record deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete record');
      console.error('Delete error:', error);
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

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      deleteMutation.mutate(id);
    }
  };

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
                const salesKPI = calculateSalesKPI(record.total_sales, record.target_sales || 0);
                const cogsKPI = calculateCOGSKPI(record.cogs_achieved, record.cogs_target || 0);
                const productivityKPI = calculateProductivityKPI(record.total_sales, record.total_crew || 1);
                const opexKPI = calculateOPEXKPI(record.total_opex, record.opex_target || 0);

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
                        {cogsKPI.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={salesKPI >= 3 ? 'text-green-600' : salesKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                        {salesKPI.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={productivityKPI >= 3 ? 'text-green-600' : productivityKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                        {productivityKPI.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={opexKPI >= 3 ? 'text-green-600' : opexKPI >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                        {opexKPI.toFixed(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/finance-report/${record.id}`)}
                        >
                          View Detail
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(record.id)}
                        >
                          Delete
                        </Button>
                      </div>
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
