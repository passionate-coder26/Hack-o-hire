import { Shield, Bell, Radio } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardHeader() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-base font-bold font-mono tracking-wide text-foreground text-glow-primary">
                CYBERSHIELD SOC
              </h1>
              <p className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
                Banking Security Operations Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Radio className="h-3 w-3 text-success animate-threat-pulse" />
            <span className="text-[10px] font-mono uppercase text-success">Systems Online</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>{time.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
            <span className="text-primary">{time.toLocaleTimeString("en-US", { hour12: false })}</span>
            <span>UTC</span>
          </div>
          <button className="relative p-2 rounded-md hover:bg-secondary transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-critical animate-threat-pulse" />
          </button>
        </div>
      </div>
    </header>
  );
}
