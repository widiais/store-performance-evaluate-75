
export const calculateKPI = (actual: number, target: number): number => {
  if (!target) return 0;
  return Math.min((actual / target) * 4, 4);
};

export const calculateOPEXKPI = (totalSales: number, actualOPEX: number, targetOPEXPercentage: number): number => {
  if (!totalSales || !targetOPEXPercentage) return 0;
  const actualOPEXPercentage = (actualOPEX / totalSales) * 100;
  return Math.max(0, Math.min((targetOPEXPercentage / actualOPEXPercentage) * 4, 4));
};

export const calculateComplaintKPIScore = (totalWeightedComplaints: number, avgCUPerDay: number): number => {
  const percentage = (totalWeightedComplaints / (avgCUPerDay * 30)) * 100;
  if (percentage <= 0.1) return 4;       // <= 0.1% = 4 (Sangat Baik)
  if (percentage <= 0.3) return 3;       // <= 0.3% = 3 (Baik)
  if (percentage <= 0.5) return 2;       // <= 0.5% = 2 (Cukup)
  if (percentage <= 0.7) return 1;       // <= 0.7% = 1 (Kurang)
  return 0;                              // > 0.7% = 0 (Sangat Kurang)
};

export const lineColors = [
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
