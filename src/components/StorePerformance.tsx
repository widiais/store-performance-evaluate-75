
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
import { Line as ChartLine } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartData,
  Point,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { PDFDownloadLink } from '@react-pdf/renderer';
import StorePerformancePDF from './StorePerformancePDF';
import { useNavigate } from 'react-router-dom';
import { StoreSelect } from './store-performance/StoreSelect';
import { SanctionKPI } from './store-performance/SanctionKPI';
import { 
  Store, 
  EvaluationRecord, 
  FinancialRecord, 
  ComplaintRecord, 
  EspRecord,
  SanctionKPI as SanctionKPIType 
} from './store-performance/types';
import { 
  calculateKPI, 
  calculateOPEXKPI, 
  calculateComplaintKPIScore,
  lineColors 
} from './store-performance/utils';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  TimeScale  // Register TimeScale
);

const StorePerformance = () => {
  const currentYear = getYear(new Date());
  const [selectedStores, setSelectedStores] = useState<Store[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [activeTab, setActiveTab] = useState('operational');
  const navigate = useNavigate();

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
    enabled: selectedStores.length > 0 && selectedMonth !== '' && selectedYear !== ''
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
    enabled: selectedStores.length > 0 && selectedMonth !== '' && selectedYear !== ''
  });

  const { data: espData = [] } = useQuery<EspRecord[]>({
    queryKey: ['espData', selectedStores.map(s => s.id), selectedMonth, selectedYear],
    queryFn: async () => {
      if (selectedStores.length === 0) return [];
      
      const startDate = `${selectedYear}-${selectedMonth}-01`;
      const monthDate = parse(startDate, 'yyyy-MM-dd', new Date());
      const endDate = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      
      const { data: evaluationData, error: evaluationError } = await supabase
        .from('esp_evaluation_report')
        .select('*')
        .in('store_name', selectedStores.map(s => s.name))
        .gte('evaluation_date', startDate)
        .lte('evaluation_date', endDate)
        .order('evaluation_date');
      
      if (evaluationError) throw evaluationError;
      if (!evaluationData) return [];

      const evaluationIds = evaluationData.map(e => e.id).filter(Boolean);
      const { data: findingsData, error: findingsError } = await supabase
        .from('esp_findings')
        .select('*')
        .in('evaluation_id', evaluationIds);

      if (findingsError) throw findingsError;

      return evaluationData.map(evaluation => ({
        ...evaluation,
        findings: findingsData
          ?.filter(f => f.evaluation_id === evaluation.id)
          .map(f => f.finding) || []
      }));
    },
    enabled: selectedStores.length > 0 && selectedMonth !== '' && selectedYear !== ''
  });

  const calculateAverageKPI = (data: EvaluationRecord[]) => {
    if (!data || data.length === 0) return 0;
    const totalKPI = data.reduce((sum, record) => sum + (record.total_score || 0), 0);
    return (totalKPI / data.length).toFixed(1);
  };

  const formatChartData = (data: EvaluationRecord[], title: string): { data: ChartData<"line", Point[], unknown>, options: any } | null => {
    if (!data || !selectedStores.length) return null;

    const formattedData = data.map(record => ({
      date: new Date(record.evaluation_date).getTime(), // Convert to timestamp
      store_name: record.store_name,
      total_score: record.total_score
    }));

    const datasets = selectedStores.map((store, index) => {
      const storeData = formattedData
        .filter(record => record.store_name === store.name)
        .map(record => ({
          x: record.date,
          y: record.total_score
        }));

      return {
        label: `${store.name} - ${store.city}`,
        data: storeData,
        borderColor: lineColors[index % lineColors.length],
        backgroundColor: lineColors[index % lineColors.length],
        tension: 0.4
      };
    });

    const chartData: ChartData<"line", Point[], unknown> = {
      datasets
    };

    const options = {
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
        x: {
          type: 'time' as const,
          time: {
            unit: 'day',
            tooltipFormat: 'dd/MM/yyyy'
          },
          title: {
            display: true,
            text: 'Date'
          }
        },
        y: {
          beginAtZero: true,
          max: 4,
          title: {
            display: true,
            text: 'Score'
          }
        }
      }
    };

    return { data: chartData, options };
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
    const { data: sanctionKPI } = useQuery<SanctionKPIType>({
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
                Sanction KPI
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <PDFDownloadLink
                document={<StorePerformancePDF 
                  selectedStores={selectedStores}
                  selectedMonth={selectedMonth}
                  selectedYear={selectedYear}
                  operationalData={{
                    champs: performanceData,
                    cleanliness: cleanlinessData,
                    service: serviceData,
                    productQuality: productQualityData
                  }}
                  financialData={financialData}
                  complaintData={complaintData}
                  espData={espData}
                />}
                fileName="store-performance.pdf"
              >
                {({ blob, url, loading, error }) => (
                  <Button disabled={loading}>
                    {loading ? "Loading document..." : "Download PDF"}
                    <FileDown className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </PDFDownloadLink>
            </div>
          </div>

          <Card className="p-6">
            <StoreSelect
              selectedStores={selectedStores}
              onStoreSelect={handleStoreSelect}
              onRemoveStore={removeStore}
            />
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {activeTab === 'operational' && (
            <div className="space-y-4">
              <Card>
                {champsChartData ? (
                  <ChartLine data={champsChartData.data} options={champsChartData.options} />
                ) : (
                  <p className="p-4">No CHAMPS data available for the selected stores and period.</p>
                )}
                {selectedStores.length > 0 && (
                  <div className="p-4">
                    Average CHAMPS KPI: <Badge>{calculateAverageKPI(performanceData)}</Badge>
                  </div>
                )}
              </Card>

              <Card>
                {cleanlinessChartData ? (
                  <ChartLine data={cleanlinessChartData.data} options={cleanlinessChartData.options} />
                ) : (
                  <p className="p-4">No Cleanliness data available for the selected stores and period.</p>
                )}
                 {selectedStores.length > 0 && (
                  <div className="p-4">
                    Average Cleanliness KPI: <Badge>{calculateAverageKPI(cleanlinessData)}</Badge>
                  </div>
                )}
              </Card>

              <Card>
                {serviceChartData ? (
                  <ChartLine data={serviceChartData.data} options={serviceChartData.options} />
                ) : (
                  <p className="p-4">No Service data available for the selected stores and period.</p>
                )}
                {selectedStores.length > 0 && (
                  <div className="p-4">
                    Average Service KPI: <Badge>{calculateAverageKPI(serviceData)}</Badge>
                  </div>
                )}
              </Card>

              <Card>
                {productQualityChartData ? (
                  <ChartLine data={productQualityChartData.data} options={productQualityChartData.options} />
                ) : (
                  <p className="p-4">No Product Quality data available for the selected stores and period.</p>
                )}
                {selectedStores.length > 0 && (
                  <div className="p-4">
                    Average Product Quality KPI: <Badge>{calculateAverageKPI(productQualityData)}</Badge>
                  </div>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="grid grid-cols-1 gap-4">
              {selectedStores.map(store => {
                const storeData = financialData.find(data => data.store_name === store.name);
                if (!storeData) {
                  return (
                    <Card key={store.id} className="p-6">
                      <h3 className="font-medium text-lg mb-4">{store.name} - {store.city}</h3>
                      <p className="text-gray-500">No financial data available for this store and period.</p>
                    </Card>
                  );
                }
                return renderFinancialCard(storeData, store);
              })}
            </div>
          )}

          {activeTab === 'complaint' && (
            <div className="grid grid-cols-1 gap-4">
              {selectedStores.map(store => {
                const storeData = complaintData.find(data => data.store_name === store.name);
                if (!storeData) {
                  return (
                    <Card key={store.id} className="p-6">
                      <h3 className="font-medium text-lg mb-4">{store.name} - {store.city}</h3>
                      <p className="text-gray-500">No complaint data available for this store and period.</p>
                    </Card>
                  );
                }

                const kpiScore = calculateComplaintKPIScore(storeData.total_weighted_complaints, storeData.avg_cu_per_day);

                return (
                  <Card key={store.id} className="p-6">
                    <h3 className="font-medium text-lg mb-4">{store.name} - {store.city}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Complaints</p>
                        <p className="text-xl font-medium">{storeData.total_weighted_complaints}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Average CU per Day</p>
                        <p className="text-xl font-medium">{storeData.avg_cu_per_day}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">KPI Score</p>
                        <p className={`text-xl font-medium ${
                          kpiScore >= 3 ? 'text-green-600' :
                          kpiScore >= 2 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {kpiScore}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="grid grid-cols-1 gap-4">
              {selectedStores.map(store => {
                const storeData = espData.find(data => data.store_name === store.name);
                if (!storeData) {
                  return (
                    <Card key={store.id} className="p-6">
                      <h3 className="font-medium text-lg mb-4">{store.name} - {store.city}</h3>
                      <p className="text-gray-500">No ESP data available for this store and period.</p>
                    </Card>
                  );
                }

                return (
                  <Card key={store.id} className="p-6">
                    <h3 className="font-medium text-lg mb-4">{store.name} - {store.city}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Total Score</p>
                        <p className="text-xl font-medium">{storeData.total_score}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">Final Score</p>
                        <p className="text-xl font-medium">{storeData.final_score}</p>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-500">KPI Score</p>
                        <p className="text-xl font-medium">{storeData.kpi_score}</p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {activeTab === 'sanction' && (
            <div className="grid grid-cols-1 gap-4">
              {selectedStores.map(store => (
                <SanctionKPI key={store.id} store={store} selectedMonth={selectedMonth} selectedYear={selectedYear} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorePerformance;
