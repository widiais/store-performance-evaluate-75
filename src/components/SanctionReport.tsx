
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, ArrowDown, ArrowUp } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

const SanctionReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'sanction_date', direction: 'desc' });

  const { data: sanctions = [], isLoading } = useQuery({
    queryKey: ['sanctionReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_sanctions_report')
        .select('*')
        .order('sanction_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleSort = (key: string) => {
    setSortConfig(currentConfig => ({
      key,
      direction: currentConfig.key === key && currentConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (data: any[]) => {
    return [...data].sort((a, b) => {
      if (sortConfig.key === 'sanction_date') {
        const dateA = new Date(a[sortConfig.key]).getTime();
        const dateB = new Date(b[sortConfig.key]).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredSanctions = sanctions
    .filter(sanction => 
      (sanction.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       sanction.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       sanction.store_city.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === 'active' ? sanction.is_active : !sanction.is_active)
    );

  const sortedSanctions = getSortedData(filteredSanctions);

  const getSanctionColor = (type: string) => {
    switch (type) {
      case 'Peringatan Tertulis':
        return 'bg-yellow-100 text-yellow-800';
      case 'SP1':
        return 'bg-orange-100 text-orange-800';
      case 'SP2':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="inline h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="inline h-4 w-4 ml-1" />
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Employee Sanction Report
        </h2>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="active">Active Sanctions</TabsTrigger>
            <TabsTrigger value="expired">Expired Sanctions</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by store, employee name, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('store_name')}
                >
                  Store
                  <SortIcon columnKey="store_name" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('employee_name')}
                >
                  Employee Name
                  <SortIcon columnKey="employee_name" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('sanction_type')}
                >
                  Sanction Type
                  <SortIcon columnKey="sanction_type" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('duration_months')}
                >
                  Duration
                  <SortIcon columnKey="duration_months" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('sanction_date')}
                >
                  Date
                  <SortIcon columnKey="sanction_date" />
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => handleSort('expiry_date')}
                >
                  Expiry Date
                  <SortIcon columnKey="expiry_date" />
                </TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSanctions.map((sanction) => (
                <TableRow key={sanction.id}>
                  <TableCell>
                    {sanction.store_name}
                    <br />
                    <span className="text-sm text-gray-500">{sanction.store_city}</span>
                  </TableCell>
                  <TableCell>{sanction.employee_name}</TableCell>
                  <TableCell>
                    <Badge className={getSanctionColor(sanction.sanction_type)}>
                      {sanction.sanction_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{sanction.duration_months} months</TableCell>
                  <TableCell>{format(new Date(sanction.sanction_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(sanction.expiry_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/sanction-report/${sanction.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default SanctionReport;
