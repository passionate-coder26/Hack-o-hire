import { X, HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExplainableAIDetailsProps {
  threat: {
    type: string;
    severity: string;
    source: string;
    target: string;
    description: string;
  };
  onClose: () => void;
}

const factors = [
  { label: "IP Reputation", weight: 45, color: "bg-critical" },
  { label: "Time of Anomaly", weight: 30, color: "bg-warning" },
  { label: "Failed Login Count", weight: 25, color: "bg-accent" },
];

export function ExplainableAIDetails({ threat, onClose }: ExplainableAIDetailsProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md mx-4 rounded-xl border border-primary/20 bg-card/80 backdrop-blur-xl p-5 shadow-2xl glow-primary animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded hover:bg-secondary transition-colors"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-foreground text-glow-primary">
            Fidelity Score Breakdown
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="bg-card border-border font-mono text-xs">
                Powered by PyOD Anomaly Detection
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="rounded-md bg-secondary/40 border border-border p-3 mb-4">
          <p className="text-[10px] font-mono uppercase text-muted-foreground mb-0.5">Alert</p>
          <p className="text-xs font-mono font-semibold text-foreground">{threat.type}</p>
          <p className="text-[11px] text-muted-foreground mt-1">{threat.description}</p>
          <div className="flex gap-3 mt-1.5 text-[10px] font-mono text-muted-foreground">
            <span>SRC: {threat.source}</span>
            <span>→</span>
            <span>TGT: {threat.target}</span>
          </div>
        </div>

        <div className="space-y-3">
          {factors.map((f) => (
            <div key={f.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-foreground">{f.label}</span>
                <span className="text-xs font-mono font-bold text-foreground">{f.weight}%</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-secondary/60 overflow-hidden">
                <div
                  className={`h-full rounded-full ${f.color} transition-all duration-700`}
                  style={{ width: `${f.weight}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">Composite Fidelity Score</span>
            <span className="text-lg font-mono font-bold text-primary text-glow-primary">94.7</span>
          </div>
        </div>
      </div>
    </div>
  );
}
