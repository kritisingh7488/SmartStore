import React from 'react';
import { BarChart2 } from 'lucide-react';

const Analytics = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
      <BarChart2 className="h-16 w-16 mb-4 text-slate-300 dark:text-slate-600" />
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analytics</h1>
      <p className="mt-2">Advanced analytics dashboard is under construction.</p>
    </div>
  );
};

export default Analytics;
