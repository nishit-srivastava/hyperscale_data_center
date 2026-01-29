import { Activity, Sparkles, AlertTriangle } from "lucide-react";

type DesignView = "telemetry" | "insight" | "anomalies";

interface DesignSubNavProps {
  activeView: DesignView;
  onViewChange: (view: DesignView) => void;
}

export const DesignSubNav = ({ activeView, onViewChange }: DesignSubNavProps) => {
  const views = [
    { id: "telemetry" as DesignView, label: "Live Telemetry", icon: Activity },
    { id: "insight" as DesignView, label: "AI Insight", icon: Sparkles },
    { id: "anomalies" as DesignView, label: "Anomalies", icon: AlertTriangle },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
      {views.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
            activeView === id
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          }`}
        >
          <Icon className={`w-4 h-4 ${activeView === id && id === "anomalies" ? "text-destructive" : ""}`} />
          <span>{label}</span>
          {id === "anomalies" && activeView === id && (
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
};

export type { DesignView };
