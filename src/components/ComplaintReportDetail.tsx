import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ComplaintWeight {
  channel: string;
  weight: number;
}

interface ComplaintDetail {
  id: number;
  store_name: string;
  regional: number;
  area: number;
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

const ComplaintReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: weights } = useQuery<ComplaintWeight[]>({
    queryKey: ['complaint-weights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaint_weights')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  const { data: detail, isLoading } = useQuery<ComplaintDetail>({
    queryKey: ['complaint-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No ID provided');
      const numericId = parseInt(id);
      if (isNaN(numericId)) throw new Error('Invalid ID format');
      
      const { data, error } = await supabase
        .from('complaint_records_report')
        .select('*')
        .eq('id', numericId)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !detail || !weights) {
    return <div className="p-6">Loading...</div>;
  }

  const getWeightForChannel = (channel: string) => {
    const weight = weights.find(w => w.channel === channel);
    return weight ? weight.weight : 1;
  };

  const channelDetails = [
    {
      label: 'WhatsApp',
      count: detail.whatsapp_count,
      weight: getWeightForChannel('whatsapp'),
    },
    {
      label: 'Social Media',
      count: detail.social_media_count,
      weight: getWeightForChannel('social_media'),
    },
    {
      label: 'Google Maps',
      count: detail.gmaps_count,
      weight: getWeightForChannel('gmaps'),
    },
    {
      label: 'Online Order',
      count: detail.online_order_count,
      weight: getWeightForChannel('online_order'),
    },
    {
      label: 'Late Handling',
      count: detail.late_handling_count,
      weight: getWeightForChannel('late_handling'),
    },
  ];

  const kpiPercentage = (detail.total_weighted_complaints / (detail.avg_cu_per_day * 30)) * 100;
  
  // Fungsi untuk menghitung KPI Score berdasarkan persentase
  const calculateKPIScore = (percentage: number) => {
    if (percentage <= 0.1) return 4;       // <= 0.1% = 4 (Sangat Baik)
    if (percentage <= 0.3) return 3;       // <= 0.3% = 3 (Baik)
    if (percentage <= 0.5) return 2;       // <= 0.5% = 2 (Cukup)
    if (percentage <= 0.7) return 1;       // <= 0.7% = 1 (Kurang)
    return 0;                              // > 0.7% = 0 (Sangat Kurang)
  };

  const kpiScore = calculateKPIScore(kpiPercentage);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/complaint-report')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Report Detail Complain</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Store Name</p>
              <p className="font-semibold">{detail.store_name}</p>
            </div>
            <div>
              <p className="text-gray-600">Regional</p>
              <p className="font-semibold">{detail.regional}</p>
            </div>
            <div>
              <p className="text-gray-600">Area</p>
              <p className="font-semibold">{detail.area}</p>
            </div>
            <div>
              <p className="text-gray-600">Month</p>
              <p className="font-semibold">{format(new Date(detail.input_date), 'MMMM yyyy')}</p>
            </div>
            <div>
              <p className="text-gray-600">KPI Score</p>
              <p className={`font-semibold ${kpiScore >= 3 ? 'text-green-600' : kpiScore >= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                {kpiScore} ({kpiPercentage.toFixed(2)}%)
              </p>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Complaint Details</h2>
            <div className="space-y-3">
              {channelDetails.map((channel) => (
                <div key={channel.label} className="flex items-center justify-between">
                  <span className="text-gray-600">{channel.label}</span>
                  <span className="font-medium">
                    {channel.count} × {channel.weight} = {channel.count * channel.weight}
                  </span>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total Value</span>
                  <span>{detail.total_weighted_complaints}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">KPI Calculation</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Average CU per day</span>
                <span className="font-medium">{detail.avg_cu_per_day}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Monthly Factor (30 days)</span>
                <span className="font-medium">{detail.avg_cu_per_day * 30}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Complaint Percentage</span>
                <span className="font-medium">{kpiPercentage.toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between font-semibold">
                <span>Final KPI Score</span>
                <span className={kpiScore >= 3 ? 'text-green-600' : kpiScore >= 2 ? 'text-yellow-600' : 'text-red-600'}>
                  {kpiScore}
                </span>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium mb-2">KPI Score Range:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>4 (Sangat Baik) = Complaint ≤ 0.1%</li>
                  <li>3 (Baik) = Complaint ≤ 0.3%</li>
                  <li>2 (Cukup) = Complaint ≤ 0.5%</li>
                  <li>1 (Kurang) = Complaint ≤ 0.7%</li>
                  <li>0 (Sangat Kurang) = Complaint {'>'} 0.7%</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintReportDetail;
