import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, ShieldAlert, Wifi, Lock, Globe, Server } from "lucide-react";
import { ExplainableAIDetails } from "./ExplainableAIDetails";
import { Button } from "@/components/ui/button"; 
import { Zap, Loader2, Play } from "lucide-react";
import { useDashboard } from "../dashboard/DashboardContext"; 

interface ThreatEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  source: string;
  target: string;
  description: string;
  icon: typeof AlertTriangle;
}

const threatTemplates: Omit<ThreatEvent, "id" | "timestamp">[] = [
  {
    type: "Brute Force",
    severity: "critical",
    source: "185.220.101.42",
    target: "Auth Gateway",
    description: "Multiple failed login attempts detected on admin portal",
    icon: Lock,
  },
  {
    type: "DDoS Attack",
    severity: "high",
    source: "Distributed",
    target: "API Gateway",
    description: "Volumetric attack detected — 2.4 Gbps traffic spike",
    icon: Globe,
  },
  {
    type: "SQL Injection",
    severity: "critical",
    source: "103.45.67.89",
    target: "Transaction DB",
    description: "Malicious payload in wire transfer query parameter",
    icon: Server,
  },
  {
    type: "Phishing",
    severity: "medium",
    source: "spoofed@bank-secure.co",
    target: "Employee Email",
    description: "Credential harvesting campaign targeting treasury dept",
    icon: ShieldAlert,
  },
  {
    type: "Lateral Movement",
    severity: "high",
    source: "Internal 10.0.4.22",
    target: "Core Banking",
    description: "Anomalous RDP session from compromised workstation",
    icon: Wifi,
  },
  {
    type: "Malware C2",
    severity: "critical",
    source: "45.33.32.156",
    target: "Endpoint #847",
    description: "Cobalt Strike beacon callback detected",
    icon: AlertTriangle,
  },
  {
    type: "Data Exfiltration",
    severity: "high",
    source: "Internal",
    target: "Cloud Storage",
    description: "Unusual 4.2GB upload to external S3 bucket",
    icon: Server,
  },
  {
    type: "Zero-Day Exploit",
    severity: "critical",
    source: "Unknown APT",
    target: "SWIFT Interface",
    description: "Novel exploit targeting SWIFT messaging layer",
    icon: ShieldAlert,
  },
];

const severityColors = {
  critical: "border-critical/50 bg-critical/5",
  high: "border-warning/50 bg-warning/5",
  medium: "border-primary/30 bg-primary/5",
  low: "border-border bg-secondary/30",
};

const severityBadge = {
  critical: "bg-critical/20 text-critical",
  high: "bg-warning/20 text-warning",
  medium: "bg-primary/20 text-primary",
  low: "bg-muted text-muted-foreground",
};

function generateThreat(): ThreatEvent {
  const template = threatTemplates[Math.floor(Math.random() * threatTemplates.length)];
  return {
    ...template,
    id: crypto.randomUUID(),
    timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
  };
}

export function ThreatFeed() {
  const [threats, setThreats] = useState<ThreatEvent[]>([]);
  const [selectedThreat, setSelectedThreat] = useState<ThreatEvent | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const { triggerUpdate } = useDashboard();

  const injectManualThreat = useCallback(() => {
    const newThreat = generateThreat(); 
    setThreats(prev => [newThreat, ...prev]);
    triggerUpdate(newThreat.severity === 'critical');
  }, [triggerUpdate]);

  const handleInjectDemo = () => {
    if (isSimulating) return;

    setIsSimulating(true);
    let count = 0;

    injectManualThreat();

    const interval = setInterval(() => {
      count++;
      injectManualThreat();

      if (count >= 5) { 
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 3000); 
  };

  useEffect(() => {
    const fetchLiveThreats = async () => {
      if (isSimulating) return;

      try {
        const response = await fetch("https://cybersite-anlx.onrender.com/api/threats/live");
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        const mappedData = data.map((event: any) => {
          let iconToUse = AlertTriangle;
          if (event.type === "SQL Injection" || event.type === "Data Exfiltration") iconToUse = Server;
          else if (event.type === "Brute Force") iconToUse = Lock;
          else if (event.type === "DDoS Attack") iconToUse = Globe;
          else if (event.type === "Phishing") iconToUse = ShieldAlert;
          else if (event.type === "Lateral Movement") iconToUse = Wifi;

          return {
            id: event.id,
            type: event.type,
            severity: event.severity.toLowerCase(),
            description: event.description,
            source: event.src,
            target: event.tgt,
            timestamp: event.timestamp,
            icon: iconToUse
          };
        });

        setThreats(mappedData);
      } catch (error) {
        console.error("Failed to fetch live threats:", error);
      }
    };

    fetchLiveThreats();

    const interval = setInterval(fetchLiveThreats, 5000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-critical animate-threat-pulse" />
          <h2 className="text-sm font-mono uppercase tracking-wider text-foreground">
            Live Threat Feed
          </h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleInjectDemo}
          disabled={isSimulating}
          className={`font-mono text-[9px] h-6 px-2 uppercase tracking-tighter transition-all ${isSimulating
              ? "border-critical bg-critical/10 text-critical"
              : "border-primary/50 text-primary hover:bg-primary/10"
            }`}
        >
          {isSimulating ? (
            <>
              <Loader2 className="h-2 w-2 animate-spin mr-1" />
              SIMULATING ATTACK...
            </>
          ) : (
            <>
              <Zap className="h-2 w-2 mr-1 fill-current" />
              Inject Demo
            </>
          )}
        </Button>
      </div>

      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">
          Triage Queue
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {threats.length} events
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {threats.map((threat, i) => {
          const Icon = threat.icon;
          return (
            <div
              key={threat.id}
              onClick={() => setSelectedThreat(threat)}
              className={`rounded-md border p-3 transition-all duration-500 cursor-pointer hover:ring-1 hover:ring-primary/40 ${severityColors[threat.severity]} ${i === 0 ? "animate-in fade-in slide-in-from-top-2" : ""
                }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${threat.severity === "critical" ? "text-critical" :
                  threat.severity === "high" ? "text-warning" : "text-primary"
                  }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-foreground">
                      {threat.type}
                    </span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${severityBadge[threat.severity]}`}>
                      {threat.severity.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                      {threat.timestamp}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {threat.description}
                  </p>
                  <div className="flex gap-3 mt-1.5 text-[10px] font-mono text-muted-foreground">
                    <span>SRC: {threat.source}</span>
                    <span>→</span>
                    <span>TGT: {threat.target}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedThreat && (
        <ExplainableAIDetails
          threat={selectedThreat}
          onClose={() => setSelectedThreat(null)}
        />
      )}
    </div>
  );
}
