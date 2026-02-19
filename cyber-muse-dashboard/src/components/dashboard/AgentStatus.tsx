import { Lock } from "lucide-react";

const agents = [
  { name: "Triage", label: "T" },
  { name: "Researcher", label: "R" },
  { name: "Strategist", label: "S" },
];

export function AgentStatus() {
  return (
    <div className="rounded-lg border border-border bg-card/80 backdrop-blur-sm p-4">
      <h3 className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-3">
        Agent Status
      </h3>

      <div className="flex items-center justify-center gap-1 mb-3">
        {agents.map((agent, i) => (
          <div key={agent.name} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <div className="w-9 h-9 rounded-full border-2 border-primary/60 bg-primary/10 flex items-center justify-center glow-primary animate-threat-pulse">
                  <span className="text-xs font-mono font-bold text-primary">{agent.label}</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-card" />
              </div>
              <span className="text-[9px] font-mono text-muted-foreground">{agent.name}</span>
            </div>
            {i < agents.length - 1 && (
              <div className="border-t-2 border-dashed border-primary/30 w-6 mb-4" />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-md bg-secondary/50 border border-border px-2.5 py-1.5">
        <Lock className="h-3 w-3 text-success shrink-0" />
        <div>
          <span className="text-[10px] font-mono font-semibold text-success">Privacy Mode: Active</span>
          <p className="text-[9px] font-mono text-muted-foreground leading-tight">
            Local LLM (Ollama) routing — Zero Data Exfiltration
          </p>
        </div>
      </div>
    </div>
  );
}
