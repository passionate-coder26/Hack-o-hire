import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useState, useEffect } from "react";
import { useDashboard } from "../dashboard/DashboardContext";

const fidelityData = [
  { time: "00:00", score: 92, alerts: 4 },
  { time: "02:00", score: 88, alerts: 8 },
  { time: "04:00", score: 91, alerts: 5 },
  { time: "06:00", score: 85, alerts: 12 },
  { time: "08:00", score: 78, alerts: 18 },
  { time: "10:00", score: 72, alerts: 24 },
  { time: "12:00", score: 80, alerts: 15 },
  { time: "14:00", score: 83, alerts: 11 },
  { time: "16:00", score: 76, alerts: 20 },
  { time: "18:00", score: 81, alerts: 14 },
  { time: "20:00", score: 87, alerts: 7 },
  { time: "22:00", score: 90, alerts: 5 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-border bg-card p-3 shadow-lg">
      <p className="text-xs font-mono text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-xs font-mono" style={{ color: p.color }}>
          {p.name}: {p.value}
          {p.name === "Fidelity Score" ? "%" : ""}
        </p>
      ))}
    </div>
  );
};

export function FidelityScoreChart() {
  const { totalThreats, riskScore } = useDashboard(); 
  const [dynamicData, setDynamicData] = useState(fidelityData);

  useEffect(() => {
    setDynamicData(prev => {
      const lastPoint = prev[prev.length - 1];
      const newPoint = {
        ...lastPoint,
        alerts: totalThreats, 
        score: Math.max(100 - riskScore, 20) 
      };
      return [...prev.slice(0, -1), newPoint];
    });
  }, [totalThreats, riskScore]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
          Fidelity Score — 24H
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-1 rounded-full bg-primary" />
            <span className="text-[10px] font-mono text-muted-foreground">Score</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-1 rounded-full bg-warning" />
            <span className="text-[10px] font-mono text-muted-foreground">Alerts</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="60%">
          <AreaChart data={dynamicData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(187, 100%, 45%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(187, 100%, 45%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(215, 15%, 50%)" }}
              axisLine={{ stroke: "hsl(220, 15%, 18%)" }}
              tickLine={false}
            />
            <YAxis
              domain={[60, 100]}
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(215, 15%, 50%)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              name="Fidelity Score"
              stroke="hsl(187, 100%, 45%)"
              strokeWidth={2}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>

        <ResponsiveContainer width="100%" height="35%">
          <BarChart data={dynamicData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(215, 15%, 50%)" }}
              axisLine={{ stroke: "hsl(220, 15%, 18%)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontFamily: "JetBrains Mono", fill: "hsl(215, 15%, 50%)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="alerts" name="Alert Count" fill="hsl(45, 100%, 55%)" radius={[2, 2, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
