import React from 'react';
import { Volume2, VolumeX, RotateCcw, Share2, ShoppingCart, Gauge, Wrench, Bookmark } from 'lucide-react';
import { CalculatedPerformance, KartConfig } from '../../utils/kartLogic';
import { sound } from '../../utils/soundEngine';

interface HeaderProps {
  config: KartConfig;
  metrics: CalculatedPerformance;
  mode: 'garage' | 'track';
  onToggleMode: (newMode: 'garage' | 'track') => void;
  onOpenOrderModal: () => void;
  onOpenPresetsModal: () => void;
  onResetDefault: () => void;
  onShareBuild: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  metrics,
  mode,
  onToggleMode,
  onOpenOrderModal,
  onOpenPresetsModal,
  onResetDefault,
  onShareBuild,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#0A0A0C]/90 backdrop-none border-b border-[#22222A]">
      {/* Brand & Kart Badge */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center font-black text-white text-lg tracking-tighter shadow-md shadow-red-900/40">
            AK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-wider text-white uppercase">
                Apex<span className="text-red-600">Kartworks</span>
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold bg-[#1C1C24] text-red-500 rounded border border-red-500/30 uppercase tracking-widest">
                MK-IV PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono tracking-tight hidden sm:block">
              CHASSIS CONFIGURATOR & FACTORY BUILD
            </p>
          </div>
        </div>

        {/* Live Price Tag */}
        <div className="hidden md:flex items-center gap-2 pl-4 border-l border-[#22222A]">
          <span className="text-[11px] text-zinc-400 uppercase font-mono">Build Total</span>
          <span className="text-sm font-black font-mono text-white bg-[#15151C] px-2.5 py-1 rounded border border-[#2E2E38]">
            ${metrics.totalPriceUsd.toLocaleString()} USD
          </span>
        </div>
      </div>

      {/* Center Mode Switch (Garage vs Track Test) */}
      <div className="flex items-center bg-[#14141A] p-1 rounded-lg border border-[#262632]">
        <button
          type="button"
          onClick={() => {
            sound.playTabSwitch();
            onToggleMode('garage');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
            mode === 'garage'
              ? 'bg-red-600 text-white shadow-sm shadow-red-900/50'
              : 'text-zinc-400 hover:text-white'
          }`}
          aria-label="Garage Studio Mode"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Garage</span> 3D
        </button>

        <button
          type="button"
          onClick={() => {
            sound.playTabSwitch();
            onToggleMode('track');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
            mode === 'track'
              ? 'bg-red-600 text-white shadow-sm shadow-red-900/50'
              : 'text-zinc-400 hover:text-white'
          }`}
          aria-label="Test Drive Track Circuit Mode"
        >
          <Gauge className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Test</span> Drive
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Presets Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onOpenPresetsModal();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#181822] hover:bg-[#222230] text-zinc-300 hover:text-white text-xs font-semibold border border-[#2A2A38] transition-colors"
          title="Factory Presets"
          aria-label="Preset Builds"
        >
          <Bookmark className="w-3.5 h-3.5 text-red-500" />
          <span className="hidden lg:inline">Presets</span>
        </button>

        {/* Share Button */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onShareBuild();
          }}
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded bg-[#181822] hover:bg-[#222230] text-zinc-300 hover:text-white text-xs font-semibold border border-[#2A2A38] transition-colors flex items-center gap-1"
          title="Share Build URL"
          aria-label="Share Build URL"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Share</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          type="button"
          onClick={() => {
            onToggleMute();
            sound.playClick();
          }}
          className={`p-1.5 rounded border transition-colors ${
            isMuted
              ? 'bg-[#181822] text-zinc-500 border-[#2A2A38]'
              : 'bg-[#181822] text-red-500 border-red-500/40 hover:text-white'
          }`}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Reset Default */}
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onResetDefault();
          }}
          className="p-1.5 rounded bg-[#181822] hover:bg-[#222230] text-zinc-400 hover:text-white border border-[#2A2A38] transition-colors"
          title="Reset to Factory Spec"
          aria-label="Reset Build"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Order / Build Sheet CTA */}
        <button
          type="button"
          onClick={() => {
            sound.playEquip();
            onOpenOrderModal();
          }}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-red-900/40 border border-red-400 transition-colors ml-1"
          aria-label="Order and Build Sheet"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Order <span className="hidden sm:inline">Build</span></span>
        </button>
      </div>
    </header>
  );
};
