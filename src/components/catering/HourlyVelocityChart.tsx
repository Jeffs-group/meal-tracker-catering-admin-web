import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { HourlyBucket } from "@/types/catering.types";
import { Table, BarChart2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface HourlyVelocityChartProps {
  data: HourlyBucket[];
  className?: string;
}

export const HourlyVelocityChart: React.FC<HourlyVelocityChartProps> = ({
  data,
  className,
}) => {
  const [showTable, setShowTable] = useState(false);

  // We filter to 08:00 to 15:00 for the operational window display
  const chartData = data.filter((d) => d.hour >= 8 && d.hour <= 15);

  const getBarColor = (item: HourlyBucket) => {
    if (item.hour <= 10) return "#DEC067"; // Breakfast Gold
    if (item.hour <= 15) return "#059669"; // Lunch Emerald
    return "#3B82F6"; // Dinner Blue
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              Today's Dispensation Velocity
            </h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              Hourly Dispense Rate
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real distribution throughput grouped by operating service window hours (IST).
          </p>
        </div>

        {/* Toggle between Chart & Data Table view */}
        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer self-start sm:self-auto"
        >
          {showTable ? (
            <>
              <BarChart2 className="h-3.5 w-3.5 text-[#C9A227]" />
              <span>Show Chart</span>
            </>
          ) : (
            <>
              <Table className="h-3.5 w-3.5 text-[#C9A227]" />
              <span>Show Data Table</span>
            </>
          )}
        </button>
      </div>

      {/* Chart View */}
      {!showTable ? (
        <div className="pt-4">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <XAxis
                  dataKey="hourLabel"
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tick={{ fill: "#64748B", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#F1F5F9", opacity: 0.6 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0]?.payload as HourlyBucket | undefined;
                      if (!item) return null;
                      return (
                        <div className="rounded-xl border border-slate-200 bg-slate-900 p-3 text-xs text-white shadow-xl">
                          <p className="font-bold text-[#DEC067] mb-1">
                            Hour: {item.hourLabel} IST
                          </p>
                          <div className="space-y-0.5 text-slate-300">
                            <p>Total Meals: <strong className="text-white">{item.count}</strong></p>
                            {item.breakfastCount > 0 && (
                              <p>Breakfast: {item.breakfastCount}</p>
                            )}
                            {item.lunchCount > 0 && <p>Lunch: {item.lunchCount}</p>}
                            {item.isPeak && (
                              <p className="font-bold text-amber-400 mt-1">★ Peak Service Window</p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 pt-3 text-xs text-slate-600 border-t border-slate-100 mt-2">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#DEC067]" />
              <span>Breakfast (08:00 – 10:00)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#059669]" />
              <span>Lunch (12:00 – 15:00)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#3B82F6]" />
              <span>Dinner (19:00 – 22:00)</span>
            </div>
          </div>
        </div>
      ) : (
        /* Accessible Data Table View */
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-2.5">Hour Window (IST)</th>
                <th className="p-2.5">Total Dispensed</th>
                <th className="p-2.5">Breakfast</th>
                <th className="p-2.5">Lunch</th>
                <th className="p-2.5">Dinner</th>
                <th className="p-2.5">Service Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {chartData.map((row) => (
                <tr key={row.hour} className={row.isPeak ? "bg-[#FAF4E6]/40 font-medium" : ""}>
                  <td className="p-2.5 font-mono">{row.hourLabel}</td>
                  <td className="p-2.5 font-bold text-slate-900">{row.count}</td>
                  <td className="p-2.5 text-slate-600">{row.breakfastCount}</td>
                  <td className="p-2.5 text-slate-600">{row.lunchCount}</td>
                  <td className="p-2.5 text-slate-600">{row.dinnerCount}</td>
                  <td className="p-2.5">
                    {row.isPeak ? (
                      <span className="font-bold text-[#9B7415]">Peak Window</span>
                    ) : (
                      <span className="text-slate-400">Regular</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HourlyVelocityChart;
