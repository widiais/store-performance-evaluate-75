import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface MetricCardProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
}

const MetricCard = ({ title, value, color, icon }: MetricCardProps) => {
  return (
    <div className="metric-card">
      <div className="w-24 h-24 mb-4">
        <CircularProgressbar
          value={value}
          text={`${value}%`}
          styles={buildStyles({
            textSize: '1.5rem',
            pathColor: color,
            textColor: color,
            trailColor: 'rgba(255,255,255,0.1)',
          })}
        />
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#828179]">
        {icon}
      </div>
      <h3 className="mt-2 text-lg font-medium">{title}</h3>
    </div>
  );
};

export default MetricCard;