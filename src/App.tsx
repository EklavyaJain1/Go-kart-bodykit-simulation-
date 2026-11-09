/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  KartConfig,
  DEFAULT_KART_CONFIG,
  calculateKartMetrics,
  serializeConfig,
  deserializeConfig,
} from './utils/kartLogic';
import { KartCanvas, CameraPreset } from './components/3d/KartCanvas';
import { Header } from './components/ui/Header';
import { ControlDock } from './components/ui/ControlDock';
import { TestDriveHUD } from './components/ui/TestDriveHUD';
import { OrderModal } from './components/ui/OrderModal';
import { PresetsModal } from './components/ui/PresetsModal';
import { sound } from './utils/soundEngine';

export default function App() {
  // Config state
  const [config, setConfig] = useState<KartConfig>(() => {
    // Check if URL has shared hash
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.slice(1);
      const restored = deserializeConfig(hash);
      if (restored) return restored;
    }
    return DEFAULT_KART_CONFIG;
  });

  // Mode: 'garage' (360 3D configurator) or 'track' (test drive circuit)
  const [mode, setMode] = useState<'garage' | 'track'>('garage');

  // Camera presets
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('front_three_quarter');
  const [autoRotate, setAutoRotate] = useState(false);

  // Audio & Rev Engine
  const [isMuted, setIsMuted] = useState(false);
  const [revTrigger, setRevTrigger] = useState(0);

  // Driving inputs & telemetry (for test drive)
  const [driveInput, setDriveInput] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  const [telemetry, setTelemetry] = useState({
    speedMph: 0,
    rpmRatio: 0,
    gear: 1,
  });

  // Modals & Toast
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Compute live performance metrics and total pricing
  const metrics = useMemo(() => calculateKartMetrics(config), [config]);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  }, []);

  // Update config
  const handleConfigChange = useCallback((patch: Partial<KartConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...patch };
      // Sync URL hash silently
      if (typeof window !== 'undefined') {
        const encoded = serializeConfig(next);
        if (encoded) {
          window.history.replaceState(null, '', `#${encoded}`);
        }
      }
      return next;
    });
  }, []);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  }, [isMuted]);

  // Trigger Rev
  const handleTriggerRev = useCallback(() => {
    setRevTrigger((prev) => prev + 1);
  }, []);

  // Share Build URL
  const handleShareBuild = useCallback(() => {
    const encoded = serializeConfig(config);
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    navigator.clipboard?.writeText?.(url);
    showToast('Config link copied to clipboard!');
  }, [config, showToast]);

  // Reset to default
  const handleResetDefault = useCallback(() => {
    setConfig(DEFAULT_KART_CONFIG);
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
    showToast('Factory specification restored.');
  }, [showToast]);

  // Autostart parameter check for Ultra-mode verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      setMode('garage');
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 't' || e.key === 'T') {
        setMode((prev) => (prev === 'garage' ? 'track' : 'garage'));
      } else if (e.key === 'r' || e.key === 'R') {
        handleTriggerRev();
      } else if (e.key === 'm' || e.key === 'M') {
        handleToggleMute();
      } else if (e.key === '1') {
        setCameraPreset('front_three_quarter');
      } else if (e.key === '2') {
        setCameraPreset('cockpit_pov');
      } else if (e.key === '3') {
        setCameraPreset('side_profile');
      } else if (e.key === '4') {
        setCameraPreset('rear_engine');
      }
    };

    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [handleTriggerRev, handleToggleMute]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0A0A0C] text-white font-sans select-none">
      {/* Top Navigation & Status Bar */}
      <Header
        config={config}
        metrics={metrics}
        mode={mode}
        onToggleMode={setMode}
        onOpenOrderModal={() => setIsOrderModalOpen(true)}
        onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
        onResetDefault={handleResetDefault}
        onShareBuild={handleShareBuild}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main 3D Viewport */}
      <main className="w-full h-full">
        <KartCanvas
          config={config}
          mode={mode}
          cameraPreset={cameraPreset}
          autoRotate={autoRotate}
          revTrigger={revTrigger}
          driveInput={driveInput}
          onTelemetryUpdate={setTelemetry}
        />
      </main>

      {/* Gamified HUD in Garage Mode */}
      {mode === 'garage' && (
        <>
          {/* Quick 360 Help Badge */}
          <div className="absolute top-18 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0F1015]/80 border border-[#242532] text-[11px] font-mono text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-red-600" />
            <span>DRAG TO ROTATE 360° • SCROLL TO ZOOM</span>
          </div>

          {/* Bottom Dock Controls */}
          <ControlDock
            config={config}
            metrics={metrics}
            onChangeConfig={handleConfigChange}
            cameraPreset={cameraPreset}
            onSelectCameraPreset={setCameraPreset}
            autoRotate={autoRotate}
            onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
            onTriggerRev={handleTriggerRev}
          />
        </>
      )}

      {/* Test Drive Circuit Mode HUD */}
      {mode === 'track' && (
        <TestDriveHUD
          speedMph={telemetry.speedMph}
          rpmRatio={telemetry.rpmRatio}
          gear={telemetry.gear}
          onExitTrack={() => setMode('garage')}
          onDriveInput={setDriveInput}
        />
      )}

      {/* Factory Order & Specification Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        config={config}
        metrics={metrics}
      />

      {/* Factory Presets Modal */}
      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={(preset) => {
          setConfig(preset);
          showToast(`Loaded ${preset.name}!`);
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed top-18 right-6 z-50 px-4 py-2 bg-red-600 text-white font-mono font-bold text-xs rounded-lg shadow-xl border border-red-400"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}
