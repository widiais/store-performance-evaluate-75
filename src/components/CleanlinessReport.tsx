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

const CleanlinessReport = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reports, isLoading } = useQuery({
    queryKey: ['cleanlinessReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cleanliness_evaluation_report')
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
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-gray-900">
          Cleanliness Evaluation Report
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
                <TableHead className="text-gray-700">PIC</TableHead>
                <TableHead className="text-gray-700">Date</TableHead>
                <TableHead className="text-gray-700">Score</TableHead>
                <TableHead className="text-gray-700">Status</TableHead>
                <TableHead className="text-gray-700 w-[100px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report) => (
                <TableRow key={report.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell className="text-gray-900">{report.store_name}</TableCell>
                  <TableCell className="text-gray-900">{report.store_city}</TableCell>
                  <TableCell className="text-gray-900">{report.pic}</TableCell>
                  <TableCell className="text-gray-900">{format(new Date(report.evaluation_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    <span className={`${report.total_score >= 3 ? 'text-green-600' : 'text-red-600'}`}>
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
                      onClick={() => navigate(`/cleanliness-report/${report.id}`)}
                      className="border-gray-200 hover:bg-gray-100"
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

export default CleanlinessReport;
