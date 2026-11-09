import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { KartConfig, ENGINE_SPECS } from '../../utils/kartLogic';
import { buildGoKart, KartMeshHandles } from './KartModel';
import { buildEnvironments, EnvironmentHandles } from './TrackEnvironment';
import { ParticleSystem } from './ParticleEffects';
import { sound } from '../../utils/soundEngine';

export type CameraPreset = 'front_three_quarter' | 'cockpit_pov' | 'side_profile' | 'rear_engine' | 'front_nose' | 'wheel_detail';

interface KartCanvasProps {
  config: KartConfig;
  mode: 'garage' | 'track';
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  revTrigger: number;
  driveInput: { forward: boolean; backward: boolean; left: boolean; right: boolean };
  onTelemetryUpdate?: (data: { speedMph: number; rpmRatio: number; gear: number }) => void;
}

export const KartCanvas: React.FC<KartCanvasProps> = ({
  config,
  mode,
  cameraPreset,
  autoRotate,
  revTrigger,
  driveInput,
  onTelemetryUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const kartHandlesRef = useRef<KartMeshHandles | null>(null);
  const envHandlesRef = useRef<EnvironmentHandles | null>(null);
  const particlesRef = useRef<ParticleSystem | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Mutable refs for high-frequency render loop state
  const configRef = useRef(config);
  configRef.current = config;

  const modeRef = useRef(mode);
  modeRef.current = mode;

  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const driveInputRef = useRef(driveInput);
  driveInputRef.current = driveInput;

  const onTelemetryRef = useRef(onTelemetryUpdate);
  onTelemetryRef.current = onTelemetryUpdate;

  // Camera targets & interpolation
  const targetCamPos = useRef(new THREE.Vector3(2.2, 1.2, 2.4));
  const targetLookAt = useRef(new THREE.Vector3(0, 0.25, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0.25, 0));
  const isTransitioningCam = useRef(false);

  // Driving Physics State
  const carState = useRef({
    posX: 0,
    posZ: 35, // start line on track
    heading: 0, // radians
    speed: 0, // m/s
    steerAngle: 0,
    wheelSpin: 0,
    rpmRatio: 0,
  });

  // Camera preset handler
  const setCameraPresetPosition = (preset: CameraPreset) => {
    isTransitioningCam.current = true;
    switch (preset) {
      case 'cockpit_pov':
        targetCamPos.current.set(0, 0.62, -0.15);
        targetLookAt.current.set(0, 0.45, 1.6);
        break;
      case 'side_profile':
        targetCamPos.current.set(2.8, 0.45, 0);
        targetLookAt.current.set(0, 0.25, 0);
        break;
      case 'rear_engine':
        targetCamPos.current.set(-1.6, 0.85, -2.0);
        targetLookAt.current.set(0, 0.25, -0.4);
        break;
      case 'front_nose':
        targetCamPos.current.set(0, 0.55, 2.2);
        targetLookAt.current.set(0, 0.25, 0.4);
        break;
      case 'wheel_detail':
        targetCamPos.current.set(1.2, 0.35, 0.65);
        targetLookAt.current.set(0.52, 0.16, 0.65);
        break;
      case 'front_three_quarter':
      default:
        targetCamPos.current.set(2.2, 1.2, 2.4);
        targetLookAt.current.set(0, 0.25, 0);
        break;
    }
  };

  useEffect(() => {
    if (mode === 'garage') {
      setCameraPresetPosition(cameraPreset);
    }
  }, [cameraPreset, mode]);

  // Handle engine rev trigger from UI button
  const prevRevTrigger = useRef(revTrigger);
  useEffect(() => {
    if (revTrigger !== prevRevTrigger.current && revTrigger > 0) {
      prevRevTrigger.current = revTrigger;
      sound.playRevBurst(config.engine);

      if (kartHandlesRef.current && particlesRef.current) {
        const kartPos = kartHandlesRef.current.rootGroup.position;
        const tipLocal = kartHandlesRef.current.exhaustTipPosition.clone();
        tipLocal.applyEuler(kartHandlesRef.current.rootGroup.rotation);
        const tipWorld = kartPos.clone().add(tipLocal);
        const backDir = new THREE.Vector3(0, 0.1, -1).applyEuler(kartHandlesRef.current.rootGroup.rotation);
        particlesRef.current.emitExhaustFlame(tipWorld, backDir, true);
      }
    }
  }, [revTrigger, config.engine]);

  // Update materials, wheels, cockpit or modular parts when config changes
  useEffect(() => {
    if (kartHandlesRef.current) {
      kartHandlesRef.current.updateMaterials(config);
      kartHandlesRef.current.rebuildWheelsAndCockpit(config);
      kartHandlesRef.current.rebuildModularParts(config);
    }
  }, [
    config.bodyColor,
    config.accentColor,
    config.material,
    config.raceNumber,
    config.bodykit,
    config.rearWing,
    config.wheelSize,
    config.tireWidth,
    config.tireType,
    config.rimStyle,
    config.rimColor,
    config.caliperColor,
    config.engine,
    config.steeringKit,
    config.seatKit,
    config.exhaustMod,
    config.underglow,
    config.headlightColor,
  ]);

  // Mode switch (garage vs track)
  useEffect(() => {
    if (envHandlesRef.current) {
      envHandlesRef.current.setMode(mode);
    }
    if (mode === 'track') {
      sound.startDriveEngine(config.engine);
      // Reset car position to start line
      carState.current.posX = 0;
      carState.current.posZ = 35;
      carState.current.heading = 0;
      carState.current.speed = 0;
      carState.current.steerAngle = 0;
    } else {
      sound.stopDriveEngine();
      // Reset car to garage center
      if (kartHandlesRef.current) {
        kartHandlesRef.current.rootGroup.position.set(0, 0, 0);
        kartHandlesRef.current.rootGroup.rotation.set(0, 0, 0);
      }
    }
  }, [mode, config.engine]);

  // Main Scene Initialization
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Detect software WebGL
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth, container.clientHeight);

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Scene & Studio Lighting
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);
    scene.fog = new THREE.FogExp2(0x0a0a0c, 0.015);

    // Procedural RoomEnvironment reflection
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 3.2);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 25;
      keyLight.shadow.camera.left = -4;
      keyLight.shadow.camera.right = 4;
      keyLight.shadow.camera.top = 4;
      keyLight.shadow.camera.bottom = -4;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.4);
    fillLight.position.set(-5, 4, -3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xdc2626, 2.0); // Apex red rim accent
    rimLight.position.set(0, 3, -6);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x111115, 0.7);
    scene.add(hemiLight);

    // 4. Camera & OrbitControls
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      250
    );
    camera.position.set(2.2, 1.2, 2.4);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent going below ground
    controls.minDistance = 0.8;
    controls.maxDistance = 18;
    controls.target.set(0, 0.25, 0);
    controlsRef.current = controls;

    // Cancel automated camera transition when user manually touches/drags
    controls.addEventListener('start', () => {
      isTransitioningCam.current = false;
    });

    // 5. Build Environments & Kart & Particles
    const envHandles = buildEnvironments(scene);
    envHandlesRef.current = envHandles;

    const kartHandles = buildGoKart(configRef.current);
    kartHandlesRef.current = kartHandles;
    scene.add(kartHandles.rootGroup);

    const particles = new ParticleSystem(scene);
    particlesRef.current = particles;

    // Resize handling
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Loop (Paced for Software WebGL or 60FPS on GPU)
    let animationFrameId = 0;
    let timeoutId: number | null = null;
    const clock = new THREE.Clock();

    function afterDraw(callback: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          timeoutId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          timeoutId = window.setTimeout(callback, 75);
        }
      };
      timeoutId = window.setTimeout(poll, 5);
    }

    function renderLoop() {
      const delta = Math.min(clock.getDelta(), 0.1);
      const curMode = modeRef.current;
      const curConfig = configRef.current;
      const curKart = kartHandlesRef.current;

      // UPDATE PARTICLES
      particles.update(delta);

      if (curMode === 'garage') {
        // GARAGE SHOWCASE LOGIC
        if (curKart) {
          curKart.rootGroup.position.set(0, 0, 0);
          curKart.rootGroup.rotation.set(0, 0, 0);
          curKart.frontLeftSteerPivot.rotation.y = 0;
          curKart.frontRightSteerPivot.rotation.y = 0;
          curKart.steeringWheelGroup.rotation.z = 0;
        }

        // Camera Smooth Transition or Turntable Spin
        if (isTransitioningCam.current && camera) {
          camera.position.lerp(targetCamPos.current, 0.08);
          currentLookAt.current.lerp(targetLookAt.current, 0.08);
          controls.target.copy(currentLookAt.current);

          if (camera.position.distanceTo(targetCamPos.current) < 0.02) {
            isTransitioningCam.current = false;
          }
        } else if (autoRotateRef.current) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 1.6;
        } else {
          controls.autoRotate = false;
        }

        controls.update();
      } else {
        // TEST DRIVE RACING PHYSICS
        controls.autoRotate = false;
        const state = carState.current;
        const input = driveInputRef.current;
        const engineSpec = ENGINE_SPECS[curConfig.engine] || ENGINE_SPECS.f1_turbo_hybrid;

        const maxSpeedMs = (engineSpec.topSpeedMph * 1609.34) / 3600; // convert mph to m/s
        const accelRate = (maxSpeedMs / engineSpec.zeroToSixtySec) * 1.35;
        const brakeRate = 32.0;
        const naturalFriction = 3.5;

        // Acceleration & Braking
        if (input.forward) {
          state.speed += accelRate * delta;
        } else if (input.backward) {
          if (state.speed > 0.5) {
            state.speed -= brakeRate * delta; // hard brake
          } else {
            state.speed -= (accelRate * 0.4) * delta; // reverse
          }
        } else {
          // Coasting drag
          if (state.speed > 0) {
            state.speed = Math.max(0, state.speed - naturalFriction * delta);
          } else if (state.speed < 0) {
            state.speed = Math.min(0, state.speed + naturalFriction * delta);
          }
        }

        state.speed = Math.max(-12, Math.min(maxSpeedMs, state.speed));

        // Steering Angle
        const maxSteer = 0.55; // radians (~31 degrees)
        const steerSpeed = 3.5;
        if (input.left) {
          state.steerAngle = Math.min(maxSteer, state.steerAngle + steerSpeed * delta);
        } else if (input.right) {
          state.steerAngle = Math.max(-maxSteer, state.steerAngle - steerSpeed * delta);
        } else {
          // Auto center steering
          if (state.steerAngle > 0) {
            state.steerAngle = Math.max(0, state.steerAngle - steerSpeed * 1.8 * delta);
          } else if (state.steerAngle < 0) {
            state.steerAngle = Math.min(0, state.steerAngle + steerSpeed * 1.8 * delta);
          }
        }

        // Apply turning heading
        if (Math.abs(state.speed) > 0.1) {
          const turnRate = (state.speed / 1.6) * Math.sin(state.steerAngle);
          state.heading += turnRate * delta;
        }

        // Move position
        state.posX += Math.sin(state.heading) * state.speed * delta;
        state.posZ += Math.cos(state.heading) * state.speed * delta;

        // Wheel spin rotation based on speed
        const wheelCircumference = Math.PI * 0.36; // 0.18m radius
        state.wheelSpin += (state.speed / wheelCircumference) * delta * (Math.PI * 2);

        // Update Kart in scene
        if (curKart) {
          curKart.rootGroup.position.set(state.posX, 0, state.posZ);
          curKart.rootGroup.rotation.y = state.heading;

          // Steering pivots
          curKart.frontLeftSteerPivot.rotation.y = state.steerAngle;
          curKart.frontRightSteerPivot.rotation.y = state.steerAngle;

          // Steering wheel turns in cockpit
          curKart.steeringWheelGroup.rotation.z = -state.steerAngle * 1.6;

          // Wheels spin
          curKart.wheels.forEach((w) => {
            w.rotation.x = state.wheelSpin;
          });

          // Drift smoke when turning fast or braking
          const isDrifting = Math.abs(state.steerAngle) > 0.25 && Math.abs(state.speed) > 10;
          if (isDrifting) {
            const kartPos = curKart.rootGroup.position;
            particles.emitTireSmoke(kartPos.x - 0.5, 0.1, kartPos.z - 0.6, 1.2);
            particles.emitTireSmoke(kartPos.x + 0.5, 0.1, kartPos.z - 0.6, 1.2);
          }

          // Exhaust flame when on full throttle
          if (input.forward && Math.random() > 0.75) {
            const tipLocal = curKart.exhaustTipPosition.clone().applyEuler(curKart.rootGroup.rotation);
            const tipPos = curKart.rootGroup.position.clone().add(tipLocal);
            const backDir = new THREE.Vector3(0, 0.1, -1).applyEuler(curKart.rootGroup.rotation);
            particles.emitExhaustFlame(tipPos, backDir, false);
          }
        }

        // Chase Camera behind Go-Kart
        const currentSpeedMph = Math.round(Math.abs(state.speed) * 2.23694);
        const rpmRatio = Math.max(0.15, Math.abs(state.speed) / maxSpeedMs);
        state.rpmRatio = rpmRatio;

        // Audio update
        sound.updateDriveEngineThrottle(rpmRatio, curConfig.engine);

        // Camera follow (Third-person arcade chase angle)
        const camDistance = 4.2 + (currentSpeedMph / engineSpec.topSpeedMph) * 0.9;
        const camHeight = 2.2;
        const camX = state.posX - Math.sin(state.heading) * camDistance;
        const camZ = state.posZ - Math.cos(state.heading) * camDistance;

        camera.position.set(camX, camHeight, camZ);
        controls.target.set(
          state.posX + Math.sin(state.heading) * 1.8,
          0.45,
          state.posZ + Math.cos(state.heading) * 1.8
        );
        controls.update();

        // Telemetry update callback
        const gear = currentSpeedMph === 0 ? 1 : Math.min(6, Math.floor(currentSpeedMph / 14) + 1);
        if (onTelemetryRef.current) {
          onTelemetryRef.current({
            speedMph: currentSpeedMph,
            rpmRatio,
            gear,
          });
        }
      }

      // RENDER
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(renderLoop);
      } else {
        animationFrameId = requestAnimationFrame(renderLoop);
      }
    }

    // Start Loop
    renderLoop();

    // CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (timeoutId) clearTimeout(timeoutId);
      sound.stopDriveEngine();
      controls.dispose();
      particles.dispose();
      envHandles.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="kart-3d-viewport"
      className="relative w-full h-full select-none overflow-hidden bg-[#0A0A0C]"
    />
  );
};
