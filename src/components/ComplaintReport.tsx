
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ComplaintRecord {
  id: number;
  store_name: string;
  regional: number;
  area: number;
  kpi_score: number;
  input_date: string;
}

const ComplaintReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof ComplaintRecord | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const { data: complaints = [], isLoading } = useQuery({
    queryKey: ['complaint-records', selectedMonth],
    queryFn: async () => {
      let query = supabase
        .from('complaint_records_report')
        .select('*');

      if (selectedMonth !== 'all') {
        const date = new Date(selectedMonth);
        const start = format(startOfMonth(date), 'yyyy-MM-dd');
        const end = format(endOfMonth(date), 'yyyy-MM-dd');
        query = query.gte('input_date', start).lte('input_date', end);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const handleSort = (key: keyof ComplaintRecord) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getSortIcon = (key: keyof ComplaintRecord) => {
    if (sortConfig.key !== key) return <ChevronDown className="w-4 h-4 opacity-50" />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const filteredAndSortedComplaints = complaints
    .filter(record =>
      record.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.regional.toString().includes(searchTerm) ||
      record.area.toString().includes(searchTerm)
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(new Date().getFullYear(), i, 1);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    };
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Complaint Report</h1>
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              placeholder="Search by store, regional, or area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('regional')}
              >
                Regional {getSortIcon('regional')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('area')}
              >
                Area {getSortIcon('area')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('store_name')}
              >
                Store {getSortIcon('store_name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('kpi_score')}
              >
                KPI {getSortIcon('kpi_score')}
              </TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedComplaints.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.regional}</TableCell>
                <TableCell>{record.area}</TableCell>
                <TableCell>{record.store_name}</TableCell>
                <TableCell>{record.kpi_score.toFixed(2)}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/complaint-report/${record.id}`)}
                  >
                    View Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ComplaintReport;
