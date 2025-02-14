
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, endOfMonth, parse, getYear } from 'date-fns';
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
import { Search, X } from "lucide-react";
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
  input_date: string;
  total_sales: number;
  total_opex: number;
  cogs_achieved: number;
  target_sales: number;
  cogs_target: number;
  opex_target: number;
  total_crew: number;
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

  const calculateKPI = (actual: number, target: number): number => {
    if (!target) return 0;
    return Math.min((actual / target) * 4, 4);
  };

  const calculateOPEXKPI = (totalSales: number, actualOPEX: number, targetOPEXPercentage: number): number => {
    if (!totalSales || !targetOPEXPercentage) return 0;
    const actualOPEXPercentage = (actualOPEX / totalSales) * 100;
    return Math.max(0, Math.min((targetOPEXPercentage / actualOPEXPercentage) * 4, 4));
  };

  const { data: financialData } = useQuery<FinancialRecord[]>({
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
    enabled: selectedStores.length > 0,
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

          {/* Store Selection */}
          <Card className="p-6">
            <StoreSelect
              selectedStores={selectedStores}
              onStoreSelect={handleStoreSelect}
              onRemoveStore={removeStore}
            />
          </Card>

          {/* Financial Performance Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              {/* Month & Year Selection */}
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

              {/* Financial Performance Data */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Financial Performance</h2>
                {selectedStores.length > 0 ? (
                  <div className="space-y-6">
                    {selectedStores.map(store => {
                      const storeData = financialData?.find(d => d.store_name === store.name);
                      
                      if (!storeData) {
                        return (
                          <div key={store.id} className="p-4 border rounded-lg">
                            <h3 className="font-medium text-lg">{store.name} - {store.city}</h3>
                            <p className="text-gray-500 mt-2">No financial data available for this period</p>
                          </div>
                        );
                      }

                      return renderFinancialCard(storeData, store);
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select one or more stores to view financial performance
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorePerformance;
