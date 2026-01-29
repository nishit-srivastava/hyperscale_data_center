import { Database, Leaf } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface DashboardHeaderProps {
  activeTab: "design" | "sustainability";
  onTabChange: (tab: "design" | "sustainability") => void;
}

export const DashboardHeader = ({ activeTab, onTabChange }: DashboardHeaderProps) => {
  return (
    <header className="h-20 border-b border-border/50 glass-panel rounded-none flex items-center justify-between px-6">
      <div className="flex items-center gap-8">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Hyperscale Data Center
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Digital Twin — Live Monitoring
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-muted/30 rounded-lg p-1">
          <button
            onClick={() => onTabChange("design")}
            className={`nav-tab rounded-md ${activeTab === "design" ? "active bg-muted" : ""}`}
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Design
            </span>
          </button>
          <button
            onClick={() => onTabChange("sustainability")}
            className={`nav-tab rounded-md ${activeTab === "sustainability" ? "active bg-muted" : ""}`}
          >
            <span className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Sustainability
            </span>
          </button>
        </nav>
      </div>

      {/* Status Indicator & Theme Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="status-indicator status-healthy" />
          <span className="text-muted-foreground">All Systems Operational</span>
        </div>
        <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
          <span className="text-xs font-mono text-primary live-data">● LIVE</span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};
