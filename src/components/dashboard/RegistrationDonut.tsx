import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { RegistrationDonutData } from "@/types/dashboard.types";

export interface RegistrationDonutProps {
  data: RegistrationDonutData;
}

export const RegistrationDonut: React.FC<RegistrationDonutProps> = ({
  data,
}) => {
  const {
    approved,
    approvedPercent,
    pending,
    pendingPercent,
    rejected,
    rejectedPercent,
    total,
  } = data;

  const chartData = [
    { name: "Approved", value: approved, color: "#10B981" },
    { name: "Pending", value: pending, color: "#F59E0B" },
    { name: "Rejected", value: rejected, color: "#F43F5E" },
  ];

  return (
    <div className="flex flex-col items-center justify-between w-full h-full">
      {/* Recharts Pie / Donut Chart */}
      <div className="relative w-full h-48 flex items-center justify-center my-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Tooltip
              formatter={(val: unknown, name?: unknown) => {
                const num = Number(val) || 0;
                const pct = total > 0 ? Math.round((num / total) * 100) : 0;
                return [`${num} (${pct}%)`, String(name || "")];
              }}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={54}
              outerRadius={74}
              paddingAngle={3}
              dataKey="value"
              stroke="#FFFFFF"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total Count Overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-none font-mono">
            {total}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-1">
            Total Reg.
          </span>
        </div>
      </div>

      {/* Details list strictly inside the card container */}
      <div className="w-full space-y-2 border-t border-slate-100 pt-4 mt-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-medium text-slate-700">Approved</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold text-slate-900">{approved}</span>
            <span className="text-slate-400 text-[11px]">
              ({approvedPercent}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="font-medium text-slate-700">Pending</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold text-slate-900">{pending}</span>
            <span className="text-slate-400 text-[11px]">
              ({pendingPercent}%)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="font-medium text-slate-700">Rejected</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="font-semibold text-slate-900">{rejected}</span>
            <span className="text-slate-400 text-[11px]">
              ({rejectedPercent}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationDonut;
