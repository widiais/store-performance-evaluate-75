
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
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
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
      
      const { data, error } = await supabase
        .from('store_performance_metrics')
        .select('*')
        .in('store_id', selectedStores)
        .gte('date', `${selectedMonth}-01`)
        .lte('date', `${selectedMonth}-31`)
        .order('date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0,
  });

  const handleStoreToggle = (storeId: number, checked: boolean) => {
    if (checked) {
      setSelectedStores([...selectedStores, storeId]);
    } else {
      setSelectedStores(selectedStores.filter(id => id !== storeId));
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Implement PDF download functionality
    console.log('Downloading PDF...');
  };

  return (
    <div className="p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Store Selection */}
            <div className="space-y-4">
              <h3 className="font-medium">Select Stores</h3>
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
            </div>

            {/* Month Selection */}
            <div>
              <h3 className="font-medium mb-4">Select Month</h3>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            {/* Download Button */}
            <div className="flex items-start">
              <Button onClick={handleDownloadPDF} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>
        </Card>

        {selectedStores.length > 0 && (
          <div className="space-y-6">
            {/* Performance Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CHAMPS Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">CHAMPS Performance</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="champs_score" fill="#8884d8" name="CHAMPS Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Cleanliness Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Cleanliness Performance</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="cleanliness_score" fill="#82ca9d" name="Cleanliness Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Service Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Service Performance</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="service_score" fill="#ffc658" name="Service Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Product Quality Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Product Quality Performance</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="product_quality_score" fill="#ff7300" name="Product Quality Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Financial Metrics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Sales Performance</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total_sales" stroke="#8884d8" name="Sales" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* OPEX Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">OPEX Performance</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total_opex" stroke="#82ca9d" name="OPEX" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Productivity Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Productivity Performance</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="productivity_score" stroke="#ffc658" name="Productivity" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* COGS Performance */}
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">COGS Performance</h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cogs_achieved" stroke="#ff7300" name="COGS" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePerformance;
