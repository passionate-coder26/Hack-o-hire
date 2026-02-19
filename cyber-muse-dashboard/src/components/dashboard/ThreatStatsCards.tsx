import { Shield, AlertTriangle, Bug, Activity } from "lucide-react";

const stats = [
  {
    label: "Active Threats",
    value: "23",
    change: "+3",
    trend: "up" as const,
    icon: AlertTriangle,
    color: "critical" as const,
  },
  {
    label: "Blocked Attacks",
    value: "1,847",
    change: "+127 today",
    trend: "up" as const,
    icon: Shield,
    color: "success" as const,
  },
  {
    label: "Vulnerabilities",
    value: "156",
    change: "-12",
    trend: "down" as const,
    icon: Bug,
    color: "warning" as const,
  },
  {
    label: "System Health",
    value: "98.7%",
    change: "Nominal",
    trend: "stable" as const,
    icon: Activity,
    color: "primary" as const,
  },
];

const colorMap = {
  critical: {
    text: "text-critical",
    bg: "bg-critical/10",
    border: "border-critical/30",
    glow: "glow-critical",
  },
  success: {
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    glow: "glow-success",
  },
  warning: {
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    glow: "glow-warning",
  },
  primary: {
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    glow: "glow-primary",
  },
};

export function ThreatStatsCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const colors = colorMap[stat.color];
        return (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-lg border ${colors.border} ${colors.bg} p-4 backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold font-mono mt-1 ${colors.text}`}>
                  {stat.value}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </div>
              <div className={`p-2 rounded-md ${colors.bg}`}>
                <stat.icon className={`h-5 w-5 ${colors.text}`} />
              </div>
            </div>
            {stat.color === "critical" && (
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-critical animate-threat-pulse m-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}
