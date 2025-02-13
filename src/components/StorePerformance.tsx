import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Line as ChartLine } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { Input } from "@/components/ui/input";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend
);

interface Store {
  id: number;
  name: string;
  city: string;
}

interface EvaluationRecord {
  id: number;
  store_name: string;
  evaluation_date: string;
  total_score: number;
}

// Array warna untuk line chart
const lineColors = [
  'rgb(99, 102, 241)', // Indigo
  'rgb(236, 72, 153)', // Pink
  'rgb(34, 197, 94)', // Green
  'rgb(249, 115, 22)', // Orange
  'rgb(168, 85, 247)', // Purple
  'rgb(234, 179, 8)', // Yellow
  'rgb(14, 165, 233)', // Sky
  'rgb(239, 68, 68)', // Red
  'rgb(20, 184, 166)', // Teal
  'rgb(139, 92, 246)', // Violet
];

interface StoreSelectProps {
  selectedStores: Store[];
  onStoreSelect: (store: Store) => void;
  onRemoveStore: (storeId: number) => void;
}

const StoreSelect = ({ selectedStores, onStoreSelect, onRemoveStore }: StoreSelectProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const { data: stores = [] } = useQuery<Store[]>({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const filteredStores = stores.filter(store => 
    !selectedStores.some(s => s.id === store.id) &&
    (store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     store.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search store..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          className="pl-10"
        />
      </div>

      {/* Selected Stores */}
      {selectedStores.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedStores.map((store) => (
            <div
              key={store.id}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
            >
              <span className="text-sm">
                {store.name} - {store.city}
              </span>
              <button
                onClick={() => onRemoveStore(store.id)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && searchTerm && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          <ScrollArea className="h-[200px]">
            {filteredStores.length > 0 ? (
              filteredStores.map((store) => (
                <div
                  key={store.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    onStoreSelect(store);
                    setSearchTerm('');
                    setShowDropdown(false);
                  }}
                >
                  {store.name} - {store.city}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500">No stores found</div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

const StorePerformance = () => {
  const currentYear = getYear(new Date());
  const [selectedStores, setSelectedStores] = useState<Store[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [activeTab, setActiveTab] = useState('operational');

  const { data: stores } = useQuery({
    queryKey: ['stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, city')
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
  });

  const calculateAverageKPI = (data: EvaluationRecord[]) => {
    if (!data || data.length === 0) return 0;
    const totalKPI = data.reduce((sum, record) => sum + (record.total_score || 0), 0);
    return (totalKPI / data.length).toFixed(1);
  };

  const { data: performanceData = [] } = useQuery<EvaluationRecord[]>({
    queryKey: ['champsPerformance', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('champs_evaluation_report')
        .select('id, store_name, evaluation_date, total_score')
        .in('store_name', selectedStores.map(s => s.name))
        .gte('evaluation_date', startDate)
        .lte('evaluation_date', endDate)
        .order('evaluation_date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0,
  });

  const { data: cleanlinessData = [] } = useQuery<EvaluationRecord[]>({
    queryKey: ['cleanlinessPerformance', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('cleanliness_evaluation_report')
        .select('id, store_name, evaluation_date, total_score')
        .in('store_name', selectedStores.map(s => s.name))
        .gte('evaluation_date', startDate)
        .lte('evaluation_date', endDate)
        .order('evaluation_date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0,
  });

  const { data: serviceData = [] } = useQuery<EvaluationRecord[]>({
    queryKey: ['servicePerformance', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('service_evaluation_report')
        .select('id, store_name, evaluation_date, total_score')
        .in('store_name', selectedStores.map(s => s.name))
        .gte('evaluation_date', startDate)
        .lte('evaluation_date', endDate)
        .order('evaluation_date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0,
  });

  const { data: productQualityData = [] } = useQuery<EvaluationRecord[]>({
    queryKey: ['productQualityPerformance', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('product_quality_evaluation_report')
        .select('id, store_name, evaluation_date, total_score')
        .in('store_name', selectedStores.map(s => s.name))
        .gte('evaluation_date', startDate)
        .lte('evaluation_date', endDate)
        .order('evaluation_date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0,
  });

  // Query untuk data Complaint
  const { data: complaintData = [] } = useQuery({
    queryKey: ['complaintData', selectedStores, selectedMonth, selectedYear],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaint_records_report')
        .select(`
          id,
          store_name,
          input_date,
          whatsapp_count,
          social_media_count,
          gmaps_count,
          online_order_count,
          late_handling_count,
          total_weighted_complaints,
          avg_cu_per_day,
          kpi_score
        `)
        .in('store_name', selectedStores.map(store => store.name))
        .gte('input_date', `${selectedYear}-${selectedMonth}-01`)
        .lte('input_date', `${selectedYear}-${selectedMonth}-31`);
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0 && !!selectedMonth && !!selectedYear,
  });

  const handleStoreSelect = (store: Store) => {
    setSelectedStores(prev => {
      const isSelected = prev.some(s => s.id === store.id);
      if (isSelected) {
        return prev.filter(s => s.id !== store.id);
      } else {
        if (prev.length >= 10) {
          alert('Maksimal 10 store dapat dipilih');
          return prev;
        }
        return [...prev, store];
      }
    });
  };

  const removeStore = (storeId: number) => {
    setSelectedStores(prev => prev.filter(s => s.id !== storeId));
  };

  // Fungsi untuk memformat data chart
  const formatChartData = (data: EvaluationRecord[], title: string) => {
    if (!data || !selectedStores.length) return null;

    const formattedData = data.map(record => ({
      date: format(new Date(record.evaluation_date), 'dd/MM/yy'),
      store_name: record.store_name,
      total_score: record.total_score
    }));

    const datasets = selectedStores.map((store, index) => {
      const storeData = formattedData
        .filter(record => record.store_name === store.name)
        .map(record => ({
          date: record.date,
          value: record.total_score
        }));

      return {
        label: `${store.name} - ${store.city}`,
        data: storeData,
        borderColor: lineColors[index % lineColors.length],
        backgroundColor: lineColors[index % lineColors.length],
        tension: 0.4,
        parsing: {
          xAxisKey: 'date',
          yAxisKey: 'value'
        }
      };
    });

    return {
      datasets,
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top' as const,
          },
          title: {
            display: true,
            text: title
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 4
          }
        }
      }
    };
  };

  const champsChartData = formatChartData(performanceData, 'CHAMPS Performance');
  const cleanlinessChartData = formatChartData(cleanlinessData, 'Cleanliness Performance');
  const serviceChartData = formatChartData(serviceData, 'Service Performance');
  const productQualityChartData = formatChartData(productQualityData, 'Product Quality Performance');

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
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Store Performance</h2>
          
          {/* Tab Navigation */}
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('operational')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'operational'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500'
              }`}
            >
              Operational Performance
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'financial'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500'
              }`}
            >
              Financial Performance
            </button>
            <button
              onClick={() => setActiveTab('complaint')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'complaint'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500'
              }`}
            >
              Customer Complain
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'audit'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500'
              }`}
            >
              Audit
            </button>
          </div>

          {/* Store Selection and Controls */}
          <Card className="p-6">
            <StoreSelect
              selectedStores={selectedStores}
              onStoreSelect={handleStoreSelect}
              onRemoveStore={removeStore}
            />
          </Card>

          {/* Content based on active tab */}
          {activeTab === 'operational' && (
            <>
              {/* Header Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

              {selectedStores.length > 0 && (
                <>
                  {/* CHAMPS Performance */}
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-6">CHAMPS Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-[300px]">
                        {champsChartData ? (
                          <ChartLine data={champsChartData} options={champsChartData.options} />
                        ) : (
                          <div className="flex items-center justify-center h-64 text-gray-500">
                            Pilih store untuk melihat data
                          </div>
                        )}
                      </div>
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
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm font-medium">
                        Store Average CHAMPS: {calculateAverageKPI(performanceData)} (Taken: {performanceData.length})
                      </p>
                    </div>
                  </Card>

                  {/* Cleanliness Performance */}
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-6">Cleanliness Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-[300px]">
                        {cleanlinessChartData ? (
                          <ChartLine data={cleanlinessChartData} options={cleanlinessChartData.options} />
                        ) : (
                          <div className="flex items-center justify-center h-64 text-gray-500">
                            Pilih store untuk melihat data
                          </div>
                        )}
                      </div>
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
                            {cleanlinessData?.map((record) => (
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
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm font-medium">
                        Store Average Cleanliness: {calculateAverageKPI(cleanlinessData)} (Taken: {cleanlinessData.length})
                      </p>
                    </div>
                  </Card>

                  {/* Service Performance */}
                  <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-6">Service Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-[300px]">
                        {serviceChartData ? (
                          <ChartLine data={serviceChartData} options={serviceChartData.options} />
                        ) : (
                          <div className="flex items-center justify-center h-64 text-gray-500">
                            Pilih store untuk melihat data
                          </div>
                        )}
                      </div>
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
                            {serviceData?.map((record) => (
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
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm font-medium">
                        Store Average Service: {calculateAverageKPI(serviceData)} (Taken: {serviceData.length})
                      </p>
                    </div>
                  </Card>

                  {/* Product Quality Performance */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-6">Product Quality Performance</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="h-[300px]">
                        {productQualityChartData ? (
                          <ChartLine data={productQualityChartData} options={productQualityChartData.options} />
                        ) : (
                          <div className="flex items-center justify-center h-64 text-gray-500">
                            Pilih store untuk melihat data
                          </div>
                        )}
                      </div>
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
                            {productQualityData?.map((record) => (
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
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm font-medium">
                        Store Average Product Quality: {calculateAverageKPI(productQualityData)} (Taken: {productQualityData.length})
                      </p>
                    </div>
                  </Card>
                </>
              )}
            </>
          )}
          
          {activeTab === 'financial' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Financial Performance</h2>
              <div className="flex items-center justify-center h-64 text-gray-500">
                Coming Soon: Financial Performance Data
              </div>
            </Card>
          )}
          
          {activeTab === 'complaint' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Customer Complaints</h2>
              <div className="space-y-6">
                {selectedStores.map(store => {
                  const storeData = complaintData.find(d => d.store_name === store.name);
                  return (
                    <div key={store.id} className="p-4 border rounded-lg">
                      <h3 className="font-medium mb-4">{store.name}</h3>
                      {storeData ? (
                        <div>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-500">WhatsApp</p>
                              <p className="text-lg font-medium">{storeData.whatsapp_count}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Social Media</p>
                              <p className="text-lg font-medium">{storeData.social_media_count}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Google Maps</p>
                              <p className="text-lg font-medium">{storeData.gmaps_count}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Online Order</p>
                              <p className="text-lg font-medium">{storeData.online_order_count}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Late Handling</p>
                              <p className="text-lg font-medium">{storeData.late_handling_count}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                            <div>
                              <p className="text-sm text-gray-500">Total Weighted Complaints</p>
                              <p className="text-lg font-medium">{storeData.total_weighted_complaints}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Average CU per Day</p>
                              <p className="text-lg font-medium">{storeData.avg_cu_per_day}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">KPI Score</p>
                              <p className={`text-lg font-medium ${
                                storeData.kpi_score >= 3 
                                  ? 'text-green-600' 
                                  : storeData.kpi_score >= 2 
                                  ? 'text-yellow-600' 
                                  : 'text-red-600'
                              }`}>
                                {storeData.kpi_score}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-sm text-gray-500 mb-2">KPI Score Range:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 text-sm">
                              <div className="text-green-600">4 (Sangat Baik) = ≤ 0.1%</div>
                              <div className="text-green-600">3 (Baik) = ≤ 0.3%</div>
                              <div className="text-yellow-600">2 (Cukup) = ≤ 0.5%</div>
                              <div className="text-red-600">1 (Kurang) = ≤ 0.7%</div>
                              <div className="text-red-600">0 (Sangat Kurang) = {'>'}0.7%</div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No complaint data available</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
          
          {activeTab === 'audit' && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Audit Performance</h2>
              <div className="flex items-center justify-center h-64 text-gray-500">
                Coming Soon: Audit Performance Data
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorePerformance;
