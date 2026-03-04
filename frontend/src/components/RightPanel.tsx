import { User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function RightPanel() {
  return (
    <div className="w-80 bg-gray-50 min-h-screen p-6 space-y-6">
      {/* Profile Section */}
      <div className="bg-white rounded-xl p-6 text-center">
        <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
          <User className="w-10 h-10 text-white" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-1">Nasiey Puappual</h3>
        <div className="flex items-center justify-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Active</span>
        </div>
      </div>

      {/* Calendar Section */}
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">December 2021</h3>
          <div className="flex gap-2">
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-center text-xs text-gray-500 font-medium">{day}</div>
          ))}
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <button
              key={day}
              className={`aspect-square flex items-center justify-center text-sm rounded-lg ${
                day === 8 ? 'bg-teal-500 text-white' : 'hover:bg-gray-100'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* To Do List Section */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">To Do List</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">Completing Remainder Exam</p>
              <p className="text-xs text-orange-500">Programming - 09:00 AM</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" defaultChecked className="mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">Finish Skill Test</p>
              <p className="text-xs text-gray-400">UI/UX</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">Doing Home Screen</p>
              <p className="text-xs text-gray-400">UI/UX</p>
            </div>
          </label>
        </div>
      </div>

      {/* Report Analysis Section */}
      <div className="bg-white rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Report Analysis</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">Report Analysis Of Student</p>
              <p className="text-xs text-gray-400">March - 03:57 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
