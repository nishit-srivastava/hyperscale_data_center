import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MetricsPanel } from "@/components/dashboard/MetricsPanel";
import { ViewportPanel } from "@/components/dashboard/ViewportPanel";
import { ChartsPanel } from "@/components/dashboard/ChartsPanel";
import { AIInsight } from "@/components/dashboard/AIInsight";
import { DesignSubNav, type DesignView } from "@/components/dashboard/DesignSubNav";
import { FutureOutlook } from "@/components/dashboard/FutureOutlook";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"design" | "sustainability">("design");
  const [designView, setDesignView] = useState<DesignView>("telemetry");

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header */}
      <DashboardHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left: 3D Viewport */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          {/* Sub Navigation for Design Tab */}
          {activeTab === "design" && (
            <DesignSubNav activeView={designView} onViewChange={setDesignView} />
          )}
          
          <div className="flex-1">
            <ViewportPanel designView={designView} />
          </div>
        </div>

        {/* Right: Metrics & Charts */}
        <div className="w-[420px] border-l border-border/50 flex flex-col overflow-hidden">
          {activeTab === "design" ? (
            <>
              {/* Metrics Table */}
              <div className="flex-1 overflow-y-auto p-4">
                <MetricsPanel />
              </div>

              {/* AI Insight - Show when in insight or telemetry view */}
              {(designView === "telemetry" || designView === "insight") && (
                <div className="p-4 border-t border-border/50">
                  <AIInsight />
                </div>
              )}

              {/* Anomaly Alert - Show when in anomalies view */}
              {designView === "anomalies" && (
                <div className="p-4 border-t border-border/50">
                  <div className="ai-insight border-l-destructive" style={{ background: 'linear-gradient(90deg, hsl(var(--destructive) / 0.1), transparent)' }}>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                          <path d="M12 9v4"/>
                          <path d="M12 17h.01"/>
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold uppercase tracking-wider text-destructive">
                            Anomaly Detected
                          </span>
                          <span className="text-xs text-muted-foreground font-mono">• Rack C</span>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          Rack C is experiencing thermal anomaly. Exhaust temperature exceeds safe threshold by 8°C.
                          <span className="text-destructive font-medium"> Immediate attention required.</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="p-4 border-t border-border/50">
                <ChartsPanel />
              </div>
            </>
          ) : (
            /* Sustainability Tab Content */
            <div className="flex-1 overflow-y-auto p-4">
              <FutureOutlook />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
