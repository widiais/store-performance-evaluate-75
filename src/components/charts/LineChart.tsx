
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
  data: Array<{
    date: string;
    [key: string]: string | number | null;
  }>;
  xField: string;
  yField: string[];
  title?: string;
}

const CHART_COLORS = [
  'hsla(211, 96%, 62%, 0.8)',
  'hsla(145, 63%, 49%, 0.8)',
  'hsla(31, 90%, 56%, 0.8)',
  'hsla(271, 91%, 65%, 0.8)',
  'hsla(339, 90%, 51%, 0.8)',
  'hsla(180, 77%, 47%, 0.8)',
  'hsla(42, 100%, 51%, 0.8)',
  'hsla(301, 64%, 42%, 0.8)',
  'hsla(204, 70%, 53%, 0.8)',
  'hsla(156, 73%, 45%, 0.8)',
];

export const LineChart = ({ data, xField, yField, title }: LineChartProps) => {
  const chartData = {
    labels: data.map((item) => item[xField]),
    datasets: yField.map((field, index) => ({
      label: field,
      data: data.map((item) => item[field] as number),
      borderColor: CHART_COLORS[index % CHART_COLORS.length],
      backgroundColor: CHART_COLORS[index % CHART_COLORS.length].replace('0.8', '0.2'),
      tension: 0.4,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
}; 
