/**
 * High-Fidelity Web Audio Synthesizer for Formula 1 & Racing Go-Karts
 * Authentic F1 engine harmonics, turbo whistle, soft-clipped exhaust throatiness,
 * and studio mechanical UI haptics. 100% Zero external file dependencies.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Continuous driving audio nodes
  private driveNodes: {
    gain: GainNode;
    oscillators: OscillatorNode[];
    filter: BiquadFilterNode;
    turboOsc: OscillatorNode;
    turboGain: GainNode;
  } | null = null;

  private isDriveRunning: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Smooth soft-clipping wave shaper for authentic engine throatiness
  private makeDistortionCurve(amount = 20): Float32Array {
    const k = amount;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  // UI Click - Crisp, dampened mechanical studio click
  public playClick() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // Equip / Option Select - High-tech aerodynamic confirmation chime
  public playEquip() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    // Harmonic tick 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.04); // E5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // Harmonic tick 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.04); // C6
    gain2.gain.setValueAtTime(0.1, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.15);
  }

  // Tab switch
  public playTabSwitch() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(480, now + 0.06);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Camera swoosh
  public playCameraWhoosh() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.12);
    filter.Q.value = 2.5;

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // Formula 1 Rev Engine Burst with authentic screaming V6/V10 harmonics & turbo flutter
  public playRevBurst(engineType: string) {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;

    if (engineType === 'electric_flux_25kw') {
      // High-Voltage Electric Flux Sweep
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.5);
      osc.frequency.exponentialRampToValueAtTime(500, now + 1.2);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 1.2);
      return;
    }

    // FORMULA 1 / HIGH-RPM SCREAMER SYNTHESIS
    const isF1Hybrid = engineType === 'f1_turbo_hybrid';
    const isScreamer = engineType === 'petrol_screamer_250';
    const isDiesel = engineType === 'diesel_turbo_torque';

    const basePitch = isF1Hybrid ? 120 : isScreamer ? 140 : isDiesel ? 65 : 85;
    const peakPitch = isF1Hybrid ? 480 : isScreamer ? 560 : isDiesel ? 240 : 320;

    // Harmonic 1 (Fundamental)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(basePitch, now);
    osc1.frequency.exponentialRampToValueAtTime(peakPitch, now + 0.45);
    osc1.frequency.exponentialRampToValueAtTime(basePitch * 0.9, now + 1.1);

    // Harmonic 2 (Octave for F1 scream)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(basePitch * 2, now);
    osc2.frequency.exponentialRampToValueAtTime(peakPitch * 2, now + 0.45);
    osc2.frequency.exponentialRampToValueAtTime(basePitch * 1.8, now + 1.1);

    // Harmonic 3 (Third harmonic body)
    const osc3 = ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.setValueAtTime(basePitch * 3, now);
    osc3.frequency.exponentialRampToValueAtTime(peakPitch * 3, now + 0.45);
    osc3.frequency.exponentialRampToValueAtTime(basePitch * 2.7, now + 1.1);

    // Waveshaper distortion for warm mechanical throatiness
    const shaper = ctx.createWaveShaper();
    shaper.curve = this.makeDistortionCurve(18) as unknown as Float32Array<ArrayBuffer>;

    // Formant filter (mimics tuned exhaust header pipes)
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(isF1Hybrid ? 4800 : isScreamer ? 5500 : 2600, now + 0.45);
    filter.frequency.exponentialRampToValueAtTime(1000, now + 1.1);
    filter.Q.value = 3.5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

    osc1.connect(shaper);
    osc2.connect(shaper);
    osc3.connect(shaper);
    shaper.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + 1.15);
    osc2.stop(now + 1.15);
    osc3.stop(now + 1.15);

    // High Turbocharger Spool Whistle (for F1 Hybrid and Turbo engines)
    if (isF1Hybrid || isDiesel) {
      const turbo = ctx.createOscillator();
      const tGain = ctx.createGain();
      turbo.type = 'sine';
      turbo.frequency.setValueAtTime(1200, now + 0.1);
      turbo.frequency.exponentialRampToValueAtTime(4200, now + 0.45);
      turbo.frequency.exponentialRampToValueAtTime(1800, now + 0.9);

      tGain.gain.setValueAtTime(0.001, now);
      tGain.gain.exponentialRampToValueAtTime(0.08, now + 0.35);
      tGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      turbo.connect(tGain);
      tGain.connect(this.masterGain);
      turbo.start(now);
      turbo.stop(now + 0.95);

      // Blow-Off Valve Wastegate Flutter at 0.5s
      setTimeout(() => {
        if (!this.ctx || this.isMuted || !this.masterGain) return;
        const bNow = this.ctx.currentTime;
        const noise = this.createNoiseBuffer(0.28);
        if (!noise) return;

        const source = this.ctx.createBufferSource();
        source.buffer = noise;

        const bFilter = this.ctx.createBiquadFilter();
        bFilter.type = 'bandpass';
        bFilter.frequency.setValueAtTime(3200, bNow);
        bFilter.frequency.exponentialRampToValueAtTime(1600, bNow + 0.28);
        bFilter.Q.value = 5.0;

        const bGain = this.ctx.createGain();
        bGain.gain.setValueAtTime(0.18, bNow);
        bGain.gain.exponentialRampToValueAtTime(0.001, bNow + 0.28);

        source.connect(bFilter);
        bFilter.connect(bGain);
        bGain.connect(this.masterGain);
        source.start(bNow);
      }, 480);
    }
  }

  // Continuous sound engine for test drive mode
  public startDriveEngine(engineType: string) {
    if (this.isDriveRunning || this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    try {
      const isElectric = engineType === 'electric_flux_25kw';
      const isF1 = engineType === 'f1_turbo_hybrid' || engineType === 'petrol_screamer_250';

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isElectric ? 1400 : isF1 ? 1600 : 900, ctx.currentTime);
      filter.Q.value = 2.0;

      const baseF = isElectric ? 120 : isF1 ? 95 : 60;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();

      osc1.type = isElectric ? 'sine' : 'sawtooth';
      osc2.type = isElectric ? 'triangle' : 'sawtooth';
      osc3.type = isElectric ? 'sine' : 'triangle';

      osc1.frequency.setValueAtTime(baseF, ctx.currentTime);
      osc2.frequency.setValueAtTime(baseF * 2, ctx.currentTime);
      osc3.frequency.setValueAtTime(baseF * 3, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      // Turbo spool whistle
      const turboOsc = ctx.createOscillator();
      const turboGain = ctx.createGain();
      turboOsc.type = 'sine';
      turboOsc.frequency.setValueAtTime(1400, ctx.currentTime);
      turboGain.gain.setValueAtTime(0.001, ctx.currentTime);
      turboOsc.connect(turboGain);
      turboGain.connect(this.masterGain);

      osc1.start();
      osc2.start();
      osc3.start();
      turboOsc.start();

      this.driveNodes = {
        gain,
        oscillators: [osc1, osc2, osc3],
        filter,
        turboOsc,
        turboGain,
      };
      this.isDriveRunning = true;
    } catch {
      // ignore
    }
  }

  public updateDriveEngineThrottle(rpmRatio: number, engineType: string) {
    if (!this.isDriveRunning || !this.ctx || !this.driveNodes || this.isMuted) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1, rpmRatio));
    const isElectric = engineType === 'electric_flux_25kw';
    const isF1 = engineType === 'f1_turbo_hybrid' || engineType === 'petrol_screamer_250';

    const { oscillators, filter, turboOsc, turboGain } = this.driveNodes;

    if (isElectric) {
      const freq = 120 + clamped * 1600;
      oscillators[0]?.frequency.setTargetAtTime(freq, now, 0.05);
      oscillators[1]?.frequency.setTargetAtTime(freq * 1.5, now, 0.05);
      filter.frequency.setTargetAtTime(1000 + clamped * 3500, now, 0.05);
      turboGain.gain.setTargetAtTime(0, now, 0.05);
    } else {
      const basePitch = isF1 ? 90 + clamped * 420 : 60 + clamped * 280;
      oscillators[0]?.frequency.setTargetAtTime(basePitch, now, 0.05);
      oscillators[1]?.frequency.setTargetAtTime(basePitch * 2, now, 0.05);
      oscillators[2]?.frequency.setTargetAtTime(basePitch * 3, now, 0.05);

      filter.frequency.setTargetAtTime(isF1 ? 1200 + clamped * 4200 : 700 + clamped * 2600, now, 0.05);

      // Turbo whistle builds with throttle
      turboOsc.frequency.setTargetAtTime(1600 + clamped * 3200, now, 0.05);
      turboGain.gain.setTargetAtTime(clamped > 0.3 ? (clamped - 0.3) * 0.08 : 0, now, 0.05);
    }
  }

  public stopDriveEngine() {
    if (!this.isDriveRunning) return;
    try {
      if (this.driveNodes) {
        this.driveNodes.oscillators.forEach((o) => {
          o.stop();
          o.disconnect();
        });
        this.driveNodes.turboOsc.stop();
        this.driveNodes.turboOsc.disconnect();
        this.driveNodes.gain.disconnect();
        this.driveNodes.turboGain.disconnect();
      }
    } catch {
      // ignore
    }
    this.driveNodes = null;
    this.isDriveRunning = false;
  }

  private createNoiseBuffer(duration: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }
}

export const sound = new SoundEngine();
