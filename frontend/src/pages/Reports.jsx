import React from 'react';
import { FileText } from 'lucide-react';

const Reports = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
      <FileText className="h-16 w-16 mb-4 text-slate-300 dark:text-slate-600" />
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reports</h1>
      <p className="mt-2">Automated report generation is under construction.</p>
    </div>
  );
};

export default Reports;
