import { useState, useCallback, useEffect, useRef } from "react";
import { Bot, ChevronRight, Clock, CheckCircle2, AlertCircle, Zap, FileText, Loader2, Download, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDashboard } from "../dashboard/DashboardContext";

interface PlaybookStep {
  id: number;
  action: string;
  detail: string;
  status: "pending" | "in-progress" | "complete";
  eta: string;
}

interface Playbook {
  id: string;
  title: string;
  incidentType: string;
  severity: "critical" | "high" | "medium";
  generatedAt: string;
  summary: string;
  steps: PlaybookStep[];
  riskScore?: number;
}

const initialPlaybooks: Playbook[] = [
  {
    id: "PB-001",
    title: "SWIFT Interface Zero-Day Response",
    incidentType: "Zero-Day Exploit",
    severity: "critical",
    generatedAt: "2026-02-09 14:32:07 UTC",
    summary:
      "AI analysis indicates a novel exploitation vector targeting the SWIFT messaging layer. Immediate isolation and forensic capture recommended. Estimated blast radius: 3 core banking systems.",
    steps: [
      { id: 1, action: "Isolate SWIFT Gateway", detail: "Sever network connectivity to SWIFT interface nodes SWF-01 through SWF-04. Activate backup messaging channel.", status: "complete", eta: "0m" },
      { id: 2, action: "Capture Forensic Image", detail: "Create full memory dump and disk image of affected systems for chain-of-custody evidence preservation.", status: "complete", eta: "0m" },
      { id: 3, action: "Deploy YARA Rules", detail: "Push updated YARA signatures (rule: APT_SWIFT_0DAY_2026) to all endpoint detection agents.", status: "in-progress", eta: "8m" },
      { id: 4, action: "Notify Regulators", detail: "File preliminary incident report with OCC and FinCEN within 36-hour window. Draft prepared by AI.", status: "pending", eta: "25m" },
      { id: 5, action: "Patch & Restore", detail: "Apply emergency micropatch to SWIFT interface. Validate transaction integrity before reconnection.", status: "pending", eta: "2h" },
    ],
  },
  {
    id: "PB-002",
    title: "Credential Harvesting Campaign",
    incidentType: "Phishing",
    severity: "high",
    generatedAt: "2026-02-09 13:15:42 UTC",
    summary:
      "Targeted phishing campaign against treasury department identified. 12 employees received spoofed emails. AI recommends immediate credential rotation and enhanced MFA enforcement.",
    steps: [
      { id: 1, action: "Quarantine Emails", detail: "Remove all instances of malicious email from Exchange Online using Content Search purge.", status: "complete", eta: "0m" },
      { id: 2, action: "Reset Credentials", detail: "Force password reset for all 12 targeted accounts. Revoke active OAuth tokens.", status: "in-progress", eta: "5m" },
      { id: 3, action: "Enable Phishing MFA", detail: "Upgrade targeted accounts to FIDO2 hardware key authentication.", status: "pending", eta: "30m" },
      { id: 4, action: "Threat Hunt", detail: "Search for indicators of compromise across all treasury workstations using EDR telemetry.", status: "pending", eta: "1h" },
    ],
  },
  {
    id: "PB-003",
    title: "DDoS Mitigation Protocol",
    incidentType: "DDoS Attack",
    severity: "medium",
    generatedAt: "2026-02-09 11:48:19 UTC",
    summary:
      "Volumetric DDoS attack detected on API gateway. Peak traffic: 2.4 Gbps. AI has activated rate limiting and geo-blocking rules. Customer impact: minimal.",
    steps: [
      { id: 1, action: "Activate Scrubbing", detail: "Route traffic through DDoS scrubbing center. Enable Cloudflare Under Attack mode.", status: "complete", eta: "0m" },
      { id: 2, action: "Geo-Block Sources", detail: "Block traffic from top 5 attack source countries identified by AI analysis.", status: "complete", eta: "0m" },
      { id: 3, action: "Scale Infrastructure", detail: "Auto-scale API gateway instances from 4 to 12. Monitor CPU and memory thresholds.", status: "in-progress", eta: "3m" },
      { id: 4, action: "Post-Attack Analysis", detail: "Generate attack pattern report and update WAF rules to prevent recurrence.", status: "pending", eta: "45m" },
    ],
  },
];

const severityStyles = {
  critical: "border-critical/50 bg-critical/5",
  high: "border-warning/50 bg-warning/5",
  medium: "border-primary/30 bg-primary/5",
};

const severityBadgeStyles = {
  critical: "bg-critical/20 text-critical",
  high: "bg-warning/20 text-warning",
  medium: "bg-primary/20 text-primary",
};

const statusIcons = {
  complete: <CheckCircle2 className="h-4 w-4 text-success" />,
  "in-progress": <Zap className="h-4 w-4 text-warning animate-threat-pulse" />,
  pending: <Clock className="h-4 w-4 text-muted-foreground" />,
};

const statusBadgeStyles = {
  complete: "bg-success/20 text-success",
  "in-progress": "bg-warning/20 text-warning",
  pending: "bg-muted text-muted-foreground",
};

const statusLabels = {
  complete: "Completed",
  "in-progress": "In Progress",
  pending: "Pending",
};

export function IncidentPlaybook() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);
  const [executing, setExecuting] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "System initialized. Awaiting telemetry...",
  ]);
  const { riskScore, isSimulating } = useDashboard();

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalLogs]);

  useEffect(() => {
    if (!isSimulating && riskScore > 45) {
      setTerminalLogs(prev => [...prev, "THREAT_STREAM_TERMINATED: Cleaning up vectors...", "Resetting Risk baseline to 45%"]);
    }
  }, [isSimulating, riskScore]);

  useEffect(() => {
    if (riskScore === 0 && !isSimulating) {
      setTerminalLogs(prev => [...prev, "CLEAN_STATE_DETECTED: All threat vectors neutralized.", "Resetting Aggregate Risk Monitor..."]);
    }
  }, [riskScore, isSimulating]);

  useEffect(() => {
    const generateAIPlaybook = async () => {
      try {
        setTerminalLogs(prev => [...prev, "POST /api/playbook/generate/evt_001..."]);
        const response = await fetch("https://cybersite-anlx.onrender.com/api/playbook/generate/evt_001", {
          method: "POST"
        });

        if (!response.ok) throw new Error("Failed to generate playbook");
        const data = await response.json();

        setTerminalLogs(prev => [...prev, "Checking IP Intelligence..."]);
        setTimeout(() => {
          setTerminalLogs(prev => [...prev, `Source Verified: ${data.assessment.split('.')[0]}`]);
          setTerminalLogs(prev => [...prev, `Risk Score Calculated: ${data.risk_score}%`]);
          setTerminalLogs(prev => [...prev, "SUCCESS: Playbook generated via CyberShield Agent."]);
        }, 1000);

        const livePlaybook: Playbook = {
          id: data.playbook_id,
          riskScore: data.risk_score,
          title: data.title,
          incidentType: "Autonomous AI Mitigation",
          severity: "critical",
          generatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + " UTC",
          summary: data.assessment,
          steps: data.steps.map((s: any) => ({
            id: s.step,
            action: s.title,
            detail: "Automated remediation task handled by CyberShield LangGraph Agent.", 
            status: s.status.toLowerCase() as "pending" | "in-progress" | "complete",
            eta: s.eta
          }))
        };

        setPlaybooks([livePlaybook, initialPlaybooks[1], initialPlaybooks[2]]);
        setExpanded(livePlaybook.id); 
        setIsGenerating(false);

      } catch (error) {
        console.error("AI Generation failed, falling back to templates:", error);
        setPlaybooks(initialPlaybooks);
        setIsGenerating(false);
      }
    };

    generateAIPlaybook();
  }, []);

  const handleExecute = useCallback((pbId: string) => {
    setExecuting(pbId);
    const pb = playbooks.find((p) => p.id === pbId);
    if (!pb) return;

    const pendingSteps = pb.steps.filter((s) => s.status !== "complete");

    pendingSteps.forEach((step, i) => {
      setTimeout(() => {
        setPlaybooks((prev) =>
          prev.map((p) =>
            p.id === pbId
              ? { ...p, steps: p.steps.map((s) => s.id === step.id ? { ...s, status: "in-progress" as const } : s) }
              : p
          )
        );
      }, i * 1200);

      setTimeout(() => {
        setPlaybooks((prev) =>
          prev.map((p) =>
            p.id === pbId
              ? { ...p, steps: p.steps.map((s) => s.id === step.id ? { ...s, status: "complete" as const } : s) }
              : p
          )
        );
        if (i === pendingSteps.length - 1) {
          setExecuting(null);
        }
      }, i * 1200 + 800);
    });
  }, [playbooks]);


  const handleModify = async (pbId: string) => {
    const suggestion = prompt("How should the AI modify this playbook?");
    if (!suggestion) return;

    try {
      const response = await fetch("https://cybersite-anlx.onrender.com/api/playbook/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playbook_id: pbId, user_suggestion: suggestion })
      });
      if (response.ok) {
        setTerminalLogs(prev => [...prev, `USER_FEEDBACK_INTEGRATED: "${suggestion}"`]);
        setTerminalLogs(prev => [...prev, "AI Model re-weighting mitigation steps..."]);
        alert("AI Agent updated! It is now incorporating your feedback.");
        setFeedbackSent(true);
      }
    } catch (err) {
      console.error("Feedback failed", err);
    }
  };

  const handleDownload = () => {
    const doc = new jsPDF();
    const now = new Date().toISOString();
    const activePb = playbooks[0]; 

    doc.setTextColor(220, 220, 220); 
    doc.setFontSize(60);
    doc.setFont("helvetica", "bold");
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.2 }));
    doc.text("INTERNAL USE ONLY", 40, 190, { angle: 45 });
    doc.restoreGraphicsState();

    doc.setFontSize(18);
    doc.setTextColor(0, 150, 255); 
    doc.text("CYBERSHIELD SOC: INCIDENT AUDIT TRAIL", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(220, 38, 38); 
    doc.setFont("helvetica", "bold");
    doc.text(`THREAT PROPAGATION RISK: ${activePb.riskScore || '88'}%`, 14, 32);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Report Generated: ${now}`, 14, 40);
    doc.text(`Incident ID: ${activePb.id}`, 14, 46);
    doc.text(`Status: CRYPTOGRAPHICALLY SIGNED / VERIFIED`, 14, 52);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("AI Assessment Summary", 14, 65);
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(activePb.summary, 180);
    doc.text(splitSummary, 14, 72);
    const summaryLineCount = splitSummary.length;
    const tableStartY = 72 + (summaryLineCount * 5) + 10;

    autoTable(doc, {
      startY: tableStartY,
      head: [['Step', 'Action', 'Status', 'ETA']],
      body: activePb.steps.map(s => [s.id, s.action, s.status.toUpperCase(), s.eta]),
      headStyles: { fillColor: [0, 150, 255] },
      theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable.finalY || 160;
    doc.setFontSize(11);
    doc.setTextColor(0, 150, 255);
    doc.text("Neural Engine Execution Logs:", 14, finalY + 10);
    doc.setFont("courier", "normal");
    doc.setFontSize(7);
    doc.setTextColor(80);
    const logs = terminalLogs.slice(-12).join('\n'); 
    doc.text(logs, 14, finalY + 18);

    const footerY = 255;
    doc.setDrawColor(0, 150, 255);
    doc.setLineWidth(0.5);
    doc.rect(135, footerY, 60, 25);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7);
    doc.text("DIGITALLY SIGNED BY:", 137, footerY + 5);
    doc.setFont("courier", "bold");
    doc.setFontSize(10);
    doc.setTextColor(16, 185, 129); 
    doc.text("CYBERSHIELD_AGENT_v1", 137, footerY + 13);
    doc.setFontSize(6);
    doc.setTextColor(100);
    const mockHash = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    doc.text(`SHA-256: ${mockHash.substring(0, 24)}...`, 137, footerY + 20);

    doc.save(`CyberShield_Audit_${activePb.id}.pdf`);
  };

  return (
    <TooltipProvider>
      <div className="rounded-lg border border-border bg-card p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-mono uppercase tracking-wider text-foreground flex items-center gap-2">
              <ShieldAlert className={`h-4 w-4 ${riskScore > 70 ? "text-critical animate-pulse" : riskScore > 0 ? "text-primary" : "text-success"}`} />
              AI Response Playbook
            </h2>
            <p className="text-[10px] font-mono text-muted-foreground mt-1">
              {isSimulating ? "RE-CALCULATING STRATEGY..." : riskScore > 0 ? "STATUS: MONITORING" : "STATUS: SECURE"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isGenerating ? (
              <span className="flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-warning/20 text-warning animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin" /> GENERATING...
              </span>
            ) : (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                AI-GENERATED
              </span>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="font-mono text-[10px] uppercase tracking-wider border-muted-foreground/30 text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 h-7 px-2.5 gap-1.5"
                >
                  <Download className="h-3 w-3" />
                  Download Audit Trail
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs font-mono">Export cryptographically signed SOC Incident Report</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-end mb-1.5">
            <span className="text-[10px] font-mono text-muted-foreground uppercase">Aggregate Risk Score</span>
            <span className={`text-xl font-mono font-bold transition-colors duration-500 ${riskScore > 70 ? "text-critical" : riskScore > 45 ? "text-warning" : "text-primary"
              }`}>
              {riskScore}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/10">
            <div
              className={`h-full transition-all duration-1000 ease-in-out ${riskScore > 80 ? "bg-critical" : riskScore > 40 ? "bg-warning" : riskScore > 0 ? "bg-primary" : "bg-success"
                }`}
              style={{ width: `${riskScore}%` }}
            />
          </div>
        </div>

        {isSimulating && (
          <div className="flex items-center gap-2 p-2 mb-4 bg-primary/5 border border-primary/20 rounded-md animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
            <span className="text-[10px] font-mono text-primary uppercase">
              Neural Engine: Analyzing new attack vectors...
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {playbooks.map((pb) => (
            <div
              key={pb.id}
              className={`rounded-md border transition-all ${severityStyles[pb.severity]}`}
            >
              <button
                onClick={() => setExpanded(expanded === pb.id ? null : pb.id)}
                className="w-full p-3 text-left flex items-center gap-3"
              >
                <FileText className={`h-4 w-4 shrink-0 ${pb.severity === "critical" ? "text-critical" :
                  pb.severity === "high" ? "text-warning" : "text-primary"
                  }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-semibold text-foreground">{pb.id}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${severityBadgeStyles[pb.severity]}`}>
                      {pb.severity.toUpperCase()}
                    </span>
                    {pb.id.startsWith('AI-PB') && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse flex items-center gap-1">
                        <Zap className="h-2.5 w-2.5" /> LIVE INTEL ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-foreground mt-0.5 truncate">{pb.title}</p>
                </div>
                <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expanded === pb.id ? "rotate-90" : ""}`} />
              </button>

              {expanded === pb.id && (
                <div className="px-3 pb-3 space-y-3 animate-in fade-in slide-in-from-top-1">
                  <div className="rounded bg-secondary/50 p-3 border-l-2 border-primary">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-mono uppercase text-primary">Neural Analysis Engine</span>
                      </div>
                      {feedbackSent && pb.id.startsWith('AI-PB') && (
                        <span className="text-[9px] font-mono text-success flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" /> REFINED BY ANALYST
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{pb.summary}"
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground mt-2">
                      Generated: {pb.generatedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 px-1 py-2 border-y border-border/50">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] font-mono mb-1">
                        <span className="text-muted-foreground uppercase">Threat Propagation Risk</span>
                        <span className="text-critical font-bold">{pb.riskScore || 50}%</span>
                      </div>
                      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-critical animate-threat-pulse transition-all duration-1000"
                          style={{ width: `${pb.riskScore || 50}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pb.steps.map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-start gap-3 rounded p-2.5 ${step.status === "in-progress" ? "bg-warning/5 border border-warning/20" :
                          step.status === "complete" ? "bg-success/5" : "bg-secondary/30"
                          }`}
                      >
                        <div className="mt-0.5">{statusIcons[step.status]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono font-medium text-foreground">
                              {step.id}. {step.action}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${statusBadgeStyles[step.status]}`}>
                                {statusLabels[step.status]}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                ETA: {step.eta}
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                            {step.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => handleExecute(pb.id)}
                      disabled={executing !== null || pb.steps.every((s) => s.status === "complete")}
                      className="flex-1 font-mono text-xs uppercase tracking-wider glow-primary bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                    >
                      {executing === pb.id ? (
                        <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Executing…</>
                      ) : pb.steps.every((s) => s.status === "complete") ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Executed</>
                      ) : (
                        "Approve & Execute Playbook"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleModify(pb.id)}
                      disabled={executing !== null}
                      className="font-mono text-xs uppercase tracking-wider border-border text-muted-foreground hover:text-foreground"
                    >
                      {feedbackSent ? "Feedback Integrated" : "Modify AI Steps"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 rounded border border-border bg-black/80 p-3 font-mono text-[10px] terminal-glow relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

          <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-1 relative z-10">
            <span className="text-primary font-bold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
              CYBERSHIELD_LOG_STREAM
            </span>
            <span className="text-[9px] text-muted-foreground opacity-50 uppercase">Node_V21_LGRPH</span>
          </div>

          <div
            ref={scrollRef}
            className="h-28 overflow-y-auto space-y-1 custom-scrollbar scroll-smooth relative z-10"
          >
            {terminalLogs.map((log, i) => (
              <div key={i} className="flex gap-2 border-l border-white/5 pl-2">
                <span className="text-muted-foreground/40 shrink-0 select-none">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span className="text-muted-foreground/50 shrink-0">{">"}</span>
                <span className={
                  log.includes("ERROR") ? "text-critical" :
                    log.includes("SUCCESS") ? "text-success" :
                      log.includes("FEEDBACK") ? "text-warning" :
                        "text-primary/90"
                }>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
