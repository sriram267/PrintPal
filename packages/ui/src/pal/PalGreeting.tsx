import * as React from "react";
import { PalMascot } from "./PalMascot";
import { GREETING_H, GREETING_MS, GREETING_W, MASCOT_PX, rigFrom, runPalGreeting } from "./greetingEngine";

export interface PalGreetingProps {
  /** Called once when the greeting has finished playing. */
  onDone?: () => void;
  /** Change this number to play the greeting again. */
  playKey?: number;
}

/**
 * Pal's entrance: the notch scene (streaks, particle ring, halo) on a canvas, with Pal drawn as sharp vector
 * on top and moved frame by frame. 440 × 104, scales down on narrow screens.
 */
export function PalGreeting({ onDone, playKey = 0 }: PalGreetingProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const stageRef = React.useRef<HTMLDivElement | null>(null);
  const palRef = React.useRef<HTMLDivElement | null>(null);
  const doneRef = React.useRef(onDone);
  doneRef.current = onDone;

  React.useEffect(() => {
    if (!canvasRef.current || !stageRef.current || !palRef.current) return;
    const finish = () => doneRef.current?.();
    const stop = runPalGreeting(canvasRef.current, stageRef.current, rigFrom(palRef.current), finish);
    const fallback = window.setTimeout(finish, GREETING_MS + 600);
    return () => {
      stop();
      window.clearTimeout(fallback);
    };
  }, [playKey]);

  const stageW = `min(${GREETING_W}px, calc(100vw - 28px))`;
  return (
    <div className="relative block w-full overflow-hidden" style={{ height: GREETING_H }} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="absolute left-1/2 top-0 block -translate-x-1/2"
        style={{ width: stageW, height: GREETING_H }}
      />
      <div
        ref={stageRef}
        className="pointer-events-none absolute left-1/2 top-0 origin-top-left"
        style={{ width: GREETING_W, height: GREETING_H, marginLeft: `calc(${stageW} / -2)` }}
      >
        <div ref={palRef} className="absolute left-0 top-0 origin-center opacity-0">
          <PalMascot size={MASCOT_PX} mode="rig" />
        </div>
      </div>
    </div>
  );
}
