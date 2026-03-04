import { BookOpen } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  bgColor: string;
  icon?: React.ReactNode;
}

export default function StatCard({ title, value, bgColor, icon }: StatCardProps) {
  return (
    <div className={`${bgColor} rounded-xl p-6 flex flex-col items-center justify-center`}>
      <div className="mb-4">
        {icon || <BookOpen className="w-8 h-8 text-gray-700" />}
      </div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}
