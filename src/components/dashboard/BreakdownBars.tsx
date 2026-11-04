import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Users, Briefcase, Zap, CheckCircle2 } from "lucide-react";
import type { RegistrationBreakdownData } from "@/types/dashboard.types";

export interface BreakdownBarsProps {
  data: RegistrationBreakdownData;
}

export const BreakdownBars: React.FC<BreakdownBarsProps> = ({ data }) => {
  const {
    teamRegistrations,
    teamMaxCap,
    teamPercentage,
    staffRegistrations,
    staffMaxCap,
    staffPercentage,
    dailyIntakeAvg,
    verificationRate,
  } = data;

  const barData = [
    {
      category: "Teams",
      registered: teamRegistrations,
      cap: teamMaxCap,
      percentage: teamPercentage,
      color: "#C9A227",
    },
    {
      category: "Staff",
      registered: staffRegistrations,
      cap: staffMaxCap,
      percentage: staffPercentage,
      color: "#10B981",
    },
  ];

  return (
    <div className="flex flex-col justify-between flex-1 gap-3 w-full h-full">
      {/* Visual Capacity Horizontal BarChart via Recharts with full background track */}
      <div className="w-full h-16 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={barData}
            layout="vertical"
            margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis
              type="category"
              dataKey="category"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#475569",
                fontSize: 12,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
              width={48}
            />
            <Tooltip
              formatter={(_val: unknown, _name, entry) => {
                const payload = entry.payload as {
                  registered: number;
                  cap: number;
                  percentage: number;
                };
                return [
                  `${payload.registered} / ${payload.cap} (${payload.percentage}%)`,
                  "Quota Filled",
                ];
              }}
              contentStyle={{
                backgroundColor: "#FFFFFF",
                borderRadius: "10px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                fontSize: "12px",
                fontFamily: "Inter, sans-serif",
              }}
            />
            <Bar
              dataKey="percentage"
              background={{ fill: "#F1F5F9", radius: 8 }}
              radius={[8, 8, 8, 8]}
              barSize={16}
            >
              {barData.map((entry, index) => (
                <Cell key={`bar-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Structured Details inside the card */}
      <div className="space-y-3 pt-2">
        {/* Team breakdown row */}
        <div className="flex items-center justify-between text-xs rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Users className="h-4 w-4 text-[#C9A227]" />
            <span>Team Quota</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-slate-900">
              {teamRegistrations}
            </span>
            <span className="text-slate-400">/ {teamMaxCap} Max</span>
            <span className="font-semibold text-[#9B7415]">
              ({teamPercentage}%)
            </span>
          </div>
        </div>

        {/* Staff breakdown row */}
        <div className="flex items-center justify-between text-xs rounded-lg bg-slate-50 p-2.5 border border-slate-100">
          <div className="flex items-center gap-2 font-medium text-slate-700">
            <Briefcase className="h-4 w-4 text-emerald-600" />
            <span>Staff Quota</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-slate-900">
              {staffRegistrations}
            </span>
            <span className="text-slate-400">/ {staffMaxCap} Max</span>
            <span className="font-semibold text-emerald-700">
              ({staffPercentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Metric Chips inside the card container */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 mt-auto">
        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-2.5 sm:p-3">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-1">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Daily Intake Avg</span>
          </div>
          <p className="text-lg font-bold text-slate-900 font-mono">
            {dailyIntakeAvg}{" "}
            <span className="text-xs font-normal text-slate-500">
              meals/day
            </span>
          </p>
        </div>

        <div className="rounded-xl bg-[#FAF4E6]/60 border border-[#ECD59A]/80 p-3">
          <div className="flex items-center gap-1.5 text-[#9B7415] text-xs mb-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-semibold">Verification Rate</span>
          </div>
          <p className="text-lg font-bold text-[#7D5C13] font-mono">
            {verificationRate}%{" "}
            <span className="text-xs font-normal text-[#9B7415]">verified</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BreakdownBars;
