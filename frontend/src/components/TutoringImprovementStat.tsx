import { TrendingUp, Users } from 'lucide-react';

interface TutoringImprovementStatProps {
  improvementPercentage: number;
  totalSessions: number;
}

export default function TutoringImprovementStat({ 
  improvementPercentage, 
  totalSessions 
}: TutoringImprovementStatProps) {
  return (
    <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl shadow-lg border-2 border-green-200 p-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Emotion Improvement After Tutoring</h3>
          <p className="text-gray-700 text-sm mb-2">
            Students showed <span className="font-bold text-green-600">{improvementPercentage}% lower confusion</span> after tutor-assisted sessions.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>Based on {totalSessions} sessions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

