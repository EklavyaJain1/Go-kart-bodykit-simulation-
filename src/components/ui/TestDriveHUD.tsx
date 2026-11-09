import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Wrench, Flag } from 'lucide-react';

interface TestDriveHUDProps {
  speedMph: number;
  rpmRatio: number;
  gear: number;
  onExitTrack: () => void;
  onDriveInput: (input: { forward: boolean; backward: boolean; left: boolean; right: boolean }) => void;
}

export const TestDriveHUD: React.FC<TestDriveHUDProps> = ({
  speedMph,
  rpmRatio,
  gear,
  onExitTrack,
  onDriveInput,
}) => {
  const [keys, setKeys] = useState({ forward: false, backward: false, left: false, right: false });
  const [lapTimeSec, setLapTimeSec] = useState(0);

  // Lap timer
  useEffect(() => {
    const timer = setInterval(() => {
      setLapTimeSec((prev) => prev + 0.1);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let updated = false;
      const next = { ...keys };

      if (e.key === 'w' || e.key === 'ArrowUp') {
        next.forward = true;
        updated = true;
      }
      if (e.key === 's' || e.key === 'ArrowDown') {
        next.backward = true;
        updated = true;
      }
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        next.left = true;
        updated = true;
      }
      if (e.key === 'd' || e.key === 'ArrowRight') {
        next.right = true;
        updated = true;
      }

      if (updated) {
        setKeys(next);
        onDriveInput(next);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      let updated = false;
      const next = { ...keys };

      if (e.key === 'w' || e.key === 'ArrowUp') {
        next.forward = false;
        updated = true;
      }
      if (e.key === 's' || e.key === 'ArrowDown') {
        next.backward = false;
        updated = true;
      }
      if (e.key === 'a' || e.key === 'ArrowLeft') {
        next.left = false;
        updated = true;
      }
      if (e.key === 'd' || e.key === 'ArrowRight') {
        next.right = false;
        updated = true;
      }

      if (updated) {
        setKeys(next);
        onDriveInput(next);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [keys, onDriveInput]);

  const setManualInput = (key: 'forward' | 'backward' | 'left' | 'right', val: boolean) => {
    const next = { ...keys, [key]: val };
    setKeys(next);
    onDriveInput(next);
  };

  const minutes = Math.floor(lapTimeSec / 60);
  const seconds = (lapTimeSec % 60).toFixed(1);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.padStart(4, '0')}`;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none">
      {/* Top Left: Exit To Garage (placed cleanly below header) */}
      <div className="fixed top-18 left-4 pointer-events-auto">
        <button
          type="button"
          onClick={onExitTrack}
          className="flex items-center gap-2 px-3.5 py-2 bg-[#12131A]/95 hover:bg-red-600 text-white rounded-lg border border-[#2A2B38] hover:border-red-500 font-bold text-xs uppercase tracking-wider transition-colors shadow-2xl"
          aria-label="Return to Garage Studio"
        >
          <Wrench className="w-4 h-4 text-red-500 hover:text-white" />
          <span>Exit To Garage</span>
        </button>
      </div>

      {/* Top Right: Lap Timer */}
      <div className="fixed top-18 right-4 pointer-events-auto flex items-center gap-3 bg-[#111218]/95 px-4 py-2 rounded-lg border border-[#242634] shadow-2xl">
        <div className="flex items-center gap-1.5 text-red-500 font-black text-xs uppercase font-mono">
          <Flag className="w-4 h-4" /> TEST CIRCUIT
        </div>
        <div className="h-4 w-px bg-[#262838]" />
        <div className="font-mono text-sm font-bold text-white tracking-widest">
          {formattedTime}
        </div>
      </div>

      {/* Bottom Center: Keyboard / Touch Driving Controls */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-auto flex flex-col items-center">
        {/* Keyboard instructions badge */}
        <div className="hidden sm:flex items-center gap-3 bg-[#12131A]/90 px-4 py-2 rounded-xl border border-[#242634] text-xs font-mono text-zinc-300 shadow-xl">
          <span>STEER: <strong className="text-white">A / D</strong> or <strong className="text-white">← →</strong></span>
          <span>•</span>
          <span>GAS: <strong className="text-white">W</strong> or <strong className="text-white">↑</strong></span>
          <span>•</span>
          <span>BRAKE: <strong className="text-white">S</strong> or <strong className="text-white">↓</strong></span>
        </div>

        {/* Mobile touch pedals */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            type="button"
            onPointerDown={() => setManualInput('left', true)}
            onPointerUp={() => setManualInput('left', false)}
            className="w-12 h-12 bg-[#181922] active:bg-red-600 text-white rounded-lg flex items-center justify-center border border-[#2C2E3C]"
            aria-label="Steer Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onPointerDown={() => setManualInput('right', true)}
            onPointerUp={() => setManualInput('right', false)}
            className="w-12 h-12 bg-[#181922] active:bg-red-600 text-white rounded-lg flex items-center justify-center border border-[#2C2E3C]"
            aria-label="Steer Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onPointerDown={() => setManualInput('forward', true)}
            onPointerUp={() => setManualInput('forward', false)}
            className="w-12 h-12 bg-red-600 active:bg-red-500 text-white rounded-lg flex items-center justify-center border border-red-400 font-bold"
            aria-label="Throttle Gas"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <button
            type="button"
            onPointerDown={() => setManualInput('backward', true)}
            onPointerUp={() => setManualInput('backward', false)}
            className="w-12 h-12 bg-[#181922] active:bg-amber-600 text-white rounded-lg flex items-center justify-center border border-[#2C2E3C]"
            aria-label="Brake or Reverse"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Bottom Right: Arcade Speedometer & Tachometer Gauge (NFS / Forza HUD Style) */}
      <div className="fixed bottom-4 right-4 sm:right-6 pointer-events-auto">
        <div className="bg-[#0C0D12]/95 border-2 border-red-600/50 rounded-2xl px-5 py-3.5 shadow-2xl flex flex-col items-center">
          {/* Shift Light Bar */}
          <div className="flex items-center gap-1 mb-1.5">
            {Array.from({ length: 12 }).map((_, i) => {
              const active = rpmRatio * 12 > i;
              const isRedline = i >= 9;
              return (
                <div
                  key={i}
                  className={`w-2.5 h-1.5 rounded-xs transition-colors ${
                    active
                      ? isRedline
                        ? 'bg-red-500 shadow-sm shadow-red-500'
                        : i >= 6
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                      : 'bg-[#1C1E26]'
                  }`}
                />
              );
            })}
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-black font-mono text-4xl sm:text-5xl text-white tracking-tighter">
              {speedMph}
            </span>
            <span className="font-mono text-[10px] font-bold text-red-500 uppercase tracking-widest">
              MPH
            </span>
          </div>

          <div className="flex items-center gap-3 mt-1 font-mono text-[11px] text-zinc-400">
            <div>
              GEAR <span className="text-white font-black text-sm">{gear}</span>
            </div>
            <div className="h-3 w-px bg-[#262836]" />
            <div>
              RPM <span className="text-white font-bold">{Math.round(rpmRatio * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
