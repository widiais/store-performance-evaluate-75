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

export const LineChart = ({ data, xField, yField, title }: LineChartProps) => {
  const chartData = {
    labels: data.map((item) => item[xField]),
    datasets: yField.map((field, index) => ({
      label: field,
      data: data.map((item) => item[field] as number),
      borderColor: `hsl(${index * 45}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 45}, 70%, 50%, 0.5)`,
      tension: 0.4,
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
        max: 4,
      },
    },
  };

  return <Line data={chartData} options={options} />;
}; 