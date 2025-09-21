import React from 'react';
import { Clock } from 'lucide-react';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  isActive: boolean;
}

export const Timer: React.FC<TimerProps> = ({ timeRemaining, totalTime, isActive }) => {
  const percentage = (timeRemaining / totalTime) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColorClass = () => {
    if (percentage > 60) return 'text-emerald-500';
    if (percentage > 30) return 'text-amber-500';
    return 'text-red-500';
  };

  const getStrokeColor = () => {
    if (percentage > 60) return '#10b981';
    if (percentage > 30) return '#f59e0b';
    return '#ef4444';
  };

  if (!isActive) return null;

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="relative w-24 h-24">
        <svg
          className="w-24 h-24 transform -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-200 dark:text-gray-700"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke={getStrokeColor()}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-100 ease-linear"
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Clock className={`w-6 h-6 mx-auto mb-1 ${getColorClass()}`} />
            <div className={`text-lg font-bold ${getColorClass()}`}>
              {Math.ceil(timeRemaining)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};