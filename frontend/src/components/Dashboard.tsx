import { BookOpen, Award } from 'lucide-react';
import Sidebar from './Sidebar';

// Rename Header & Footer to avoid conflict
import HeaderDashboard from './Header';
import FooterDashboard from './Footer';

import StatCard from './StatCard';
import HoursChart from './HoursChart';
import PerformanceGauge from './PerformanceGauge';
import Leaderboard from './Leaderboard';
import RightPanel from './RightPanel';

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">

        {/* Dashboard Header */}
        <HeaderDashboard />

        <div className="flex flex-1">
          <div className="flex-1 p-8">
            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Attended Lecture"
                value="10/32"
                bgColor="bg-purple-100"
                icon={<BookOpen className="w-8 h-8 text-purple-600" />}
              />
              <StatCard
                title="Unattended Lecture"
                value="3/32"
                bgColor="bg-amber-50"
                icon={<BookOpen className="w-8 h-8 text-amber-600" />}
              />
              <StatCard
                title="Course Completed"
                value="3/10"
                bgColor="bg-lime-50"
                icon={<Award className="w-8 h-8 text-lime-600" />}
              />
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <HoursChart />
              <PerformanceGauge />
            </div>

            <Leaderboard />
          </div>

          <RightPanel />
        </div>

        {/* Dashboard Footer */}
        <FooterDashboard />
      </div>
    </div>
  );
}
