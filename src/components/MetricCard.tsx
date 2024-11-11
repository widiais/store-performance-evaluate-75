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
      <div className="relative w-32 h-32 mb-6">
        <CircularProgressbar
          value={value}
          text={`${value}%`}
          styles={buildStyles({
            textSize: '1.25rem',
            pathColor: color,
            textColor: color,
            trailColor: 'rgba(255,255,255,0.1)',
          })}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-medium text-dashboard-text">{title}</h3>
    </div>
  );
};

export default MetricCard;