export const MAX_GROWTH_LEAVES = 250;

const STAGE_THRESHOLDS: { min: number; name: string }[] = [
  { min: 250, name: "Sonsuz Ağaç" },
  { min: 225, name: "Efsane Ağaç" },
  { min: 150, name: "Büyük Ağaç" },
  { min: 75, name: "Olgun Ağaç" },
  { min: 30, name: "Genç Ağaç" },
  { min: 10, name: "Fidan" },
  { min: 0, name: "Tohum" },
];

const NEXT_STAGE_AT: { at: number; name: string }[] = [
  { at: 10, name: "Fidan" },
  { at: 30, name: "Genç Ağaç" },
  { at: 75, name: "Olgun Ağaç" },
  { at: 150, name: "Büyük Ağaç" },
  { at: 225, name: "Efsane Ağaç" },
  { at: 250, name: "Sonsuz Ağaç" },
];

/** Living tree chip stages (hero/footer indicator) */
const CHIP_STAGES: { min: number; name: string }[] = [
  { min: 1000, name: "Sonsuz Ağaç" },
  { min: 500, name: "Efsane Ağaç" },
  { min: 300, name: "Büyük Ağaç" },
  { min: 150, name: "Olgun Ağaç" },
  { min: 50, name: "Genç Ağaç" },
  { min: 0, name: "Tohum" },
];

export interface TreeGrowthInfo {
  stageName: string;
  progressPercentage: number;
  nextStageName: string | null;
  leavesToNextStage: number | null;
  isMaxed: boolean;
  progressHint: string;
}

export interface LivingTreeChip {
  stageName: string;
  leafCount: number;
}

function getStageName(leafCount: number): string {
  for (const stage of STAGE_THRESHOLDS) {
    if (leafCount >= stage.min) {
      return stage.name;
    }
  }
  return "Tohum";
}

export function getLivingTreeChip(leafCount: number): LivingTreeChip {
  for (const stage of CHIP_STAGES) {
    if (leafCount >= stage.min) {
      return { stageName: stage.name, leafCount };
    }
  }
  return { stageName: "Tohum", leafCount };
}

export function getTreeGrowthStage(leafCount: number): TreeGrowthInfo {
  const growthProgress = Math.min(leafCount / MAX_GROWTH_LEAVES, 1);
  const progressPercentage = Math.round(growthProgress * 100);
  const stageName = getStageName(leafCount);
  const isMaxed = leafCount >= MAX_GROWTH_LEAVES;

  if (isMaxed) {
    return {
      stageName: "Sonsuz Ağaç",
      progressPercentage: 100,
      nextStageName: null,
      leavesToNextStage: null,
      isMaxed: true,
      progressHint: "Ağaç en görkemli haline ulaştı.",
    };
  }

  const next = NEXT_STAGE_AT.find((s) => leafCount < s.at);
  const nextStageName = next?.name ?? null;
  const leavesToNextStage = next ? next.at - leafCount : null;

  const progressHint =
    nextStageName && leavesToNextStage !== null
      ? `${nextStageName} için ${leavesToNextStage} yaprak kaldı`
      : "";

  return {
    stageName,
    progressPercentage,
    nextStageName,
    leavesToNextStage,
    isMaxed: false,
    progressHint,
  };
}
