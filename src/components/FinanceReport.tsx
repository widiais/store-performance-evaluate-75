import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
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
import { useState } from 'react';

const FinanceReport = () => {
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
    record.pic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Financial Records Report
        </h2>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by store, city, or PIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
        </div>

        <div className="glass-card p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-gray-700">Store Name</TableHead>
                <TableHead className="text-gray-700">Store City</TableHead>
                <TableHead className="text-gray-700">Date</TableHead>
                <TableHead className="text-gray-700">PIC</TableHead>
                <TableHead className="text-gray-700 text-right">COGS Target</TableHead>
                <TableHead className="text-gray-700 text-right">COGS Achieved</TableHead>
                <TableHead className="text-gray-700 text-right">Total Sales</TableHead>
                <TableHead className="text-gray-700 text-right">Total OPEX</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords?.map((record) => (
                <TableRow key={record.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="text-gray-900">{record.store_name}</TableCell>
                  <TableCell className="text-gray-900">{record.store_city}</TableCell>
                  <TableCell className="text-gray-900">{format(new Date(record.input_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-gray-900">{record.pic}</TableCell>
                  <TableCell className="text-right text-gray-900">{record.cogs_target}%</TableCell>
                  <TableCell className="text-right">
                    <span className={record.cogs_achieved <= record.cogs_target ? 'text-green-600' : 'text-red-600'}>
                      {record.cogs_achieved}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-gray-900">{record.total_sales.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-gray-900">{record.total_opex.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default FinanceReport;
