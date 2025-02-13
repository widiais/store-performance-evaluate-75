
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
import { format, endOfMonth, parse, getYear } from 'date-fns';
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
  const currentYear = getYear(new Date());
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());

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
    queryKey: ['champsPerformance', selectedStores, selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('champs_evaluation_report')
        .select('*')
        .in('store_name', selectedStores)
        .gte('evaluation_date', startDate)
        .lte('evaluation_date', endDate)
        .order('evaluation_date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0,
  });

  const calculateAverageKPI = () => {
    if (!performanceData || performanceData.length === 0) return 0;
    const totalKPI = performanceData.reduce((sum, record) => sum + (record.total_score || 0), 0);
    return (totalKPI / performanceData.length).toFixed(1);
  };

  const handleStoreToggle = (storeName: string, checked: boolean) => {
    if (checked) {
      setSelectedStores([...selectedStores, storeName]);
    } else {
      setSelectedStores(selectedStores.filter(name => name !== storeName));
    }
  };

  const formattedData = performanceData?.map(record => ({
    ...record,
    champs_score: record.total_score
  }));

  // Generate array of past 5 years for year selection
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Array of months for month selection
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Store Performance Review</h1>
        
        {/* Header Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Store Selection */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Select Stores</h3>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {stores?.map((store) => (
                <div key={store.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`store-${store.id}`}
                    checked={selectedStores.includes(store.name)}
                    onCheckedChange={(checked) => handleStoreToggle(store.name, checked as boolean)}
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
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          {/* Year Selection */}
          <Card className="p-4">
            <h3 className="font-medium mb-4">Select Year</h3>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
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
                  <LineChart data={formattedData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="evaluation_date"
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
                      <TableHead>Store</TableHead>
                      <TableHead>KPI</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData?.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.evaluation_date), 'dd/MM/yy')}
                        </TableCell>
                        <TableCell>{record.store_name}</TableCell>
                        <TableCell>{record.total_score?.toFixed(1)}</TableCell>
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
