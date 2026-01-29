import { Sparkles } from "lucide-react";

export const AIInsight = () => {
  return (
    <div className="ai-insight animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-success" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-success">
              AI Insight
            </span>
            <span className="text-xs text-muted-foreground font-mono">• Just now</span>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed">
            Current thermal and power behavior is within nominal operating limits for the active AI inference workload. 
            <span className="text-success font-medium"> System efficiency optimal.</span>
          </p>
        </div>
      </div>
    </div>
  );
};
