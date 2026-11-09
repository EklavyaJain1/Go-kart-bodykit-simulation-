import React, { useState } from 'react';
import {
  Shield,
  Palette,
  CircleDot,
  Zap,
  Gauge,
  ChevronDown,
  ChevronUp,
  RotateCw,
  Flame,
  Layers,
  Wrench,
} from 'lucide-react';
import {
  KartConfig,
  CalculatedPerformance,
  ENGINE_SPECS,
  EngineType,
  BodykitStyle,
  BodyMaterial,
  RearWingType,
  WheelSize,
  TireWidth,
  TireType,
  RimStyle,
  SteeringKit,
  SeatKit,
  ExhaustMod,
  UnderglowColor,
} from '../../utils/kartLogic';
import { CameraPreset } from '../3d/KartCanvas';
import { sound } from '../../utils/soundEngine';

interface ControlDockProps {
  config: KartConfig;
  metrics: CalculatedPerformance;
  onChangeConfig: (newConfig: Partial<KartConfig>) => void;
  cameraPreset: CameraPreset;
  onSelectCameraPreset: (preset: CameraPreset) => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  onTriggerRev: () => void;
}

type TabKey = 'aero' | 'materials' | 'wheels' | 'powertrain' | 'cockpit';

const COLOR_PALETTE = [
  { name: 'Apex Red', hex: '#DC2626' },
  { name: 'Pure White', hex: '#FFFFFF' },
  { name: 'Obsidian Black', hex: '#111113' },
  { name: 'Scuderia Crimson', hex: '#B91C1C' },
  { name: 'Electric Cyan', hex: '#06B6D4' },
  { name: 'Acid Volt', hex: '#84CC16' },
  { name: 'Apex Gold', hex: '#F59E0B' },
  { name: 'Stealth Slate', hex: '#475569' },
];

export const ControlDock: React.FC<ControlDockProps> = ({
  config,
  metrics,
  onChangeConfig,
  cameraPreset,
  onSelectCameraPreset,
  autoRotate,
  onToggleAutoRotate,
  onTriggerRev,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('aero');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [engineCategoryFilter, setEngineCategoryFilter] = useState<'All' | 'F1 Hybrid' | 'Petrol' | 'Electric' | 'Diesel'>('All');

  const handleTabChange = (tab: TabKey) => {
    sound.playTabSwitch();
    setActiveTab(tab);
    if (isCollapsed) setIsCollapsed(false);
  };

  const handleOptionSelect = (patch: Partial<KartConfig>) => {
    sound.playEquip();
    onChangeConfig(patch);
  };

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-20 w-[96vw] max-w-[960px] select-none">
      {/* Collapse / Expand Handle */}
      <div className="flex justify-center -mb-px">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setIsCollapsed(!isCollapsed);
          }}
          className="flex items-center gap-1.5 px-3 py-1 bg-[#14141A] hover:bg-[#1E1E26] text-zinc-300 hover:text-white rounded-t-lg border-t border-x border-[#2A2A36] text-[11px] font-bold uppercase tracking-wider transition-colors shadow-lg"
          aria-label={isCollapsed ? 'Show Controls' : 'Hide Controls'}
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-red-500" /> Show Studio Controls
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-red-500" /> Collapse Controls (Zen Mode)
            </>
          )}
        </button>
      </div>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="bg-[#0D0E14] border border-[#262836] rounded-xl shadow-2xl p-3 sm:p-4 transition-all">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 sm:gap-2 border-b border-[#1E202A] pb-2.5 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => handleTabChange('aero')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition-colors ${
                activeTab === 'aero'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-900/50'
                  : 'bg-[#151620] text-zinc-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> F1 Aero & Bodykit
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('materials')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition-colors ${
                activeTab === 'materials'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-900/50'
                  : 'bg-[#151620] text-zinc-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" /> Materials & Paint
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('wheels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition-colors ${
                activeTab === 'wheels'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-900/50'
                  : 'bg-[#151620] text-zinc-400 hover:text-white'
              }`}
            >
              <CircleDot className="w-3.5 h-3.5" /> Tires, Wheels & Alloys
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('powertrain')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition-colors ${
                activeTab === 'powertrain'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-900/50'
                  : 'bg-[#151620] text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Engines & Exhaust
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('cockpit')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition-colors ${
                activeTab === 'cockpit'
                  ? 'bg-red-600 text-white shadow-sm shadow-red-900/50'
                  : 'bg-[#151620] text-zinc-400 hover:text-white'
              }`}
            >
              <Gauge className="w-3.5 h-3.5" /> Cockpit & 360
            </button>
          </div>

          {/* Tab 1: F1 Aero & Bodykit */}
          {activeTab === 'aero' && (
            <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
              {/* Formula 1 Inspired Bodykits */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Formula 1 Aero Package
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'f1_grand_prix', label: 'F1 Grand Prix Spec', desc: 'Stepped nose + halo + shark fin' },
                      { id: 'f1_ground_effect', label: 'F1 Ground Effect', desc: 'Downwash sidepods + delta' },
                      { id: 'street_brawler', label: 'Street Brawler', desc: 'Vented box pods + roll cage' },
                      { id: 'cyber_gp', label: 'Cyber GP Pontoon', desc: 'Hollow air tunnel pontoon pods' },
                    ] as { id: BodykitStyle; label: string; desc: string }[]
                  ).map((kit) => (
                    <button
                      key={kit.id}
                      type="button"
                      onClick={() => handleOptionSelect({ bodykit: kit.id })}
                      className={`p-2 rounded border text-left transition-colors ${
                        config.bodykit === kit.id
                          ? 'bg-red-600/20 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534] hover:bg-[#1E1F2A]'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{kit.label}</div>
                      <div className="text-[9px] text-zinc-400 leading-tight mt-0.5">{kit.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rear Downforce Wings */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Rear Downforce Aero & Wings
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'f1_drs_wing', label: 'F1 Dual-Element DRS', desc: 'Swan-neck + beam wing' },
                      { id: 'sprint_vortex', label: 'Sprint Vortex Wing', desc: 'Large competition endplates' },
                      { id: 'gt_carbon', label: 'GT Carbon Blade', desc: 'Twin aluminum pylons' },
                      { id: 'ducktail', label: 'Ducktail Lip Blade', desc: 'Molded rear spoiler' },
                    ] as { id: RearWingType; label: string; desc: string }[]
                  ).map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleOptionSelect({ rearWing: w.id })}
                      className={`p-2 rounded border text-left font-semibold text-[11px] transition-colors ${
                        config.rearWing === w.id
                          ? 'bg-red-600/20 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534] hover:bg-[#1E1F2A]'
                      }`}
                    >
                      <div>{w.label}</div>
                      <div className="text-[9px] text-zinc-400 font-normal">{w.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chassis Neon & Headlight Tint */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Chassis Neon & Projector Tint
                </span>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {(
                    [
                      { id: 'red', label: 'Apex Red', hex: '#DC2626' },
                      { id: 'white', label: 'Hyper White', hex: '#FFFFFF' },
                      { id: 'cyan', label: 'Neon Cyan', hex: '#06B6D4' },
                      { id: 'amber', label: 'Amber Flame', hex: '#F59E0B' },
                      { id: 'none', label: 'Off', hex: '#222226' },
                    ] as { id: UnderglowColor; label: string; hex: string }[]
                  ).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleOptionSelect({ underglow: u.id })}
                      className={`px-2.5 py-1 rounded border text-[11px] font-bold flex items-center gap-1.5 transition-colors ${
                        config.underglow === u.id
                          ? 'bg-white text-black border-white'
                          : 'bg-[#151620] text-zinc-300 border-[#262738] hover:bg-[#1E1F2A]'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: u.hex }} />
                      {u.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-1.5 border-t border-[#1F202C]">
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">Headlight Tint:</span>
                  {['#FFFFFF', '#EF4444', '#06B6D4', '#EAB308'].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleOptionSelect({ headlightColor: h })}
                      className={`w-5 h-5 rounded-full border ${
                        config.headlightColor.toLowerCase() === h.toLowerCase()
                          ? 'border-white ring-2 ring-red-500'
                          : 'border-[#333]'
                      }`}
                      style={{ backgroundColor: h }}
                      aria-label={`Headlight Color ${h}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Materials & Paint */}
          {activeTab === 'materials' && (
            <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
              {/* Material Composition */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Body Material Formula
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'forged_carbon', label: 'Forged Carbon', desc: 'Marbled ultra-light' },
                      { id: 'twill_carbon', label: '2x2 Twill Weave', desc: 'Classic F1 carbon' },
                      { id: 'billet_metal', label: 'Billet Aluminum', desc: 'Brushed metal grain' },
                      { id: 'titanium_sheen', label: 'Titanium Sheen', desc: 'Heat-treated sheen' },
                      { id: 'gloss_lacquer', label: 'Gloss Lacquer', desc: 'Deep wet mirror shine' },
                      { id: 'stealth_matte', label: 'Stealth Matte', desc: 'Zero reflection coat' },
                    ] as { id: BodyMaterial; label: string; desc: string }[]
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleOptionSelect({ material: m.id })}
                      className={`p-2 rounded border text-left transition-colors ${
                        config.material === m.id
                          ? 'bg-red-600/20 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534] hover:bg-[#1E1F2A]'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{m.label}</div>
                      <div className="text-[9px] text-zinc-400">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Color Palette */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Primary Livery Paint (Red / Black / White)
                </span>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {COLOR_PALETTE.map((col) => (
                    <button
                      key={col.hex}
                      type="button"
                      onClick={() => handleOptionSelect({ bodyColor: col.hex })}
                      title={col.name}
                      className={`w-7 h-7 rounded-md border-2 transition-transform ${
                        config.bodyColor.toLowerCase() === col.hex.toLowerCase()
                          ? 'border-white scale-110 shadow-md ring-2 ring-red-500'
                          : 'border-[#2C2D3A] hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      aria-label={`Select ${col.name}`}
                    />
                  ))}
                </div>

                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Secondary Accent Stripe Color
                </span>
                <div className="flex gap-1.5">
                  {['#FFFFFF', '#DC2626', '#111113', '#F59E0B', '#06B6D4'].map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => handleOptionSelect({ accentColor: hex })}
                      className={`w-6 h-6 rounded border ${
                        config.accentColor.toLowerCase() === hex.toLowerCase()
                          ? 'border-red-500 ring-2 ring-white'
                          : 'border-[#333]'
                      }`}
                      style={{ backgroundColor: hex }}
                      aria-label={`Stripe Color ${hex}`}
                    />
                  ))}
                </div>
              </div>

              {/* Race Number */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Custom F1 Driver Number
                </span>
                <div className="bg-[#151620] p-3 rounded-lg border border-[#262738]">
                  <label htmlFor="f1-driver-number" className="text-[10px] text-zinc-400 block mb-1">
                    Number displayed on front nosecone & sidepods:
                  </label>
                  <input
                    id="f1-driver-number"
                    type="text"
                    maxLength={3}
                    value={config.raceNumber}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      onChangeConfig({ raceNumber: val });
                    }}
                    className="w-full bg-[#0D0E14] text-white font-mono font-black text-lg px-3 py-1.5 rounded border border-[#2E3042] text-center focus:outline-none focus:border-red-500"
                    placeholder="01"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Tires, Wheels & Alloys */}
          {activeTab === 'wheels' && (
            <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
              {/* Wheel Size & Stance */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Rim Sizing & Wheel Diameter
                </span>
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {(
                    [
                      { id: 'standard_5in', label: '5" Competition Spec', desc: 'High sidewall rubber' },
                      { id: 'lowprofile_6in', label: '6" F1 Low-Profile', desc: 'Direct razor steering' },
                      { id: 'oversized_7in', label: '7" Oversized Alloy', desc: 'Deep concave stance' },
                      { id: 'chunky_dirt', label: 'Chunky Dirt Beadlock', desc: 'All-terrain profile' },
                    ] as { id: WheelSize; label: string; desc: string }[]
                  ).map((ws) => (
                    <button
                      key={ws.id}
                      type="button"
                      onClick={() => handleOptionSelect({ wheelSize: ws.id })}
                      className={`p-2 rounded border text-left transition-colors ${
                        config.wheelSize === ws.id
                          ? 'bg-red-600/20 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534] hover:bg-[#1E1F2A]'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{ws.label}</div>
                      <div className="text-[9px] text-zinc-400">{ws.desc}</div>
                    </button>
                  ))}
                </div>

                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Tire Width & Stagger
                </span>
                <div className="grid grid-cols-3 gap-1">
                  {(
                    [
                      { id: 'staggered_f1', label: 'F1 Staggered' },
                      { id: 'standard_race', label: 'Standard' },
                      { id: 'drift_flush', label: 'Drift Square' },
                    ] as { id: TireWidth; label: string }[]
                  ).map((tw) => (
                    <button
                      key={tw.id}
                      type="button"
                      onClick={() => handleOptionSelect({ tireWidth: tw.id })}
                      className={`p-1.5 rounded border text-center text-[10px] font-bold transition-colors ${
                        config.tireWidth === tw.id
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534]'
                      }`}
                    >
                      {tw.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alloy Rim Style & Tire Compound */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Alloy Forging & Rim Design
                </span>
                <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                  {(
                    [
                      { id: 'bbs_mesh', label: 'F1 Centerlock BBS', desc: 'Cross-spoke mesh' },
                      { id: 'carbon_dish', label: 'Carbon Aero Disc', desc: 'Low drag aerocover' },
                      { id: 'turbofan', label: 'Turbofan Vanes', desc: 'Brake-cooling fins' },
                      { id: 'spoke5', label: '5-Spoke Split Concave', desc: 'Motorsport classic' },
                    ] as { id: RimStyle; label: string; desc: string }[]
                  ).map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleOptionSelect({ rimStyle: r.id })}
                      className={`p-2 rounded border text-left transition-colors ${
                        config.rimStyle === r.id
                          ? 'bg-red-600/20 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534] hover:bg-[#1E1F2A]'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{r.label}</div>
                      <div className="text-[9px] text-zinc-400">{r.desc}</div>
                    </button>
                  ))}
                </div>

                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1">
                  Tire Compound
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {(
                    [
                      { id: 'slick_racing', label: 'Slick Soft (F1 Corsa)' },
                      { id: 'wet_grooved', label: 'Grooved Rain Track' },
                      { id: 'drift_hard', label: 'Hard Drift Compound' },
                      { id: 'dirt_knobby', label: 'Knobby Dirt Buggy' },
                    ] as { id: TireType; label: string }[]
                  ).map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleOptionSelect({ tireType: t.id })}
                      className={`p-1.5 rounded border text-left text-[10px] font-bold transition-colors ${
                        config.tireType === t.id
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rim & Caliper Colors */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Rim Alloy Anodize & Caliper
                </span>
                <div className="mb-3">
                  <div className="text-[10px] text-zinc-400 font-mono mb-1">Rim Finish:</div>
                  <div className="flex gap-1.5">
                    {[
                      { hex: '#111113', label: 'Obsidian Black' },
                      { hex: '#DC2626', label: 'Apex Red' },
                      { hex: '#FFFFFF', label: 'Pure White' },
                      { hex: '#C0C0C0', label: 'Chrome Polish' },
                      { hex: '#D97706', label: 'Bronze Gold' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => handleOptionSelect({ rimColor: col.hex })}
                        className={`w-6 h-6 rounded border ${
                          config.rimColor.toLowerCase() === col.hex.toLowerCase()
                            ? 'border-white ring-2 ring-red-500'
                            : 'border-[#333]'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                        aria-label={`Rim Color ${col.label}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-zinc-400 font-mono mb-1">Brembo-Style Caliper:</div>
                  <div className="flex gap-1.5">
                    {[
                      { hex: '#DC2626', label: 'Apex Red' },
                      { hex: '#EAB308', label: 'Racing Yellow' },
                      { hex: '#FFFFFF', label: 'Ceramic White' },
                      { hex: '#18181B', label: 'Stealth Black' },
                      { hex: '#06B6D4', label: 'Cyan Anodize' },
                    ].map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => handleOptionSelect({ caliperColor: col.hex })}
                        className={`w-6 h-6 rounded border ${
                          config.caliperColor.toLowerCase() === col.hex.toLowerCase()
                            ? 'border-white ring-2 ring-red-500'
                            : 'border-[#333]'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.label}
                        aria-label={`Caliper Color ${col.label}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Engines & Exhaust */}
          {activeTab === 'powertrain' && (
            <div className="pt-3 text-xs">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-[10px] font-mono text-zinc-400 uppercase">Category:</span>
                {(['All', 'F1 Hybrid', 'Petrol', 'Electric', 'Diesel'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setEngineCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${
                      engineCategoryFilter === cat
                        ? 'bg-red-600 text-white'
                        : 'bg-[#151620] text-zinc-400 hover:text-white border border-[#242534]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Engine Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
                {(Object.keys(ENGINE_SPECS) as EngineType[])
                  .filter((eKey) => engineCategoryFilter === 'All' || ENGINE_SPECS[eKey].category === engineCategoryFilter)
                  .map((eKey) => {
                    const spec = ENGINE_SPECS[eKey];
                    const isSelected = config.engine === eKey;
                    return (
                      <button
                        key={eKey}
                        type="button"
                        onClick={() => handleOptionSelect({ engine: eKey })}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          isSelected
                            ? 'bg-red-600/20 text-white border-red-500 shadow-md ring-1 ring-red-500/50'
                            : 'bg-[#151620] text-zinc-300 border-[#242534] hover:bg-[#1E1F2A]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold font-mono px-1 py-0.5 rounded bg-[#0A0A0E] text-red-400 border border-red-500/30">
                            {spec.badge}
                          </span>
                          <span className="font-mono font-bold text-zinc-200 text-[10px]">
                            {spec.priceUsd === 0 ? 'BASE' : `+$${spec.priceUsd}`}
                          </span>
                        </div>

                        <div className="font-bold text-xs text-white leading-snug mb-0.5">{spec.name}</div>
                        <div className="text-[9px] text-zinc-400 mb-1.5">{spec.displacement}</div>

                        <div className="grid grid-cols-2 gap-1 text-[9px] font-mono text-zinc-300 pt-1 border-t border-[#22222E]">
                          <div>HP: <strong className="text-white">{spec.hp}</strong></div>
                          <div>Top: <strong className="text-white">{spec.topSpeedMph}</strong></div>
                          <div>0-60: <strong className="text-white">{spec.zeroToSixtySec}s</strong></div>
                          <div>Torque: <strong className="text-white">{spec.torqueNm}Nm</strong></div>
                        </div>
                      </button>
                    );
                  })}
              </div>

              {/* Exhaust Pipe Modifications & Rev Trigger */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#1E202C]">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase mr-1">Exhaust Kit:</span>
                  {(
                    [
                      { id: 'f1_titanium_center', label: 'F1 Titanium Center Blued' },
                      { id: 'tuned_pipe_loop', label: '2-Stroke Tuned Pipe' },
                      { id: 'sidepod_flamethrower', label: 'Sidepod Flamethrower' },
                      { id: 'quad_carbon_tips', label: 'Quad Carbon Tips' },
                      { id: 'ev_silent_diffuser', label: 'EV Aero Diffuser' },
                    ] as { id: ExhaustMod; label: string }[]
                  ).map((ex) => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleOptionSelect({ exhaustMod: ex.id })}
                      className={`px-2 py-1 rounded border text-[10px] font-semibold transition-colors ${
                        config.exhaustMod === ex.id
                          ? 'bg-red-600/30 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-400 border-[#262738] hover:text-white'
                      }`}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>

                {/* Rev Engine Arcade Trigger */}
                <button
                  type="button"
                  onClick={onTriggerRev}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white rounded-lg font-black text-xs uppercase tracking-wider shadow-lg shadow-red-950/60 border border-red-400 transition-all hover:scale-105 active:scale-95"
                  title="Rev engine sound and trigger exhaust backfire flames"
                >
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>REV ENGINE (F1 SCREAM)</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 5: Cockpit & 360 */}
          {activeTab === 'cockpit' && (
            <div className="pt-3 grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 text-xs">
              {/* Steering Kit */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Steering Kit Assembly
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'f1_oled_yoke', label: 'F1 Carbon OLED Yoke', desc: 'Display screen & dials' },
                      { id: 'd_cut_alcantara', label: 'D-Cut Flat Bottom', desc: 'Perforated Alcantara' },
                      { id: 'butterfly_race', label: 'Formula Butterfly', desc: 'Classic go-kart wheel' },
                      { id: 'open_yoke_titanium', label: 'Open Titanium Yoke', desc: 'Ultralight skeletal' },
                    ] as { id: SteeringKit; label: string; desc: string }[]
                  ).map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleOptionSelect({ steeringKit: st.id })}
                      className={`p-2 rounded border text-left transition-colors ${
                        config.steeringKit === st.id
                          ? 'bg-red-600/20 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534] hover:bg-[#1E1F2A]'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{st.label}</div>
                      <div className="text-[9px] text-zinc-400">{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seat Kit */}
              <div>
                <span className="block text-[11px] font-mono text-zinc-400 uppercase mb-1.5">
                  Cockpit Seat Kit
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {(
                    [
                      { id: 'f1_carbon_monocoque', label: 'F1 Molded Monocoque', desc: 'Reclined carbon tub' },
                      { id: 'fia_padded_bucket', label: 'FIA Padded Bucket', desc: 'High rib bolsters' },
                      { id: 'alcantara_diamond', label: 'Alcantara Diamond', desc: 'Hand stitched luxury' },
                      { id: 'poly_lightweight', label: 'Poly Lightweight', desc: 'Flexible club spec' },
                    ] as { id: SeatKit; label: string; desc: string }[]
                  ).map((sk) => (
                    <button
                      key={sk.id}
                      type="button"
                      onClick={() => handleOptionSelect({ seatKit: sk.id })}
                      className={`p-2 rounded border text-left transition-colors ${
                        config.seatKit === sk.id
                          ? 'bg-red-600/20 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534] hover:bg-[#1E1F2A]'
                      }`}
                    >
                      <div className="font-bold text-[11px]">{sk.label}</div>
                      <div className="text-[9px] text-zinc-400">{sk.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 360 Presets & Telemetry */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-mono text-zinc-400 uppercase">
                    Camera & 360 Spin
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      onToggleAutoRotate();
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                      autoRotate
                        ? 'bg-red-600 text-white border-red-400'
                        : 'bg-[#151620] text-zinc-400 border-[#262738] hover:text-white'
                    }`}
                  >
                    <RotateCw className="w-3 h-3" /> Auto 360
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-1 mb-2.5">
                  {(
                    [
                      { id: 'front_three_quarter', label: '3/4 Hero' },
                      { id: 'cockpit_pov', label: 'Cockpit' },
                      { id: 'side_profile', label: 'Side' },
                      { id: 'rear_engine', label: 'Rear' },
                      { id: 'front_nose', label: 'F1 Nose' },
                      { id: 'wheel_detail', label: 'Alloy' },
                    ] as { id: CameraPreset; label: string }[]
                  ).map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        sound.playCameraWhoosh();
                        onSelectCameraPreset(preset.id);
                      }}
                      className={`p-1.5 rounded border text-center font-bold text-[10px] uppercase tracking-wider transition-colors ${
                        cameraPreset === preset.id
                          ? 'bg-red-600 text-white border-red-500'
                          : 'bg-[#151620] text-zinc-300 border-[#242534] hover:bg-[#1E1F2A]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Telemetry quick bar */}
                <div className="bg-[#151620] p-2 rounded border border-[#242534] text-[10px] font-mono text-zinc-300">
                  <div className="flex justify-between">
                    <span>TOP SPEED: <strong className="text-white">{metrics.topSpeedMph} MPH</strong></span>
                    <span>0-60: <strong className="text-white">{metrics.zeroToSixtySec}s</strong></span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>DOWNFORCE: <strong className="text-red-500">{metrics.downforceScore} PTS</strong></span>
                    <span>WEIGHT: <strong className="text-white">{metrics.totalWeightKg} KG</strong></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
