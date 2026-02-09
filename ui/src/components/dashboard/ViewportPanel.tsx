import { useEffect, useState } from "react";
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Box,
} from "lucide-react";
import GLBViewer from "./GLBViewer";

type DesignView = "telemetry" | "insight" | "anomalies";

interface ViewportPanelProps {
  designView?: DesignView;
}

export const ViewportPanel = ({ designView = "telemetry" }: ViewportPanelProps) => {
  const [isLoading] = useState(false);

  // Lovable → 3D intent mapping
  const highlightedRack = designView === "anomalies" ? "C" : null;
  const shouldZoom = designView === "anomalies";
  const [selectedRack, setSelectedRack] = useState(null);
  const anomalyRack = designView === "anomalies" ? "RackC" : null;


  // React to designView changes
 useEffect(() => {
  if (!highlightedRack) return;

  const rackPrefixMap: Record<string, string> = {
    A: "Servers_dup_3",
    B: "Servers_dup_6",
    C: "Servers_dup_2",
    D: "Servers_dup_5",
  };


  const prefix = rackPrefixMap[highlightedRack];
  if (!prefix) return;

  const tryApply = () => {
    // const api = window.GLBViewerAPI;
    // if (!api) return false;

    // api.highlightRack?.(prefix);

    // if (shouldZoom) {
    //   api.zoomTo?.(prefix);
    // }
    return true;
  };

  // try immediately
  if (tryApply()) return;

  // retry shortly (GLBViewer mounting)
  const id = setTimeout(() => {
    tryApply();
  }, 200);

  return () => clearTimeout(id);
}, [highlightedRack, shouldZoom]);


  return (
    <div className="h-full viewport-container flex flex-col">
      {/* Viewport Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <Box className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium">3D Rack Visualization</span>
          {designView === "anomalies" && (
            <span className="px-2 py-0.5 text-xs font-medium bg-destructive/20 text-destructive rounded-full animate-pulse">
              Anomaly Detected
            </span>
          )}
        </div>

        {/* Viewport Controls (UI only for now) */}
        <div className="flex items-center gap-1">
          {[
            { icon: RotateCcw, label: "Reset View" },
            { icon: ZoomIn, label: "Zoom In" },
            { icon: ZoomOut, label: "Zoom Out" },
            { icon: Move, label: "Pan" },
            { icon: Maximize2, label: "Fullscreen" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* 3D Viewport Content */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading 3D Model...</p>
          </div>
        ) : (
          <>
            {/* REAL 3D VIEWER */}
            <GLBViewer
              glb="/models/server_room.glb"
              selectedRack={selectedRack}
              anomalyRack={designView === "anomalies" ? "RackC" : null}
              showHTML={true}
            />

            {/* Scan Line Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
            </div>
          </>
        )}
      </div>

      {/* Viewport Footer */}
      <div className="flex items-center justify-between p-3 border-t border-border/30 text-xs text-muted-foreground">
        <span className="font-mono">Perspective View</span>
        <span className="font-mono">Scale: 1:10</span>
      </div>
    </div>
  );
};
