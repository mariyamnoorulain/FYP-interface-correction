import { BookOpen, BarChart3, FileText, User } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-64 bg-[#1e3a5f] text-white min-h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-blue-500 rounded-lg">
            <BookOpen className="w-6 h-6" />
          </div>
          <span className="text-xl font-semibold">AI learning</span>
        </div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium">Maryam Noor ul ain</p>
              <p className="text-xs text-gray-300">Student</p>
            </div>
          </div>
        </div>
        <nav className="space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-600/50 rounded-lg">
            <BookOpen className="w-5 h-5" />
            <span>Courses</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-600/50 rounded-lg">
            <BarChart3 className="w-5 h-5" />
            <span>Performance</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 hover:bg-blue-600/50 rounded-lg">
            <FileText className="w-5 h-5" />
            <span>Notes</span>
          </a>
        </nav>
      </div>
    </div>
  );
}
