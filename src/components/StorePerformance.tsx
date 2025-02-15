import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, endOfMonth, parse, getYear, startOfMonth } from 'date-fns';
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
import { Search, X, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { PDFDownloadLink } from '@react-pdf/renderer';
import StorePerformancePDF from './StorePerformancePDF';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Badge } from "@/components/ui/badge";

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
  target_sales?: number;
  cogs_target?: number;
  opex_target?: number;
  total_crew?: number;
}

interface EvaluationRecord {
  id: number;
  store_name: string;
  evaluation_date: string;
  total_score: number;
}

interface FinancialRecord {
  id: number;
  store_name: string;
  store_city: string;
  input_date: string;
  total_sales: number;
  total_opex: number;
  cogs_achieved: number;
  target_sales: number;
  cogs_target: number;
  opex_target: number;
  total_crew: number;
}

interface ComplaintRecord {
  id: number;
  store_name: string;
  input_date: string;
  whatsapp_count: number;
  social_media_count: number;
  gmaps_count: number;
  online_order_count: number;
  late_handling_count: number;
  total_weighted_complaints: number;
  avg_cu_per_day: number;
  kpi_score: number;
}

interface SanctionKPI {
  store_id: number;
  store_name: string;
  store_city: string;
  total_employees: number;
  active_peringatan: number;
  active_sp1: number;
  active_sp2: number;
  kpi_score: number;
}

interface EspRecord {
  id: number;
  store_name: string;
  store_city: string;
  evaluation_date: string;
  total_score: number;
  final_score: number;
  kpi_score: number;
  findings: string[];
}

const lineColors = [
  'rgb(99, 102, 241)',
  'rgb(236, 72, 153)',
  'rgb(34, 197, 94)',
  'rgb(249, 115, 22)',
  'rgb(168, 85, 247)',
  'rgb(234, 179, 8)',
  'rgb(14, 165, 233)',
  'rgb(239, 68, 68)',
  'rgb(20, 184, 166)',
  'rgb(139, 92, 246)',
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
  const navigate = useNavigate();

  const calculateKPI = (actual: number, target: number): number => {
    if (!target) return 0;
    return Math.min((actual / target) * 4, 4);
  };

  const calculateOPEXKPI = (totalSales: number, actualOPEX: number, targetOPEXPercentage: number): number => {
    if (!totalSales || !targetOPEXPercentage) return 0;
    const actualOPEXPercentage = (actualOPEX / totalSales) * 100;
    return Math.max(0, Math.min((targetOPEXPercentage / actualOPEXPercentage) * 4, 4));
  };

  const { data: financialData = [] } = useQuery<FinancialRecord[]>({
    queryKey: ['financial-data', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('financial_records_report')
        .select('*')
        .in('store_name', selectedStores.map(s => s.name))
        .gte('input_date', startDate)
        .lte('input_date', endDate)
        .order('input_date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0 && Boolean(selectedMonth) && Boolean(selectedYear)
  });

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
    enabled: selectedStores.length > 0 && Boolean(selectedMonth) && Boolean(selectedYear)
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
    enabled: selectedStores.length > 0 && Boolean(selectedMonth) && Boolean(selectedYear)
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
    enabled: selectedStores.length > 0 && Boolean(selectedMonth) && Boolean(selectedYear)
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
    enabled: selectedStores.length > 0 && Boolean(selectedMonth) && Boolean(selectedYear)
  });

  const { data: complaintData = [] } = useQuery<ComplaintRecord[]>({
    queryKey: ['complaintData', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');

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
        .gte('input_date', startDate)
        .lte('input_date', endDate);
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0 && Boolean(selectedMonth) && Boolean(selectedYear)
  });

  const { data: espData = [] } = useQuery<EspRecord[]>({
    queryKey: ['espData', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('esp_evaluation_report')
        .select('*')
        .in('store_name', selectedStores.map(s => s.name))
        .gte('evaluation_date', startDate)
        .lte('evaluation_date', endDate)
        .order('evaluation_date');
      
      if (error) throw error;
      return data || [];
    },
    enabled: selectedStores.length > 0 && Boolean(selectedMonth) && Boolean(selectedYear)
  });

  const calculateAverageKPI = (data: EvaluationRecord[]) => {
    if (!data || data.length === 0) return 0;
    const totalKPI = data.reduce((sum, record) => sum + (record.total_score || 0), 0);
    return (totalKPI / data.length).toFixed(1);
  };

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

  const calculateKPIScore = (totalWeightedComplaints: number, avgCUPerDay: number) => {
    const percentage = (totalWeightedComplaints / (avgCUPerDay * 30)) * 100;
    if (percentage <= 0.1) return 4;       // <= 0.1% = 4 (Sangat Baik)
    if (percentage <= 0.3) return 3;       // <= 0.3% = 3 (Baik)
    if (percentage <= 0.5) return 2;       // <= 0.5% = 2 (Cukup)
    if (percentage <= 0.7) return 1;       // <= 0.7% = 1 (Kurang)
    return 0;                              // > 0.7% = 0 (Sangat Kurang)
  };

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

  const renderFinancialCard = (storeData: FinancialRecord, store: Store) => {
    const salesKPI = calculateKPI(storeData.total_sales || 0, storeData.target_sales || 0);
    const cogsKPI = calculateKPI(storeData.cogs_target || 0, storeData.cogs_achieved || 0);
    const productivityKPI = calculateKPI((storeData.total_sales || 0) / (storeData.total_crew || 1), 30000000);
    const opexKPI = calculateOPEXKPI(storeData.total_sales || 0, storeData.total_opex || 0, 4);

    return (
      <div key={store.id} className="p-4 border rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">{store.name} - {store.city}</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-500">Sales KPI</p>
            <p className={`text-lg font-medium ${
              salesKPI >= 3 ? 'text-green-600' : 
              salesKPI >= 2 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>{salesKPI.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {storeData.total_sales?.toLocaleString()} / {storeData.target_sales?.toLocaleString()}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-500">COGS KPI</p>
            <p className={`text-lg font-medium ${
              cogsKPI >= 3 ? 'text-green-600' : 
              cogsKPI >= 2 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>{cogsKPI.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {storeData.cogs_achieved?.toLocaleString()} / {storeData.cogs_target?.toLocaleString()}
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-500">OPEX KPI</p>
            <p className={`text-lg font-medium ${
              opexKPI >= 3 ? 'text-green-600' : 
              opexKPI >= 2 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>{opexKPI.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {storeData.total_opex?.toLocaleString()} ({((storeData.total_opex / storeData.total_sales) * 100).toFixed(1)}%)
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-gray-500">Productivity KPI</p>
            <p className={`text-lg font-medium ${
              productivityKPI >= 3 ? 'text-green-600' : 
              productivityKPI >= 2 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>{productivityKPI.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {((storeData.total_sales / (storeData.total_crew || 1))).toLocaleString()} / crew
            </p>
          </Card>
        </div>
      </div>
    );
  };

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
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

  const renderSanctionKPI = (store: Store) => {
    const { data: sanctionKPI } = useQuery<SanctionKPI>({
      queryKey: ['sanctionKPI', store.id, selectedMonth, selectedYear],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('employee_sanctions_kpi')
          .select('*')
          .eq('store_id', store.id)
          .single();

        if (error) throw error;
        return data;
      },
      enabled: Boolean(store.id && selectedMonth && selectedYear)
    });

    if (!sanctionKPI) {
      return (
        <Card key={store.id} className="p-6">
          <h3 className="font-medium text-lg mb-4">{store.name} - {store.city}</h3>
          <p className="text-gray-500">No sanction data available</p>
        </Card>
      );
    }

    return (
      <Card key={store.id} className="p-6">
        <h3 className="font-medium text-lg mb-4">{store.name} - {store.city}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Total Employees</p>
            <p className="text-xl font-medium">{sanctionKPI.total_employees}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Active Warnings</p>
            <p className="text-xl font-medium text-yellow-600">{sanctionKPI.active_peringatan}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Active SP1</p>
            <p className="text-xl font-medium text-orange-600">{sanctionKPI.active_sp1}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Active SP2</p>
            <p className="text-xl font-medium text-red-600">{sanctionKPI.active_sp2}</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">KPI Score</p>
            <p className={`text-xl font-medium ${
              sanctionKPI.kpi_score >= 3 ? 'text-green-600' :
              sanctionKPI.kpi_score >= 2 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {sanctionKPI.kpi_score}
            </p>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-gray-900">Store Performance</h2>
          
          <div className="flex justify-between items-center">
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
                Complaint Performance
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'audit'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500'
                }`}
              >
                Audit Performance
              </button>
              <button
                onClick={() => setActiveTab('sanction')}
                className={`px-4 py-2 font-medium ${
                  activeTab === 'sanction'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500'
                }`}
              >
                Employee Sanction
              </button>
            </div>

            {selectedStores.length > 0 && (
              <PDFDownloadLink
                document={
                  <StorePerformancePDF
                    selectedStores={selectedStores}
                    selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    operationalData={{
                      champs: performanceData || [],
                      cleanliness: cleanlinessData || [],
                      service: serviceData || [],
                      productQuality: productQualityData || [],
                    }}
                    financialData={financialData || []}
                    complaintData={complaintData || []}
                    espData={espData || []}
                  />
                }
                fileName={`store-performance-${selectedMonth}-${selectedYear}.pdf`}
              >
                {({ loading }) => (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={loading}
                    className="gap-2"
                  >
                    <FileDown className="h-4 w-4" />
                    {loading ? "Generating PDF..." : "Export PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}
          </div>

          <Card className="p-6">
            <StoreSelect
              selectedStores={selectedStores}
              onStoreSelect={handleStoreSelect}
              onRemoveStore={removeStore}
            />
          </Card>

          {activeTab === 'operational' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

                  <Card className="p-6 mb-6">
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
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  {selectedStores.map(store => {
                    const { data: financialRecord } = useQuery<FinancialRecord[]>({
                      queryKey: ['financial-data', store.id, selectedMonth, selectedYear],
                      queryFn: async () => {
                        const startDate = `${selectedYear}-${selectedMonth}-01`;
                        const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
                        const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
                        
                        const { data, error } = await supabase
                          .from('financial_records_report')
                          .select('*')
                          .eq('store_name', store.name)
                          .gte('input_date', startDate)
                          .lte('input_date', endDate)
                          .order('input_date');
                        
                        if (error) throw error;
                        return data || [];
                      },
                      enabled: selectedMonth && selectedYear,
                    });

                    return (
                      <div key={store.id} className="p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-6">{store.name} - {store.city}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {renderFinancialCard(financialRecord[0], store)}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}

          {activeTab === 'complaint' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  {selectedStores.map(store => {
                    const { data: complaintRecord } = useQuery({
                      queryKey: ['complaintData', store, selectedMonth, selectedYear],
                      queryFn: async () => {
                        const startDate = `${selectedYear}-${selectedMonth}-01`;
                        const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
                        const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');

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
                          .eq('store_name', store.name)
                          .gte('input_date', startDate)
                          .lte('input_date', endDate);
                        
                        if (error) throw error;
                        return data || [];
                      },
                      enabled: selectedMonth && selectedYear,
                    });

                    return (
                      <div key={store.id} className="p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-6">{store.name} - {store.city}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Total Weighted Complaints</p>
                            <p className="text-xl font-medium">{complaintRecord[0].total_weighted_complaints}</p>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">Average CU per Day</p>
                            <p className="text-xl font-medium">{complaintRecord[0].avg_cu_per_day}</p>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-500">KPI Score</p>
                            <p className={`text-xl font-medium ${
                              complaintRecord[0].kpi_score >= 3 ? 'text-green-600' :
                              complaintRecord[0].kpi_score >= 2 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {complaintRecord[0].kpi_score}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </>
          )}

          {activeTab === "sanction" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

              {selectedStores.length > 0 ? (
                <div className="space-y-6">
                  {selectedStores.map(store => renderSanctionKPI(store))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Select one or more stores to view employee sanction data
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorePerformance;
