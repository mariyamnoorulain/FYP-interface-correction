import { User } from 'lucide-react';

export default function Leaderboard() {
  const users = [
    { rank: 1, name: 'Maryam', jan: 23, feb: 40, mar: 31 },
    { rank: 3, name: 'Farraz', jan: 21, feb: 4, mar: 11 },
  ];

  return (
    <div className="bg-white rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Hours Spent</h3>

      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 text-sm font-medium text-gray-500">#Rank</th>
            <th className="text-left py-3 text-sm font-medium text-gray-500">Name</th>
            <th className="text-center py-3 text-sm font-medium text-gray-500">Jan</th>
            <th className="text-center py-3 text-sm font-medium text-gray-500">Feb</th>
            <th className="text-center py-3 text-sm font-medium text-gray-500">Mar</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.rank} className="border-b last:border-0">
              <td className="py-4 text-sm">{user.rank}</td>
              <td className="py-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </div>
              </td>
              <td className="text-center py-4 text-sm">{user.jan}</td>
              <td className="text-center py-4 text-sm">{user.feb}</td>
              <td className="text-center py-4 text-sm">{user.mar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
