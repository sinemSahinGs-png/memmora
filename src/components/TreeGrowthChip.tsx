import { getLivingTreeChip } from "@/lib/tree-growth";
import { cn } from "@/lib/utils";

interface TreeGrowthChipProps {
  leafCount: number;
  className?: string;
}

export function TreeGrowthChip({ leafCount, className }: TreeGrowthChipProps) {
  const chip = getLivingTreeChip(leafCount);

  return (
    <div className={cn("tree-growth-chip", className)}>
      <span className="tree-growth-chip-dot" aria-hidden />
      <span>
        {chip.stageName} · {chip.leafCount} yaprak
      </span>
    </div>
  );
}
