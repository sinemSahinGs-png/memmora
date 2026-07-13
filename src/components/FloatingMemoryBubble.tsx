"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { truncateMessage } from "@/lib/memory-utils";
import { cn } from "@/lib/utils";

export interface BubbleMemory {
  id: string;
  guest_name: string;
  message: string;
}

interface FloatingMemoryBubbleProps {
  memories: BubbleMemory[];
}

const RISE_MS = 4500;
const POP_MS = 650;
const IDLE_MIN_MS = 2200;
const IDLE_MAX_MS = 4200;
const LANE_COUNT = 3;
const LANE_IDS = ["a", "b", "c"] as const;

type Phase = "idle" | "rising" | "pop";
type LaneId = (typeof LANE_IDS)[number];

interface LaneState {
  memory: BubbleMemory | null;
  phase: Phase;
  visible: boolean;
}

const INITIAL_LANE: LaneState = {
  memory: null,
  phase: "idle",
  visible: false,
};

const LANE_START_DELAYS = [500, 1800, 3100];

function randomIdleMs() {
  return IDLE_MIN_MS + Math.floor(Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS));
}

function pickMemory(
  memories: BubbleMemory[],
  excludeIds: string[]
): BubbleMemory | null {
  if (memories.length === 0) return null;
  const pool = memories.filter((m) => !excludeIds.includes(m.id));
  const source = pool.length > 0 ? pool : memories;
  return source[Math.floor(Math.random() * source.length)] ?? null;
}

export function FloatingMemoryBubble({ memories }: FloatingMemoryBubbleProps) {
  const [lanes, setLanes] = useState<LaneState[]>(
    Array.from({ length: LANE_COUNT }, () => ({ ...INITIAL_LANE }))
  );
  const timersRef = useRef<number[]>([]);
  const visibilityRef = useRef<boolean[]>(Array(LANE_COUNT).fill(false));
  const memoryIdRef = useRef<(string | null)[]>(Array(LANE_COUNT).fill(null));

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  const updateLane = useCallback(
    (laneIndex: number, patch: Partial<LaneState>) => {
      setLanes((prev) =>
        prev.map((lane, index) => {
          if (index !== laneIndex) return lane;
          const next = { ...lane, ...patch };
          if ("visible" in patch) {
            visibilityRef.current[laneIndex] = Boolean(patch.visible);
          }
          if ("memory" in patch) {
            memoryIdRef.current[laneIndex] = patch.memory?.id ?? null;
          }
          return next;
        })
      );
    },
    []
  );

  const startLane = useCallback(
    (laneIndex: number) => {
      if (memories.length === 0) return;

      const visiblePeerCount = visibilityRef.current.filter(Boolean).length;
      if (memories.length === 1 && visiblePeerCount > 0) {
        schedule(() => startLane(laneIndex), randomIdleMs());
        return;
      }

      const excludeIds: string[] = [];
      if (memories.length >= 2) {
        memoryIdRef.current.forEach((id, index) => {
          if (index === laneIndex) return;
          if (visibilityRef.current[index] && id) {
            excludeIds.push(id);
          }
        });
      }

      const next = pickMemory(memories, excludeIds);
      if (!next) {
        schedule(() => startLane(laneIndex), randomIdleMs());
        return;
      }

      updateLane(laneIndex, { memory: next, phase: "rising", visible: true });

      schedule(() => updateLane(laneIndex, { phase: "pop" }), RISE_MS);
      schedule(() => {
        updateLane(laneIndex, { visible: false, phase: "idle" });
        schedule(() => startLane(laneIndex), randomIdleMs());
      }, RISE_MS + POP_MS);
    },
    [memories, schedule, updateLane]
  );

  useEffect(() => {
    clearTimers();
    setLanes(Array.from({ length: LANE_COUNT }, () => ({ ...INITIAL_LANE })));
    visibilityRef.current = Array(LANE_COUNT).fill(false);
    memoryIdRef.current = Array(LANE_COUNT).fill(null);

    if (memories.length === 0) return clearTimers;

    const activeLaneCount = Math.min(LANE_COUNT, memories.length);

    for (let i = 0; i < activeLaneCount; i += 1) {
      schedule(() => startLane(i), LANE_START_DELAYS[i] ?? i * 1300);
    }

    return clearTimers;
  }, [memories, clearTimers, schedule, startLane]);

  if (memories.length === 0) return null;

  return (
    <>
      {lanes.map((state, index) => (
        <BubbleView
          key={LANE_IDS[index]}
          lane={LANE_IDS[index]}
          state={state}
        />
      ))}
    </>
  );
}

function BubbleView({ lane, state }: { lane: LaneId; state: LaneState }) {
  if (!state.memory || !state.visible) return null;

  return (
    <div
      className={cn(
        "floating-memory-bubble",
        `floating-memory-bubble--slot-${lane}`,
        `floating-memory-bubble--${state.phase}`
      )}
      aria-hidden
    >
      <div className="floating-memory-bubble-glass">
        <p className="floating-memory-bubble-name">{state.memory.guest_name}</p>
        <p className="floating-memory-bubble-message">
          {truncateMessage(state.memory.message, 68)}
        </p>
      </div>
    </div>
  );
}
