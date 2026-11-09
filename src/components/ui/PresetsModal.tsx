import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import { PRESET_BUILDS, KartConfig, calculateKartMetrics } from '../../utils/kartLogic';
import { sound } from '../../utils/soundEngine';

interface PresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: KartConfig) => void;
}

export const PresetsModal: React.FC<PresetsModalProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="presets-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 select-none backdrop-none"
    >
      <div className="relative w-full max-w-xl bg-[#0D0E14] border-2 border-red-600/50 rounded-2xl shadow-2xl p-6 text-white">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#181922] hover:bg-[#252634] text-zinc-400 hover:text-white transition-colors"
          aria-label="Close Presets Modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <h2 id="presets-modal-title" className="text-xl font-black uppercase tracking-tight text-white">
            Factory Engineered Presets
          </h2>
        </div>
        <p className="text-xs text-zinc-400 font-mono mb-5">
          Select a championship-proven blueprint or start customizing from scratch
        </p>

        <div className="space-y-3">
          {Object.entries(PRESET_BUILDS).map(([key, preset]) => {
            const metrics = calculateKartMetrics(preset);
            return (
              <div
                key={key}
                className="bg-[#14151E] hover:bg-[#1A1C28] border border-[#242636] hover:border-red-500/60 rounded-xl p-4 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/40"
                      style={{ backgroundColor: preset.bodyColor }}
                    />
                    <h3 className="font-bold text-white text-sm">{preset.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                      #{preset.raceNumber}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[10px] font-mono text-zinc-400">
                    <span>Engine: {preset.engine.replace(/_/g, ' ').toUpperCase()}</span>
                    <span>•</span>
                    <span>Top: {metrics.topSpeedMph} MPH</span>
                    <span>•</span>
                    <span>0-60: {metrics.zeroToSixtySec}s</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-mono font-bold text-sm text-white">
                    ${metrics.totalPriceUsd.toLocaleString()}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      sound.playEquip();
                      onSelectPreset(preset);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-red-950/60"
                  >
                    <span>Load</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
