
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCurrentYearMonth } from '@/utils/dateUtils';

interface DateSelectionSectionProps {
  selectedYear: string;
  selectedMonth: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
}

export const DateSelectionSection = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange
}: DateSelectionSectionProps) => {
  const { year: currentYear } = getCurrentYearMonth();
  const yearOptions = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString().padStart(2, '0');
    const monthName = new Date(2024, i, 1).toLocaleString('default', { month: 'long' });
    return { value: month, label: monthName };
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div>
        <Label htmlFor="year" className="text-gray-700 mb-1.5 block">
          Year
        </Label>
        <Select value={selectedYear} onValueChange={onYearChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="month" className="text-gray-700 mb-1.5 block">
          Month
        </Label>
        <Select value={selectedMonth} onValueChange={onMonthChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
