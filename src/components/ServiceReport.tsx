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

const ServiceReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['serviceReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_evaluation_report')
        .select('*')
        .order('evaluation_date', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-900/10 to-pink-900/10">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Service Evaluation Report
        </h2>
        
        <div className="mb-4">
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

        <div className="glass-card p-6 bg-dashboard-dark/30 rounded-lg border border-dashboard-text/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Store Name</TableHead>
                <TableHead>Store City</TableHead>
                <TableHead>PIC</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report) => (
                <TableRow key={report.id} className="cursor-pointer hover:bg-dashboard-dark/50">
                  <TableCell>{report.store_name}</TableCell>
                  <TableCell>{report.store_city}</TableCell>
                  <TableCell>{report.pic}</TableCell>
                  <TableCell>{format(new Date(report.evaluation_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <span className={`${report.total_score >= 3 ? 'text-green-500' : 'text-red-500'}`}>
                      {report.total_score}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/service-report/${report.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ServiceReport;
