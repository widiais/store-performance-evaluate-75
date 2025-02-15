
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from "date-fns";

const SanctionReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredSanctions = sanctions.filter(sanction => 
    sanction.store_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sanction.store_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sanction.employee_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Employee Sanction Report
        </h2>
        
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
                <TableHead className="w-[150px]">Store</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Sanction Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSanctions.map((sanction) => (
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
