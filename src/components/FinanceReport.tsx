
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
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-900/10 to-pink-900/10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Financial Report
        </h2>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by store, city, or PIC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-dashboard-dark/50 border-dashboard-text/20"
            />
          </div>
        </div>

        <Card className="glass-card p-6 bg-dashboard-dark/30 border-dashboard-text/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Store City</TableHead>
                <TableHead>Input Date</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead className="text-right">Target COGS</TableHead>
                <TableHead className="text-right">COGS Achieved</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Total Opex</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{record.store_name}</TableCell>
                  <TableCell>{record.store_city}</TableCell>
                  <TableCell>{format(new Date(record.input_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{record.pic}</TableCell>
                  <TableCell className="text-right">{record.cogs_target}%</TableCell>
                  <TableCell className="text-right">
                    <span className={record.cogs_achieved <= record.cogs_target ? 'text-green-500' : 'text-red-500'}>
                      {record.cogs_achieved}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{record.total_sales.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{record.total_opex.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default FinanceReport;
