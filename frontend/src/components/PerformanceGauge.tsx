import {
  RadialBar,
  RadialBarChart,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  {
    name: "Performance",
    value: 68,       // Percentage
    fill: "#10b981", // Green color
  },
];

export default function PerformanceGauge() {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">Performance Gauge</h2>

      <ResponsiveContainer width="100%" height={250}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="70%"
          outerRadius="100%"
          barSize={16}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            minAngle={15}
            background
            clockWise
            dataKey="value"
          />
          <Legend
            iconSize={10}
            layout="vertical"
            verticalAlign="middle"
            wrapperStyle={{
              top: 0,
              left: 0,
              fontSize: "14px",
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <p className="text-lg font-medium mt-4">
        Overall Performance: <span className="text-green-600 font-bold">68%</span>
      </p>
    </div>
  );
}
