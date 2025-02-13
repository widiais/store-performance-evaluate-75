
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, endOfMonth, parse } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const StorePerformance = () => {
  const [selectedStores, setSelectedStores] = useState<number[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const { data: performanceData } = useQuery({
    queryKey: ['storePerformance', selectedStores, selectedMonth],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedMonth}-01`;
      const monthDate = parse(selectedMonth, 'yyyy-MM', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('store_performance_metrics')
        .select('*')
        .in('store_id', selectedStores)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0,
  });

  const calculateAverageKPI = () => {
    if (!performanceData || performanceData.length === 0) return 0;
    const totalKPI = performanceData.reduce((sum, record) => sum + (record.champs_score || 0), 0);
    return (totalKPI / performanceData.length).toFixed(1);
  };

  const handleStoreToggle = (storeId: number, checked: boolean) => {
    if (checked) {
      setSelectedStores([...selectedStores, storeId]);
    } else {
      setSelectedStores(selectedStores.filter(id => id !== storeId));
    }
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Store Performance Review</h1>
        
        {/* Header Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Store Selection */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Select Stores</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {stores?.map((store) => (
                <div key={store.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`store-${store.id}`}
                    checked={selectedStores.includes(store.id)}
                    onCheckedChange={(checked) => handleStoreToggle(store.id, checked as boolean)}
                  />
                  <Label htmlFor={`store-${store.id}`}>{store.name}</Label>
                </div>
              ))}
            </div>
          </Card>

          {/* Month Selection */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Select Month</h3>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date(2024, i, 1);
                  return (
                    <SelectItem
                      key={format(date, 'yyyy-MM')}
                      value={format(date, 'yyyy-MM')}
                    >
                      {format(date, 'MMMM yyyy')}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </Card>
        </div>

        {/* CHAMPS Performance Section */}
        {selectedStores.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">CHAMPS Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Line Chart */}
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'dd')}
                    />
                    <YAxis domain={[0, 4]} ticks={[1, 2, 3, 4]} />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(1), "KPI"]}
                      labelFormatter={(label) => format(new Date(label), 'dd/MM/yy')}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="champs_score" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ fill: '#8884d8' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* KPI Data Table */}
              <div className="overflow-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>KPI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData?.map((record) => (
                      <TableRow key={record.date}>
                        <TableCell>
                          {format(new Date(record.date), 'dd/MM/yy')}
                        </TableCell>
                        <TableCell>{record.champs_score?.toFixed(1)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Average KPI */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <p className="text-sm font-medium">
                Store Average CHAMPS: {calculateAverageKPI()} (Taken: {performanceData?.length || 0})
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StorePerformance;
