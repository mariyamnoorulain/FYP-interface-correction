import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { month: "Jan", Study: 10, Exams: 8 },
  { month: "Feb", Study: 8, Exams: 15 },
  { month: "Mar", Study: 18, Exams: 10 },
  { month: "Apr", Study: 10, Exams: 8 },
  { month: "May", Study: 12, Exams: 8 },
];

export default function HoursChart() {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Hours Spent</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="Study" fill="#ff9b71" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Exams" fill="#5b6aff" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
