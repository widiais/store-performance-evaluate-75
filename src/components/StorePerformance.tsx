
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const StorePerformance = () => {
  const [selectedStore, setSelectedStore] = useState<string>('');

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
    queryKey: ['storePerformance', selectedStore],
    queryFn: async () => {
      if (!selectedStore) return [];
      
      const { data, error } = await supabase
        .from('financial_records')
        .select('*')
        .eq('store_id', selectedStore)
        .order('input_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedStore,
  });

  // Format data for the chart
  const chartData = performanceData?.map(record => ({
    date: record.input_date,
    sales: record.total_sales,
    cogs: record.cogs_achieved,
    opex: record.total_opex,
  }));

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Store Performance</h2>
          <div className="w-[300px]">
            <Select
              value={selectedStore}
              onValueChange={setSelectedStore}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a store" />
              </SelectTrigger>
              <SelectContent>
                {stores?.map((store) => (
                  <SelectItem key={store.id} value={store.id.toString()}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedStore && (
          <div className="grid gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Financial Performance</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
                    <Line type="monotone" dataKey="cogs" stroke="#82ca9d" name="COGS" />
                    <Line type="monotone" dataKey="opex" stroke="#ffc658" name="OPEX" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePerformance;
