import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardContextType {
  totalThreats: number;
  criticalCount: number;
  riskScore: number;
  isSimulating: boolean;
  triggerUpdate: (isCritical: boolean) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [totalThreats, setTotalThreats] = useState(2);
  const [criticalCount, setCriticalCount] = useState(1);
  const [riskScore, setRiskScore] = useState(45);
  const [isSimulating, setIsSimulating] = useState(false);

  const triggerUpdate = (isCritical: boolean) => {
    setIsSimulating(true);

    if (isCritical) {
      setCriticalCount(prev => prev + 1);
      setRiskScore(prev => Math.min(prev + 12, 98));
    } else {
        setRiskScore(prev => Math.min(prev + 4, 98));
    }

    setTotalThreats(prevTotal => {
      const nextTotal = prevTotal + 1;

      // 3. Logic Gate
      if (nextTotal >= 7) { 
        // Delay the reset slightly so the user sees the final threat hit, then it clears
        setTimeout(() => {
          setTotalThreats(2);      // Reset to initial
          setCriticalCount(1);     // Reset to initial
          setRiskScore(45);        // THE RESET LINE
          setIsSimulating(false);
        }, 3000); // 3 seconds of "Critical" state before clearing
      } else {
        // Normal simulation toggle
        setTimeout(() => setIsSimulating(false), 2000);
      }

      return nextTotal;
    });
  };
  
  return (
    <DashboardContext.Provider value={{ totalThreats, criticalCount, riskScore, isSimulating, triggerUpdate }}>
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within Provider");
  return context;
};