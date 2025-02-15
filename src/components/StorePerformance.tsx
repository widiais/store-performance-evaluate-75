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
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from 'recharts';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type TabType = 'operational' | 'financial' | 'complaint' | 'audit';

interface ChartDataPoint {
  date: string;
  [key: string]: number | string | null;
}

const StorePerformance = () => {
  const currentYear = getYear(new Date());
  const [selectedStores, setSelectedStores] = useState<Store[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'MM'));
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString());
  const [activeTab, setActiveTab] = useState<TabType>('operational');
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
        .lte('input_date', endDate);
      
      if (error) throw error;
      return data;
    },
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
        .lte('evaluation_date', endDate);
      
      if (error) throw error;
      return data;
    },
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
        .lte('evaluation_date', endDate);
      
      if (error) throw error;
      return data;
    },
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
        .lte('evaluation_date', endDate);
      
      if (error) throw error;
      return data;
    },
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
        .lte('evaluation_date', endDate);
      
      if (error) throw error;
      return data;
    },
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
        .select('*')
        .in('store_name', selectedStores.map(s => s.name))
        .gte('input_date', startDate)
        .lte('input_date', endDate);
      
      if (error) throw error;
      return data;
    },
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
        .lte('evaluation_date', endDate);

      if (evaluationError) throw evaluationError;

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
  });

  const formatChartData = (data: EvaluationRecord[], title: string) => {
    if (!data || !selectedStores.length) return null;

    // Kelompokkan data berdasarkan tanggal dan store
    const groupedData = data.reduce((acc, record) => {
      const date = format(new Date(record.evaluation_date), 'yyyy-MM-dd');
      const storeName = record.store_name;
      
      if (!acc[date]) {
        acc[date] = {};
      }
      if (!acc[date][storeName]) {
        acc[date][storeName] = [];
      }
      acc[date][storeName].push(record);
      return acc;
    }, {} as Record<string, Record<string, EvaluationRecord[]>>);

    // Dapatkan semua tanggal unik dan urutkan
    const allDates = Object.keys(groupedData).sort();
    
    // Buat data untuk chart dengan rata-rata per hari
    return allDates.map(date => {
      const dataPoint: ChartDataPoint = { date };
      selectedStores.forEach(store => {
        const storeRecords = groupedData[date]?.[store.name] || [];
        if (storeRecords.length > 0) {
          // Hitung rata-rata score untuk hari ini
          const avgScore = storeRecords.reduce((sum, record) => sum + (record.total_score || 0), 0) / storeRecords.length;
          dataPoint[store.name] = avgScore;
        } else {
          dataPoint[store.name] = null;
        }
      });
      return dataPoint;
    });
  };

  const champsChartData = formatChartData(performanceData, 'CHAMPS Performance');
  const cleanlinessChartData = formatChartData(cleanlinessData, 'Cleanliness Performance');
  const serviceChartData = formatChartData(serviceData, 'Service Performance');
  const productQualityChartData = formatChartData(productQualityData, 'Product Quality Performance');

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
    <div className="p-6">
      <div className="space-y-4">
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
              Operational
            </button>
            <button
              onClick={() => setActiveTab('financial')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'financial'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500'
              }`}
            >
              Financial
            </button>
            <button
              onClick={() => setActiveTab('complaint')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'complaint'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-500'
              }`}
            >
              Complaint
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

          <div className="flex items-center space-x-4">
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
            {champsChartData && (
              <Card className="p-4">
                <h3 className="font-medium text-lg mb-4">CHAMPS Performance</h3>
                <div className="flex gap-4">
                  <div className="flex-1" style={{ height: '300px' }}>
                    <ResponsiveContainer>
                      <LineChart data={champsChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                        />
                        <YAxis domain={[0, 4]} />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                        />
                        <Legend />
                        {selectedStores.map((store, index) => (
                          <Line
                            key={store.id}
                            type="monotone"
                            dataKey={store.name}
                            stroke={lineColors[index % lineColors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="overflow-auto" style={{ maxHeight: '250px' }}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>KPI</TableHead>
                            <TableHead>Lose Point</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {performanceData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{format(new Date(record.evaluation_date), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{record.store_name}</TableCell>
                              <TableCell className={record.total_score >= 3 ? 'text-green-600' : 'text-red-600'}>
                                {record.total_score}
                              </TableCell>
                              <TableCell className="text-red-600">
                                {(4 - record.total_score).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="font-medium mb-2">Rata-rata KPI:</div>
                      {selectedStores.map(store => {
                        const avgScore = performanceData
                          .filter(d => d.store_name === store.name)
                          .reduce((sum, curr) => sum + (curr.total_score || 0), 0) / 
                          (performanceData.filter(d => d.store_name === store.name).length || 1);
                        
                        return (
                          <div key={store.id} className="text-sm">
                            <span className="font-medium">{store.name}:</span>
                            <span className={avgScore >= 3 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                              {avgScore.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {cleanlinessChartData && (
              <Card className="p-4">
                <h3 className="font-medium text-lg mb-4">Cleanliness Performance</h3>
                <div className="flex gap-4">
                  <div className="flex-1" style={{ height: '300px' }}>
                    <ResponsiveContainer>
                      <LineChart data={cleanlinessChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                        />
                        <YAxis domain={[0, 4]} />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                        />
                        <Legend />
                        {selectedStores.map((store, index) => (
                          <Line
                            key={store.id}
                            type="monotone"
                            dataKey={store.name}
                            stroke={lineColors[index % lineColors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="overflow-auto" style={{ maxHeight: '250px' }}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>KPI</TableHead>
                            <TableHead>Lose Point</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cleanlinessData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{format(new Date(record.evaluation_date), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{record.store_name}</TableCell>
                              <TableCell className={record.total_score >= 3 ? 'text-green-600' : 'text-red-600'}>
                                {record.total_score}
                              </TableCell>
                              <TableCell className="text-red-600">
                                {(4 - record.total_score).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="font-medium mb-2">Rata-rata KPI:</div>
                      {selectedStores.map(store => {
                        const avgScore = cleanlinessData
                          .filter(d => d.store_name === store.name)
                          .reduce((sum, curr) => sum + (curr.total_score || 0), 0) / 
                          (cleanlinessData.filter(d => d.store_name === store.name).length || 1);
                        
                        return (
                          <div key={store.id} className="text-sm">
                            <span className="font-medium">{store.name}:</span>
                            <span className={avgScore >= 3 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                              {avgScore.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {serviceChartData && (
              <Card className="p-4">
                <h3 className="font-medium text-lg mb-4">Service Performance</h3>
                <div className="flex gap-4">
                  <div className="flex-1" style={{ height: '300px' }}>
                    <ResponsiveContainer>
                      <LineChart data={serviceChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                        />
                        <YAxis domain={[0, 4]} />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                        />
                        <Legend />
                        {selectedStores.map((store, index) => (
                          <Line
                            key={store.id}
                            type="monotone"
                            dataKey={store.name}
                            stroke={lineColors[index % lineColors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="overflow-auto" style={{ maxHeight: '250px' }}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>KPI</TableHead>
                            <TableHead>Lose Point</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{format(new Date(record.evaluation_date), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{record.store_name}</TableCell>
                              <TableCell className={record.total_score >= 3 ? 'text-green-600' : 'text-red-600'}>
                                {record.total_score}
                              </TableCell>
                              <TableCell className="text-red-600">
                                {(4 - record.total_score).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="font-medium mb-2">Rata-rata KPI:</div>
                      {selectedStores.map(store => {
                        const avgScore = serviceData
                          .filter(d => d.store_name === store.name)
                          .reduce((sum, curr) => sum + (curr.total_score || 0), 0) / 
                          (serviceData.filter(d => d.store_name === store.name).length || 1);
                        
                        return (
                          <div key={store.id} className="text-sm">
                            <span className="font-medium">{store.name}:</span>
                            <span className={avgScore >= 3 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                              {avgScore.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {productQualityChartData && (
              <Card className="p-4">
                <h3 className="font-medium text-lg mb-4">Product Quality Performance</h3>
                <div className="flex gap-4">
                  <div className="flex-1" style={{ height: '300px' }}>
                    <ResponsiveContainer>
                      <LineChart data={productQualityChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => format(new Date(value), 'dd/MM')}
                        />
                        <YAxis domain={[0, 4]} />
                        <Tooltip 
                          labelFormatter={(value) => format(new Date(value), 'dd/MM/yyyy')}
                        />
                        <Legend />
                        {selectedStores.map((store, index) => (
                          <Line
                            key={store.id}
                            type="monotone"
                            dataKey={store.name}
                            stroke={lineColors[index % lineColors.length]}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="overflow-auto" style={{ maxHeight: '250px' }}>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>KPI</TableHead>
                            <TableHead>Lose Point</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {productQualityData.map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{format(new Date(record.evaluation_date), 'dd/MM/yyyy')}</TableCell>
                              <TableCell>{record.store_name}</TableCell>
                              <TableCell className={record.total_score >= 3 ? 'text-green-600' : 'text-red-600'}>
                                {record.total_score}
                              </TableCell>
                              <TableCell className="text-red-600">
                                {(4 - record.total_score).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="font-medium mb-2">Rata-rata KPI:</div>
                      {selectedStores.map(store => {
                        const avgScore = productQualityData
                          .filter(d => d.store_name === store.name)
                          .reduce((sum, curr) => sum + (curr.total_score || 0), 0) / 
                          (productQualityData.filter(d => d.store_name === store.name).length || 1);
                        
                        return (
                          <div key={store.id} className="text-sm">
                            <span className="font-medium">{store.name}:</span>
                            <span className={avgScore >= 3 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                              {avgScore.toFixed(2)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'financial' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium text-lg mb-4">Financial KPI</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>COGS</TableHead>
                      <TableHead>OPEX</TableHead>
                      <TableHead>Productivity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStores.map(store => {
                      const storeData = financialData.find(d => d.store_name === store.name);
                      if (!storeData) return null;

                      const salesKPI = calculateKPI(storeData.total_sales, storeData.target_sales);
                      const cogsKPI = calculateKPI(storeData.cogs_target, storeData.cogs_achieved);
                      const opexKPI = calculateOPEXKPI(storeData.total_sales, storeData.total_opex, 4);
                      const productivityKPI = calculateKPI(storeData.total_sales / (storeData.total_crew || 1), 30000000);

                      return (
                        <TableRow key={store.id}>
                          <TableCell className="font-medium">{store.name}</TableCell>
                          <TableCell className={salesKPI >= 3 ? 'text-green-600' : 'text-red-600'}>
                            {salesKPI.toFixed(2)}
                          </TableCell>
                          <TableCell className={cogsKPI >= 3 ? 'text-green-600' : 'text-red-600'}>
                            {cogsKPI.toFixed(2)}
                          </TableCell>
                          <TableCell className={opexKPI >= 3 ? 'text-green-600' : 'text-red-600'}>
                            {opexKPI.toFixed(2)}
                          </TableCell>
                          <TableCell className={productivityKPI >= 3 ? 'text-green-600' : 'text-red-600'}>
                            {productivityKPI.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'complaint' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium text-lg mb-4">Complaint KPI</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store</TableHead>
                      <TableHead>Total Complaints</TableHead>
                      <TableHead>Avg CU/Day</TableHead>
                      <TableHead>KPI Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStores.map(store => {
                      const storeData = complaintData.find(d => d.store_name === store.name);
                      if (!storeData) return null;

                      const kpiScore = calculateComplaintKPIScore(storeData.total_weighted_complaints, storeData.avg_cu_per_day);
                      const percentage = (storeData.total_weighted_complaints / (storeData.avg_cu_per_day * 30)) * 100;

                      return (
                        <TableRow key={store.id}>
                          <TableCell className="font-medium">{store.name}</TableCell>
                          <TableCell>{storeData.total_weighted_complaints}</TableCell>
                          <TableCell>{storeData.avg_cu_per_day}</TableCell>
                          <TableCell className={kpiScore >= 3 ? 'text-green-600' : 'text-red-600'}>
                            {kpiScore} ({percentage.toFixed(2)}%)
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium text-lg mb-4">ESP Audit</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Store</TableHead>
                      <TableHead>Final Score</TableHead>
                      <TableHead>KPI Score</TableHead>
                      <TableHead>Findings</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedStores.map(store => {
                      const storeData = espData.find(d => d.store_name === store.name);
                      if (!storeData) return null;

                      return (
                        <TableRow key={store.id}>
                          <TableCell className="font-medium">{store.name}</TableCell>
                          <TableCell>{storeData.final_score.toFixed(2)}</TableCell>
                          <TableCell className={storeData.kpi_score >= 3 ? 'text-green-600' : 'text-red-600'}>
                            {storeData.kpi_score}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {storeData.findings.map((finding, idx) => (
                                <Badge key={idx} variant="secondary">
                                  {finding}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
              
              <SanctionKPI 
                selectedStores={selectedStores} 
                selectedMonth={selectedMonth} 
                selectedYear={selectedYear} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorePerformance;
