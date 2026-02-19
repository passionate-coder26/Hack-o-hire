import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ThreatStatsCards } from "@/components/dashboard/ThreatStatsCards";
import { ThreatFeed } from "@/components/dashboard/ThreatFeed";
import { FidelityScoreChart } from "@/components/dashboard/FidelityScoreChart";
import { IncidentPlaybook } from "@/components/dashboard/IncidentPlaybook";
import { AgentStatus } from "@/components/dashboard/AgentStatus";

const Index = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid-bg scanline">
      <DashboardHeader />

      <main className="p-4 lg:p-6 space-y-4 lg:space-y-6 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 lg:gap-6">
          <ThreatStatsCards />
          <AgentStatus />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          <div className="min-h-[500px]">
            <ThreatFeed />
          </div>
          <div className="min-h-[500px]">
            <FidelityScoreChart />
          </div>
        </div>

        <div>
          <IncidentPlaybook />
        </div>
      </main>
    </div>
  );
};

export default Index;
