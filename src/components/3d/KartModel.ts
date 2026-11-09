import * as THREE from 'three';
import { KartConfig } from '../../utils/kartLogic';
import {
  createTireTexture,
  createCarbonTexture,
  createForgedCarbonTexture,
  createBrushedMetalTexture,
  createBrakeDiscTexture,
  createNumberDecalTexture,
} from './proceduralTextures';

export interface KartMeshHandles {
  rootGroup: THREE.Group;
  frontLeftSteerPivot: THREE.Group;
  frontRightSteerPivot: THREE.Group;
  wheels: THREE.Mesh[];
  steeringWheelGroup: THREE.Group;
  underglowLight: THREE.PointLight;
  headlights: THREE.SpotLight[];
  exhaustTipPosition: THREE.Vector3;
  updateMaterials: (config: KartConfig) => void;
  rebuildModularParts: (config: KartConfig) => void;
  rebuildWheelsAndCockpit: (config: KartConfig) => void;
}

export function buildGoKart(initialConfig: KartConfig): KartMeshHandles {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'GoKartRoot';

  // Common textures
  const twillCarbonTexture = createCarbonTexture();
  const forgedCarbonTexture = createForgedCarbonTexture();
  const brushedMetalTexture = createBrushedMetalTexture();
  const brakeDiscTexture = createBrakeDiscTexture();
  let tireTexture = createTireTexture(initialConfig.tireType);
  let numberTexture = createNumberDecalTexture(initialConfig.raceNumber, initialConfig.bodyColor);

  // Materials dictionary
  const materials = {
    chassisSteel: new THREE.MeshStandardMaterial({
      color: 0x111113,
      metalness: 0.85,
      roughness: 0.25,
    }),
    floorPan: new THREE.MeshStandardMaterial({
      color: 0x181920,
      map: twillCarbonTexture,
      metalness: 0.4,
      roughness: 0.35,
    }),
    bodyPaint: new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialConfig.bodyColor),
      metalness: 0.4,
      roughness: 0.2,
    }),
    accentPaint: new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialConfig.accentColor),
      metalness: 0.6,
      roughness: 0.25,
    }),
    carbonFiber: new THREE.MeshStandardMaterial({
      color: 0x1a1a1e,
      map: twillCarbonTexture,
      roughness: 0.32,
      metalness: 0.3,
    }),
    forgedCarbon: new THREE.MeshStandardMaterial({
      color: 0x18181c,
      map: forgedCarbonTexture,
      roughness: 0.26,
      metalness: 0.25,
    }),
    tireRubber: new THREE.MeshStandardMaterial({
      color: 0x222225,
      roughness: 0.85,
      metalness: 0.05,
      map: tireTexture,
    }),
    rimMetal: new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialConfig.rimColor),
      metalness: 0.92,
      roughness: 0.18,
    }),
    caliperMetal: new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialConfig.caliperColor),
      metalness: 0.75,
      roughness: 0.25,
    }),
    brakeRotor: new THREE.MeshStandardMaterial({
      color: 0xd1d5db,
      map: brakeDiscTexture,
      metalness: 0.95,
      roughness: 0.2,
    }),
    chrome: new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.98,
      roughness: 0.05,
    }),
    titaniumHeatTreated: new THREE.MeshStandardMaterial({
      color: 0x5b21b6, // Iridescent purple/blue heat treated
      metalness: 0.95,
      roughness: 0.12,
    }),
    seatFabric: new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.85,
      metalness: 0.05,
    }),
    numberDecal: new THREE.MeshBasicMaterial({
      map: numberTexture,
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
    headlightGlass: new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialConfig.headlightColor),
      emissive: new THREE.Color(initialConfig.headlightColor),
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.2,
    }),
    underglowStrip: new THREE.MeshBasicMaterial({
      color: getUnderglowColorHex(initialConfig.underglow),
    }),
  };

  // Reusable chassis tube material
  const tubeMat = materials.chassisSteel;

  // 1. TUBULAR CHASSIS FRAME
  const chassisGroup = new THREE.Group();
  chassisGroup.name = 'ChassisFrame';

  // Main longitudinal tubes (left & right rails)
  const mainRailGeo = new THREE.CylinderGeometry(0.024, 0.024, 1.8, 12);
  mainRailGeo.rotateX(Math.PI / 2);

  const leftRail = new THREE.Mesh(mainRailGeo, tubeMat);
  leftRail.position.set(-0.35, 0.16, 0);
  leftRail.castShadow = true;
  chassisGroup.add(leftRail);

  const rightRail = new THREE.Mesh(mainRailGeo, tubeMat);
  rightRail.position.set(0.35, 0.16, 0);
  rightRail.castShadow = true;
  chassisGroup.add(rightRail);

  // Cross members
  const crossGeo = new THREE.CylinderGeometry(0.022, 0.022, 0.7, 12);
  crossGeo.rotateZ(Math.PI / 2);

  const frontCross = new THREE.Mesh(crossGeo, tubeMat);
  frontCross.position.set(0, 0.16, 0.7);
  chassisGroup.add(frontCross);

  const midCross = new THREE.Mesh(crossGeo, tubeMat);
  midCross.position.set(0, 0.16, 0.1);
  chassisGroup.add(midCross);

  const rearCross = new THREE.Mesh(crossGeo, tubeMat);
  rearCross.position.set(0, 0.16, -0.75);
  chassisGroup.add(rearCross);

  // Carbon underbody ground effect floor tray
  const floorPanGeo = new THREE.BoxGeometry(0.78, 0.015, 1.45);
  const floorPan = new THREE.Mesh(floorPanGeo, materials.floorPan);
  floorPan.position.set(0, 0.12, 0.12);
  floorPan.receiveShadow = true;
  chassisGroup.add(floorPan);

  rootGroup.add(chassisGroup);

  // 2. MODULAR GROUPS
  const bodyGroup = new THREE.Group();
  bodyGroup.name = 'BodyworkGroup';
  rootGroup.add(bodyGroup);

  const engineGroup = new THREE.Group();
  engineGroup.name = 'EngineGroup';
  rootGroup.add(engineGroup);

  const wingGroup = new THREE.Group();
  wingGroup.name = 'WingGroup';
  rootGroup.add(wingGroup);

  const exhaustGroup = new THREE.Group();
  exhaustGroup.name = 'ExhaustGroup';
  rootGroup.add(exhaustGroup);

  const cockpitGroup = new THREE.Group();
  cockpitGroup.name = 'CockpitGroup';
  rootGroup.add(cockpitGroup);

  const steeringWheelGroup = new THREE.Group();
  steeringWheelGroup.name = 'SteeringWheelGroup';

  // 3. WHEELS & SUSPENSION/AXLES
  const frontLeftSteerPivot = new THREE.Group();
  frontLeftSteerPivot.name = 'FLSteerPivot';
  rootGroup.add(frontLeftSteerPivot);

  const frontRightSteerPivot = new THREE.Group();
  frontRightSteerPivot.name = 'FRSteerPivot';
  rootGroup.add(frontRightSteerPivot);

  const rearAxleGroup = new THREE.Group();
  rearAxleGroup.name = 'RearAxleGroup';
  rearAxleGroup.position.set(0, 0.16, -0.68);
  rootGroup.add(rearAxleGroup);

  const wheels: THREE.Mesh[] = [];

  // 4. LIGHTING & UNDERGLOW
  const headlights: THREE.SpotLight[] = [];

  const leftHeadlight = new THREE.SpotLight(new THREE.Color(initialConfig.headlightColor), 3.5, 14, Math.PI / 6, 0.4);
  leftHeadlight.position.set(-0.25, 0.28, 0.95);
  leftHeadlight.target.position.set(-0.25, 0, 4);
  rootGroup.add(leftHeadlight);
  rootGroup.add(leftHeadlight.target);
  headlights.push(leftHeadlight);

  const rightHeadlight = new THREE.SpotLight(new THREE.Color(initialConfig.headlightColor), 3.5, 14, Math.PI / 6, 0.4);
  rightHeadlight.position.set(0.25, 0.28, 0.95);
  rightHeadlight.target.position.set(0.25, 0, 4);
  rootGroup.add(rightHeadlight);
  rootGroup.add(rightHeadlight.target);
  headlights.push(rightHeadlight);

  const underglowLight = new THREE.PointLight(getUnderglowColorHex(initialConfig.underglow), 2.5, 3.2);
  underglowLight.position.set(0, 0.05, 0);
  rootGroup.add(underglowLight);

  const underglowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.85, 1.7),
    new THREE.MeshBasicMaterial({
      color: getUnderglowColorHex(initialConfig.underglow),
      transparent: true,
      opacity: initialConfig.underglow === 'none' ? 0 : 0.45,
      depthWrite: false,
    })
  );
  underglowPlane.rotation.x = -Math.PI / 2;
  underglowPlane.position.set(0, 0.02, 0);
  rootGroup.add(underglowPlane);

  const exhaustTipPosition = new THREE.Vector3(0, 0.32, -1.05);

  // Wheel Dimensions calculation helper
  function getWheelDimensions(wheelSize: string, tireWidth: string) {
    let frontRadius = 0.18;
    let rearRadius = 0.21;
    let frontWidth = 0.15;
    let rearWidth = 0.24;
    let rimRatio = 0.62;

    if (wheelSize === 'lowprofile_6in') {
      frontRadius = 0.20;
      rearRadius = 0.23;
      rimRatio = 0.74; // large F1 alloy center
    } else if (wheelSize === 'oversized_7in') {
      frontRadius = 0.22;
      rearRadius = 0.25;
      rimRatio = 0.80; // huge deep dish stance
    } else if (wheelSize === 'chunky_dirt') {
      frontRadius = 0.22;
      rearRadius = 0.25;
      frontWidth = 0.18;
      rearWidth = 0.26;
      rimRatio = 0.55; // thick knobby tire
    }

    if (tireWidth === 'staggered_f1') {
      rearWidth *= 1.35; // massive F1 rear slicks
      frontWidth *= 1.08;
    } else if (tireWidth === 'drift_flush') {
      rearWidth = frontWidth * 1.1;
    }

    return { frontRadius, rearRadius, frontWidth, rearWidth, rimRatio };
  }

  // BUILD WHEEL HELPER
  function buildSingleWheel(
    isFront: boolean,
    isLeft: boolean,
    radius: number,
    width: number,
    rimRatio: number,
    rimStyle: string
  ) {
    const wheelGroup = new THREE.Group();
    const rimRadius = radius * rimRatio;

    // Tire mesh
    const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, materials.tireRubber);
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);
    wheels.push(tireMesh);

    // Rim inner cylinder
    const rimGeo = new THREE.CylinderGeometry(rimRadius, rimRadius, width + 0.005, 20);
    rimGeo.rotateZ(Math.PI / 2);
    const rimMesh = new THREE.Mesh(rimGeo, materials.rimMetal);
    wheelGroup.add(rimMesh);

    // Rim Face Detail
    const rimFaceGroup = new THREE.Group();
    rimFaceGroup.position.x = (isLeft ? -1 : 1) * (width / 2 + 0.004);

    // Outer Rim Beadlock Lip Ring
    const rimLip = new THREE.Mesh(
      new THREE.TorusGeometry(rimRadius * 0.94, 0.012, 8, 24),
      materials.rimMetal
    );
    rimLip.rotation.y = Math.PI / 2;
    rimFaceGroup.add(rimLip);

    if (rimStyle === 'carbon_dish') {
      const dish = new THREE.Mesh(
        new THREE.CircleGeometry(rimRadius * 0.95, 20),
        materials.forgedCarbon
      );
      dish.rotation.y = isLeft ? -Math.PI / 2 : Math.PI / 2;
      rimFaceGroup.add(dish);
    } else if (rimStyle === 'bbs_mesh') {
      // F1 Centerlock BBS Mesh
      for (let i = 0; i < 8; i++) {
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.014, rimRadius * 1.82, 0.014),
          materials.rimMetal
        );
        spoke.rotation.x = (i * Math.PI) / 8;
        rimFaceGroup.add(spoke);
      }
    } else if (rimStyle === 'turbofan') {
      for (let i = 0; i < 10; i++) {
        const vane = new THREE.Mesh(
          new THREE.BoxGeometry(0.015, rimRadius * 0.8, 0.03),
          materials.rimMetal
        );
        const ang = (i * Math.PI * 2) / 10;
        vane.position.set(0, Math.sin(ang) * rimRadius * 0.45, Math.cos(ang) * rimRadius * 0.45);
        vane.rotation.x = -ang + 0.4;
        rimFaceGroup.add(vane);
      }
    } else {
      // 5-Spoke Split
      for (let i = 0; i < 5; i++) {
        const spoke = new THREE.Mesh(
          new THREE.BoxGeometry(0.02, rimRadius * 0.88, 0.022),
          materials.rimMetal
        );
        const ang = (i * Math.PI * 2) / 5;
        spoke.position.set(0, Math.sin(ang) * rimRadius * 0.42, Math.cos(ang) * rimRadius * 0.42);
        spoke.rotation.x = -ang;
        rimFaceGroup.add(spoke);
      }
    }

    // F1 Red / Blue Anodized Centerlock Wheel Nut
    const centerNut = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.035, 8),
      materials.caliperMetal
    );
    centerNut.rotation.z = Math.PI / 2;
    rimFaceGroup.add(centerNut);

    wheelGroup.add(rimFaceGroup);

    // Brake Rotor & Caliper (inside wheel)
    const rotorGeo = new THREE.CylinderGeometry(rimRadius * 0.78, rimRadius * 0.78, 0.012, 16);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotor = new THREE.Mesh(rotorGeo, materials.brakeRotor);
    rotor.position.x = (isLeft ? 1 : -1) * 0.04;
    wheelGroup.add(rotor);

    const caliper = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, 0.065, 0.09),
      materials.caliperMetal
    );
    caliper.position.set((isLeft ? 1 : -1) * 0.04, rimRadius * 0.48, 0);
    wheelGroup.add(caliper);

    return wheelGroup;
  }

  // REBUILD WHEELS & COCKPIT (Called when wheel size, rims, steering, seat changes)
  function rebuildWheelsAndCockpit(cfg: KartConfig) {
    // 1. Clear wheel pivots
    while (frontLeftSteerPivot.children.length > 0) frontLeftSteerPivot.remove(frontLeftSteerPivot.children[0]);
    while (frontRightSteerPivot.children.length > 0) frontRightSteerPivot.remove(frontRightSteerPivot.children[0]);
    while (rearAxleGroup.children.length > 0) rearAxleGroup.remove(rearAxleGroup.children[0]);
    wheels.length = 0;

    const { frontRadius, rearRadius, frontWidth, rearWidth, rimRatio } = getWheelDimensions(cfg.wheelSize, cfg.tireWidth);

    frontLeftSteerPivot.position.set(-0.54, frontRadius, 0.68);
    frontRightSteerPivot.position.set(0.54, frontRadius, 0.68);
    rearAxleGroup.position.set(0, rearRadius, -0.68);

    // Front Left
    const flWheel = buildSingleWheel(true, true, frontRadius, frontWidth, rimRatio, cfg.rimStyle);
    frontLeftSteerPivot.add(flWheel);

    // Front Right
    const frWheel = buildSingleWheel(true, false, frontRadius, frontWidth, rimRatio, cfg.rimStyle);
    frontRightSteerPivot.add(frWheel);

    // Rear Solid Live Axle
    const axleBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 1.4, 12),
      materials.chrome
    );
    axleBar.rotation.z = Math.PI / 2;
    rearAxleGroup.add(axleBar);

    // Rear Left (spaced based on tire width)
    const rlWheel = buildSingleWheel(false, true, rearRadius, rearWidth, rimRatio, cfg.rimStyle);
    rlWheel.position.set(-0.62 - rearWidth * 0.25, 0, 0);
    rearAxleGroup.add(rlWheel);

    // Rear Right
    const rrWheel = buildSingleWheel(false, false, rearRadius, rearWidth, rimRatio, cfg.rimStyle);
    rrWheel.position.set(0.62 + rearWidth * 0.25, 0, 0);
    rearAxleGroup.add(rrWheel);

    // 2. Clear & rebuild Cockpit (Seat + Steering Kit)
    while (cockpitGroup.children.length > 0) cockpitGroup.remove(cockpitGroup.children[0]);
    while (steeringWheelGroup.children.length > 0) steeringWheelGroup.remove(steeringWheelGroup.children[0]);

    // Cockpit Seat
    const seatGroup = new THREE.Group();
    if (cfg.seatKit === 'f1_carbon_monocoque') {
      // Reclined F1 carbon tub monocoque seating
      const tub = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.05, 0.52), materials.forgedCarbon);
      tub.position.set(0, 0.2, -0.16);
      seatGroup.add(tub);

      const tubBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.05), materials.forgedCarbon);
      tubBack.position.set(0, 0.44, -0.42);
      tubBack.rotation.x = 0.38; // deep F1 recline
      seatGroup.add(tubBack);

      // Ergonomic headrest support
      const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.18, 0.08), materials.seatFabric);
      headrest.position.set(0, 0.68, -0.48);
      seatGroup.add(headrest);
    } else if (cfg.seatKit === 'fia_padded_bucket') {
      // Deep winged FIA bucket with high rib and shoulder protection
      const bottom = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.08, 0.44), materials.seatFabric);
      bottom.position.set(0, 0.22, -0.15);
      seatGroup.add(bottom);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.58, 0.06), materials.seatFabric);
      back.position.set(0, 0.48, -0.38);
      back.rotation.x = 0.28;
      seatGroup.add(back);

      // High wrap-around shoulder bolsters
      const bolsterL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.34), materials.seatFabric);
      bolsterL.position.set(-0.23, 0.42, -0.26);
      seatGroup.add(bolsterL);

      const bolsterR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.34), materials.seatFabric);
      bolsterR.position.set(0.23, 0.42, -0.26);
      seatGroup.add(bolsterR);
    } else {
      // Alcantara Diamond or Poly
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.44), materials.seatFabric);
      base.position.set(0, 0.22, -0.15);
      seatGroup.add(base);

      const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.54, 0.05), materials.seatFabric);
      back.position.set(0, 0.46, -0.38);
      back.rotation.x = 0.28;
      seatGroup.add(back);
    }

    // 5-Point Racing Harness Straps
    const strapMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.8 });
    const s1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.01), strapMat);
    s1.position.set(-0.1, 0.46, -0.34);
    s1.rotation.x = 0.28;
    seatGroup.add(s1);

    const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.01), strapMat);
    s2.position.set(0.1, 0.46, -0.34);
    s2.rotation.x = 0.28;
    seatGroup.add(s2);

    cockpitGroup.add(seatGroup);

    // Steering Column & Chosen Steering Kit
    const column = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.55, 8), tubeMat);
    column.rotation.x = -0.68;
    column.position.set(0, 0.38, 0.38);
    cockpitGroup.add(column);

    steeringWheelGroup.position.set(0, 0.56, 0.24);
    steeringWheelGroup.rotation.x = 0.68;

    if (cfg.steeringKit === 'f1_oled_yoke') {
      // Formula 1 Multi-Function Carbon Yoke Wheel with OLED Display
      const yokeBody = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.02), materials.forgedCarbon);
      steeringWheelGroup.add(yokeBody);

      // OLED live display in center
      const oled = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.07, 0.005),
        new THREE.MeshBasicMaterial({ color: 0x00ffcc })
      );
      oled.position.set(0, 0.03, 0.013);
      steeringWheelGroup.add(oled);

      // Rotary switch dials (F1 differential & engine mode switches)
      for (let i = -2; i <= 2; i++) {
        const dial = new THREE.Mesh(
          new THREE.CylinderGeometry(0.012, 0.012, 0.015, 8),
          i === 0 ? materials.caliperMetal : materials.chrome
        );
        dial.rotation.x = Math.PI / 2;
        dial.position.set(i * 0.03, -0.04, 0.015);
        steeringWheelGroup.add(dial);
      }

      // Alcantara Hand Grips on left and right
      const gripL = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 10), materials.seatFabric);
      gripL.position.set(-0.16, 0, 0);
      steeringWheelGroup.add(gripL);

      const gripR = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.18, 10), materials.seatFabric);
      gripR.position.set(0.16, 0, 0);
      steeringWheelGroup.add(gripR);
    } else if (cfg.steeringKit === 'd_cut_alcantara') {
      // D-Cut Wheel
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.016, 8, 24, Math.PI * 1.6), materials.seatFabric);
      rim.rotation.z = Math.PI * 0.2;
      steeringWheelGroup.add(rim);

      const flatBottom = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.02), materials.seatFabric);
      flatBottom.position.set(0, -0.12, 0);
      steeringWheelGroup.add(flatBottom);

      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12), materials.carbonFiber);
      hub.rotation.x = Math.PI / 2;
      steeringWheelGroup.add(hub);
    } else {
      // butterfly_race / open yoke
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12), materials.carbonFiber);
      hub.rotation.x = Math.PI / 2;
      steeringWheelGroup.add(hub);

      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.025, 0.01), materials.carbonFiber);
      steeringWheelGroup.add(spoke);

      const gripL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), materials.seatFabric);
      gripL.position.set(-0.15, 0, 0);
      steeringWheelGroup.add(gripL);

      const gripR = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 8), materials.seatFabric);
      gripR.position.set(0.15, 0, 0);
      steeringWheelGroup.add(gripR);
    }

    cockpitGroup.add(steeringWheelGroup);

    // Pedals
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.01), materials.chrome);
    p1.position.set(-0.12, 0.22, 0.72);
    p1.rotation.x = -0.4;
    cockpitGroup.add(p1);

    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.01), materials.chrome);
    p2.position.set(0.12, 0.22, 0.72);
    p2.rotation.x = -0.4;
    cockpitGroup.add(p2);
  }

  // REBUILD MODULAR BODYWORK (Major F1 Bodykit, Sidepods, Halo, Wings, Engine, Exhaust)
  function rebuildModularParts(cfg: KartConfig) {
    // 1. Clear previous bodywork
    while (bodyGroup.children.length > 0) bodyGroup.remove(bodyGroup.children[0]);
    while (wingGroup.children.length > 0) wingGroup.remove(wingGroup.children[0]);
    while (engineGroup.children.length > 0) engineGroup.remove(engineGroup.children[0]);
    while (exhaustGroup.children.length > 0) exhaustGroup.remove(exhaustGroup.children[0]);

    // Choose bodykit aero material
    const aeroMat = cfg.material === 'forged_carbon' ? materials.forgedCarbon : materials.bodyPaint;

    // A. NOSECONE & FRONT WINGS (Formula 1 Inspired Multi-Tier Wing Assemblies)
    const noseGroup = new THREE.Group();
    noseGroup.name = 'FrontAeroAssembly';

    if (cfg.bodykit === 'f1_grand_prix') {
      // FORMULA 1 GRAND PRIX NOSE & MULTI-ELEMENT CASCADE WING
      // Stepped F1 high-nosecone extending forward over front axle
      const f1Nose = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.95), aeroMat);
      f1Nose.position.set(0, 0.26, 0.92);
      f1Nose.rotation.x = -0.22;
      noseGroup.add(f1Nose);

      // F1 Main Front Wing Plane (full width across front wheels)
      const mainWing = new THREE.Mesh(new THREE.BoxGeometry(1.22, 0.025, 0.32), materials.carbonFiber);
      mainWing.position.set(0, 0.11, 1.25);
      noseGroup.add(mainWing);

      // Upper Cascade Flap Elements
      const upperFlap = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.02, 0.16), aeroMat);
      upperFlap.position.set(0, 0.16, 1.18);
      upperFlap.rotation.x = 0.18;
      noseGroup.add(upperFlap);

      // F1 Front Wing Endplates with curved vortex tunnels
      const endplateL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.18, 0.42), materials.carbonFiber);
      endplateL.position.set(-0.61, 0.16, 1.22);
      noseGroup.add(endplateL);

      const endplateR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.18, 0.42), materials.carbonFiber);
      endplateR.position.set(0.61, 0.16, 1.22);
      noseGroup.add(endplateR);

      // Front Chassis S-Duct inlet
      const sDuct = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.14), materials.carbonFiber);
      sDuct.position.set(0, 0.31, 0.65);
      noseGroup.add(sDuct);
    } else if (cfg.bodykit === 'f1_ground_effect') {
      // 2026 Ground Effect Swept Aero Nose
      const nose = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.85, 4), aeroMat);
      nose.rotation.x = Math.PI / 2;
      nose.rotation.y = Math.PI / 4;
      nose.position.set(0, 0.22, 0.92);
      noseGroup.add(nose);

      // Swept front delta wings
      const deltaWing = new THREE.Mesh(new THREE.BoxGeometry(1.16, 0.025, 0.38), materials.carbonFiber);
      deltaWing.position.set(0, 0.11, 1.15);
      noseGroup.add(deltaWing);

      // Vertical vortex strakes under nose
      for (let i = -2; i <= 2; i++) {
        if (i === 0) continue;
        const strake = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.06, 0.28), materials.carbonFiber);
        strake.position.set(i * 0.15, 0.08, 1.15);
        noseGroup.add(strake);
      }
    } else if (cfg.bodykit === 'street_brawler') {
      // Aggressive Box Brawler with chin splitter & canards
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.16, 0.62), aeroMat);
      nose.position.set(0, 0.22, 0.88);
      nose.rotation.x = -0.15;
      noseGroup.add(nose);

      const splitter = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.025, 0.45), materials.carbonFiber);
      splitter.position.set(0, 0.12, 1.05);
      noseGroup.add(splitter);

      // Side canards
      const cL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.01), materials.carbonFiber);
      cL.position.set(-0.38, 0.24, 0.98);
      cL.rotation.y = 0.4;
      noseGroup.add(cL);

      const cR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.01), materials.carbonFiber);
      cR.position.set(0.38, 0.24, 0.98);
      cR.rotation.y = -0.4;
      noseGroup.add(cR);
    } else {
      // Cyber GP
      const nose = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.14, 0.65), aeroMat);
      nose.position.set(0, 0.22, 0.86);
      nose.rotation.x = -0.22;
      noseGroup.add(nose);

      const aeroTray = new THREE.Mesh(new THREE.BoxGeometry(0.88, 0.02, 0.48), materials.carbonFiber);
      aeroTray.position.set(0, 0.12, 0.98);
      noseGroup.add(aeroTray);
    }

    // Number plate on front nose
    const numPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.24), materials.numberDecal);
    numPlate.position.set(0, 0.32, 0.92);
    numPlate.rotation.x = -0.55;
    noseGroup.add(numPlate);

    // Projector Headlights
    const hlGeo = new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12);
    hlGeo.rotateX(Math.PI / 2);
    const hlL = new THREE.Mesh(hlGeo, materials.headlightGlass);
    hlL.position.set(-0.24, 0.26, 1.12);
    noseGroup.add(hlL);

    const hlR = new THREE.Mesh(hlGeo, materials.headlightGlass);
    hlR.position.set(0.24, 0.26, 1.12);
    noseGroup.add(hlR);

    bodyGroup.add(noseGroup);

    // B. RADICAL F1 SCULPTED SIDEPODS & AERODYNAMICS
    // Distinct sidepods designed specifically per bodykit!
    const createSidepod = (isLeft: boolean) => {
      const sign = isLeft ? -1 : 1;
      const podGroup = new THREE.Group();

      if (cfg.bodykit === 'f1_grand_prix') {
        // F1 Deep Undercut Sculpted Sidepod with Top Louvres
        // Main sculpted pod
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.98), aeroMat);
        pod.position.set(sign * 0.54, 0.24, -0.05);
        podGroup.add(pod);

        // Undercut intake mouth channel
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.18, 0.22), materials.carbonFiber);
        mouth.position.set(sign * 0.54, 0.24, 0.38);
        mouth.rotation.x = -0.15;
        podGroup.add(mouth);

        // F1 Bargeboard flow conditioner vane
        const bargeboard = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.28, 0.44), materials.carbonFiber);
        bargeboard.position.set(sign * 0.69, 0.22, 0.25);
        bargeboard.rotation.y = sign * 0.12;
        podGroup.add(bargeboard);

        // Cooling louvres on top surface
        for (let i = 0; i < 5; i++) {
          const louvre = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.01, 0.03), materials.carbonFiber);
          louvre.position.set(sign * 0.54, 0.38, -0.2 + i * 0.06);
          louvre.rotation.x = 0.35;
          podGroup.add(louvre);
        }

        // Side Livery Stripe
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.04, 0.88), materials.accentPaint);
        stripe.position.set(sign * 0.685, 0.24, -0.08);
        podGroup.add(stripe);
      } else if (cfg.bodykit === 'f1_ground_effect') {
        // Downwash Ramp Sidepod
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.24, 0.96), aeroMat);
        pod.position.set(sign * 0.52, 0.22, -0.05);
        pod.rotation.x = -0.1;
        podGroup.add(pod);

        // Ground effect edge winglet / floor skid
        const edgeWing = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.015, 0.92), materials.carbonFiber);
        edgeWing.position.set(sign * 0.66, 0.12, -0.05);
        podGroup.add(edgeWing);
      } else if (cfg.bodykit === 'street_brawler') {
        // Wide aggressive box sidepod with heat vents
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.95), aeroMat);
        pod.position.set(sign * 0.54, 0.22, 0.0);
        podGroup.add(pod);

        const vent = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.12, 0.3), materials.carbonFiber);
        vent.position.set(sign * 0.695, 0.22, 0.15);
        podGroup.add(vent);
      } else {
        // Cyber GP - Pontoon Pod with hollow air tunnel
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.22, 0.94), aeroMat);
        pod.position.set(sign * 0.52, 0.22, 0.0);
        podGroup.add(pod);

        const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.94, 8), materials.carbonFiber);
        tunnel.rotation.x = Math.PI / 2;
        tunnel.position.set(sign * 0.52, 0.22, 0.0);
        podGroup.add(tunnel);
      }

      // Side number decal
      const sideNum = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.18), materials.numberDecal);
      sideNum.position.set(sign * 0.686, 0.24, -0.15);
      sideNum.rotation.y = isLeft ? -Math.PI / 2 : Math.PI / 2;
      podGroup.add(sideNum);

      return podGroup;
    };

    bodyGroup.add(createSidepod(true));
    bodyGroup.add(createSidepod(false));

    // C. FORMULA 1 COCKPIT HALO, AIRBOX SCOOP & SHARK FIN ENGINE COVER
    if (cfg.bodykit === 'f1_grand_prix' || cfg.bodykit === 'f1_ground_effect') {
      const f1CockpitAero = new THREE.Group();

      // F1 HALO Safety Cockpit Ring
      const haloMat = materials.forgedCarbon;
      const centerPylon = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.34, 10), haloMat);
      centerPylon.position.set(0, 0.44, 0.32);
      f1CockpitAero.add(centerPylon);

      const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.018, 8, 20, Math.PI), haloMat);
      haloRing.rotation.x = Math.PI / 2;
      haloRing.position.set(0, 0.58, 0.08);
      f1CockpitAero.add(haloRing);

      // F1 High Airbox Roof Scoop & T-Cam above driver
      const airbox = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.24, 0.42), aeroMat);
      airbox.position.set(0, 0.76, -0.32);
      f1CockpitAero.add(airbox);

      // Air intake mouth opening
      const airMouth = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 12), materials.carbonFiber);
      airMouth.rotation.x = Math.PI / 2;
      airMouth.position.set(0, 0.78, -0.1);
      f1CockpitAero.add(airMouth);

      // T-Cam broadcasting pod (Yellow/Black F1 camera)
      const tCam = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), new THREE.MeshBasicMaterial({ color: 0xeab308 }));
      tCam.position.set(0, 0.89, -0.28);
      f1CockpitAero.add(tCam);

      // F1 Shark Fin Dorsal Spine connecting airbox to rear wing
      const sharkFin = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.28, 0.52), materials.forgedCarbon);
      sharkFin.position.set(0, 0.68, -0.58);
      f1CockpitAero.add(sharkFin);

      bodyGroup.add(f1CockpitAero);
    } else if (cfg.bodykit === 'street_brawler') {
      // Tubular Roll Cage Hoops
      const cageGroup = new THREE.Group();
      const mainHoop = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.02, 8, 16, Math.PI), materials.chassisSteel);
      mainHoop.position.set(0, 0.55, -0.35);
      cageGroup.add(mainHoop);

      const stayL = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 8), materials.chassisSteel);
      stayL.position.set(-0.25, 0.45, -0.55);
      stayL.rotation.x = -0.5;
      cageGroup.add(stayL);

      const stayR = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 8), materials.chassisSteel);
      stayR.position.set(0.25, 0.45, -0.55);
      stayR.rotation.x = -0.5;
      cageGroup.add(stayR);

      bodyGroup.add(cageGroup);
    }

    // D. REAR WINGS (F1 DRS Wing, Sprint Vortex, GT Carbon, Ducktail)
    if (cfg.rearWing === 'f1_drs_wing') {
      // FORMULA 1 DRS DUAL-ELEMENT HIGH-DOWNFORCE REAR WING
      const rwGroup = new THREE.Group();

      // Twin Swan-Neck Aluminum Uprights
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.52, 0.08), materials.forgedCarbon);
      p1.position.set(-0.24, 0.52, -0.82);
      p1.rotation.x = -0.15;
      rwGroup.add(p1);

      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.52, 0.08), materials.forgedCarbon);
      p2.position.set(0.24, 0.52, -0.82);
      p2.rotation.x = -0.15;
      rwGroup.add(p2);

      // Main F1 Lower Wing Element
      const mainWing = new THREE.Mesh(new THREE.BoxGeometry(1.12, 0.03, 0.34), materials.forgedCarbon);
      mainWing.position.set(0, 0.74, -0.86);
      rwGroup.add(mainWing);

      // Upper DRS Flap (Adjustable)
      const drsFlap = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.02, 0.16), aeroMat);
      drsFlap.position.set(0, 0.82, -0.94);
      drsFlap.rotation.x = 0.22;
      rwGroup.add(drsFlap);

      // DRS Hydraulic Actuator Pod in center
      const drsPod = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.08), materials.chrome);
      drsPod.position.set(0, 0.78, -0.88);
      rwGroup.add(drsPod);

      // F1 Vertical Endplates with Aerodynamic Louvres
      const epL = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.32, 0.42), materials.forgedCarbon);
      epL.position.set(-0.56, 0.74, -0.86);
      rwGroup.add(epL);

      const epR = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.32, 0.42), materials.forgedCarbon);
      epR.position.set(0.56, 0.74, -0.86);
      rwGroup.add(epR);

      // Lower F1 Beam Wing just above diffuser
      const beamWing = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 0.16), materials.forgedCarbon);
      beamWing.position.set(0, 0.36, -0.9);
      rwGroup.add(beamWing);

      wingGroup.add(rwGroup);
    } else if (cfg.rearWing === 'sprint_vortex') {
      const rwGroup = new THREE.Group();
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.46, 0.1), materials.carbonFiber);
      p1.position.set(-0.28, 0.48, -0.8);
      rwGroup.add(p1);

      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.46, 0.1), materials.carbonFiber);
      p2.position.set(0.28, 0.48, -0.8);
      rwGroup.add(p2);

      const wingMain = new THREE.Mesh(new THREE.BoxGeometry(1.08, 0.03, 0.28), materials.carbonFiber);
      wingMain.position.set(0, 0.72, -0.84);
      rwGroup.add(wingMain);

      const epL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.24, 0.36), materials.accentPaint);
      epL.position.set(-0.54, 0.72, -0.86);
      rwGroup.add(epL);

      const epR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.24, 0.36), materials.accentPaint);
      epR.position.set(0.54, 0.72, -0.86);
      rwGroup.add(epR);

      wingGroup.add(rwGroup);
    } else if (cfg.rearWing === 'gt_carbon') {
      const rwGroup = new THREE.Group();
      const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 0.08), materials.carbonFiber);
      p1.position.set(-0.25, 0.42, -0.82);
      rwGroup.add(p1);

      const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.38, 0.08), materials.carbonFiber);
      p2.position.set(0.25, 0.42, -0.82);
      rwGroup.add(p2);

      const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.025, 0.26), materials.carbonFiber);
      wingBlade.position.set(0, 0.62, -0.88);
      rwGroup.add(wingBlade);

      const epL = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.16, 0.28), aeroMat);
      epL.position.set(-0.48, 0.62, -0.88);
      rwGroup.add(epL);

      const epR = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.16, 0.28), aeroMat);
      epR.position.set(0.48, 0.62, -0.88);
      rwGroup.add(epR);

      wingGroup.add(rwGroup);
    } else if (cfg.rearWing === 'ducktail') {
      const ducktail = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.1, 0.14), aeroMat);
      ducktail.position.set(0, 0.32, -0.84);
      ducktail.rotation.x = 0.45;
      wingGroup.add(ducktail);
    }

    // E. ENGINE POWERTRAINS (F1 Turbo-Hybrid, Petrol 250 Twin, Big Bore 420, 25kW Electric, Diesel)
    if (cfg.engine === 'f1_turbo_hybrid') {
      // F1 TURBO-HYBRID V-TWIN + ERS KERS MOTOR + BATTERY PACK
      const hyGroup = new THREE.Group();

      // V-Twin Engine Block with Red Anodized Heads
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.32), materials.chassisSteel);
      block.position.set(0.24, 0.28, -0.35);
      hyGroup.add(block);

      const head1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), materials.caliperMetal);
      head1.position.set(0.18, 0.44, -0.42);
      head1.rotation.z = -0.25;
      hyGroup.add(head1);

      const head2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.18), materials.caliperMetal);
      head2.position.set(0.3, 0.44, -0.28);
      head2.rotation.z = 0.25;
      hyGroup.add(head2);

      // Large Ceramic Turbocharger Snail
      const turbo = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.035, 8, 16), materials.chrome);
      turbo.position.set(0.38, 0.38, -0.48);
      turbo.rotation.y = Math.PI / 2;
      hyGroup.add(turbo);

      // MGU-K Electric Kinetic Recovery Generator on axle
      const mguk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 12), materials.rimMetal);
      mguk.rotation.z = Math.PI / 2;
      mguk.position.set(0.16, 0.18, -0.66);
      hyGroup.add(mguk);

      // Orange High Voltage Conduit cables
      const cableMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.5 });
      for (let i = 0; i < 2; i++) {
        const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.35, 8), cableMat);
        cable.position.set(0.24 + i * 0.04, 0.26, -0.52);
        cable.rotation.x = Math.PI / 4;
        hyGroup.add(cable);
      }

      // 96V Liquid Cooled Lithium Energy Storage Pack
      const batteryBox = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.16, 0.28), materials.forgedCarbon);
      batteryBox.position.set(-0.24, 0.22, -0.32);
      hyGroup.add(batteryBox);

      engineGroup.add(hyGroup);
    } else if (cfg.engine === 'electric_flux_25kw') {
      // PURE 25KW DUAL FLUX EV MOTOR
      const evGroup = new THREE.Group();

      const batteryBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.42), materials.forgedCarbon);
      batteryBox.position.set(0, 0.25, -0.32);
      evGroup.add(batteryBox);

      const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.32, 16), materials.rimMetal);
      motor.rotation.z = Math.PI / 2;
      motor.position.set(0, 0.18, -0.66);
      evGroup.add(motor);

      // Heavy orange power busbars
      const busbarMat = new THREE.MeshStandardMaterial({ color: 0xff6600 });
      for (let i = -1; i <= 1; i++) {
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.3, 8), busbarMat);
        bar.position.set(i * 0.08, 0.22, -0.5);
        bar.rotation.x = Math.PI / 4;
        evGroup.add(bar);
      }

      engineGroup.add(evGroup);
    } else if (cfg.engine === 'petrol_screamer_250') {
      // 250CC 2-STROKE TWIN RACING ENGINE
      const pGroup = new THREE.Group();

      const block = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.28), materials.chassisSteel);
      block.position.set(0.24, 0.26, -0.35);
      pGroup.add(block);

      // Twin velocity stack air trumpets
      const v1 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 12), materials.chrome);
      v1.rotation.z = Math.PI / 2;
      v1.position.set(0.08, 0.36, -0.42);
      pGroup.add(v1);

      const v2 = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.12, 12), materials.chrome);
      v2.rotation.z = Math.PI / 2;
      v2.position.set(0.08, 0.36, -0.28);
      pGroup.add(v2);

      engineGroup.add(pGroup);
    } else {
      // Petrol 420 or Diesel
      const stockGroup = new THREE.Group();
      const block = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.28, 0.3), materials.chassisSteel);
      block.position.set(0.24, 0.26, -0.35);
      stockGroup.add(block);

      const cover = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.24), materials.caliperMetal);
      cover.position.set(0.24, 0.42, -0.35);
      stockGroup.add(cover);

      engineGroup.add(stockGroup);
    }

    // F. EXHAUST SYSTEMS (F1 Titanium Center, Tuned Pipe, Sidepod Flamethrower, Quad Tips, EV Diffuser)
    if (cfg.exhaustMod === 'f1_titanium_center') {
      // FORMULA 1 BLUED TITANIUM CENTER EXHAUST
      const exGroup = new THREE.Group();
      const pipeL = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 0.45, 12), materials.titaniumHeatTreated);
      pipeL.rotation.x = Math.PI / 2 + 0.15;
      pipeL.position.set(-0.04, 0.34, -0.92);
      exGroup.add(pipeL);

      const pipeR = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.038, 0.45, 12), materials.titaniumHeatTreated);
      pipeR.rotation.x = Math.PI / 2 + 0.15;
      pipeR.position.set(0.04, 0.34, -0.92);
      exGroup.add(pipeR);

      exhaustGroup.add(exGroup);
      exhaustTipPosition.set(0, 0.34, -1.14);
    } else if (cfg.exhaustMod === 'tuned_pipe_loop') {
      // Curved 2-stroke expansion chamber with carbon silencer
      const exGroup = new THREE.Group();
      const chamber = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.075, 0.6, 12), materials.chrome);
      chamber.rotation.x = 1.35;
      chamber.position.set(0.36, 0.26, -0.65);
      exGroup.add(chamber);

      const silencer = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.28, 10), materials.carbonFiber);
      silencer.rotation.x = Math.PI / 2;
      silencer.position.set(0.36, 0.22, -0.98);
      exGroup.add(silencer);

      exhaustGroup.add(exGroup);
      exhaustTipPosition.set(0.36, 0.22, -1.12);
    } else if (cfg.exhaustMod === 'sidepod_flamethrower') {
      // Side-exit sidepod exhaust
      const exGroup = new THREE.Group();
      const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.3, 12), materials.titaniumHeatTreated);
      pipe.rotation.z = Math.PI / 2;
      pipe.position.set(0.68, 0.18, 0.15);
      exGroup.add(pipe);

      exhaustGroup.add(exGroup);
      exhaustTipPosition.set(0.72, 0.18, 0.15);
    } else if (cfg.exhaustMod === 'quad_carbon_tips') {
      // Quad carbon tips
      const exGroup = new THREE.Group();
      for (let i = 0; i < 4; i++) {
        const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.32, 10), materials.carbonFiber);
        tip.rotation.x = Math.PI / 2;
        tip.position.set(-0.18 + i * 0.12, 0.22, -0.95);
        exGroup.add(tip);
      }
      exhaustGroup.add(exGroup);
      exhaustTipPosition.set(0, 0.22, -1.11);
    } else {
      // EV Silent Diffuser
      const exGroup = new THREE.Group();
      const diff = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.06, 0.3), materials.forgedCarbon);
      diff.position.set(0, 0.14, -0.92);
      exGroup.add(diff);
      exhaustGroup.add(exGroup);
      exhaustTipPosition.set(0, 0.14, -0.92);
    }
  }

  // UPDATE MATERIALS (Colors, finishes, textures, materials)
  function updateMaterials(cfg: KartConfig) {
    materials.bodyPaint.color.set(cfg.bodyColor);
    materials.accentPaint.color.set(cfg.accentColor);

    // Body Material Logic
    if (cfg.material === 'forged_carbon') {
      materials.bodyPaint.roughness = 0.26;
      materials.bodyPaint.metalness = 0.25;
      materials.bodyPaint.map = forgedCarbonTexture;
    } else if (cfg.material === 'twill_carbon') {
      materials.bodyPaint.roughness = 0.32;
      materials.bodyPaint.metalness = 0.2;
      materials.bodyPaint.map = twillCarbonTexture;
    } else if (cfg.material === 'billet_metal') {
      materials.bodyPaint.roughness = 0.24;
      materials.bodyPaint.metalness = 0.95;
      materials.bodyPaint.map = brushedMetalTexture;
    } else if (cfg.material === 'titanium_sheen') {
      materials.bodyPaint.roughness = 0.14;
      materials.bodyPaint.metalness = 0.98;
      materials.bodyPaint.map = null;
    } else if (cfg.material === 'stealth_matte') {
      materials.bodyPaint.roughness = 0.92;
      materials.bodyPaint.metalness = 0.05;
      materials.bodyPaint.map = null;
    } else {
      // gloss_lacquer
      materials.bodyPaint.roughness = 0.1;
      materials.bodyPaint.metalness = 0.12;
      materials.bodyPaint.map = null;
    }
    materials.bodyPaint.needsUpdate = true;

    // Rims & Calipers
    materials.rimMetal.color.set(cfg.rimColor);
    materials.caliperMetal.color.set(cfg.caliperColor);

    // Seat Fabric
    if (cfg.seatKit === 'alcantara_diamond') {
      materials.seatFabric.color.set(0x991b1b);
    } else {
      materials.seatFabric.color.set(0x18181c);
    }

    // Number Decal
    numberTexture = createNumberDecalTexture(cfg.raceNumber, cfg.bodyColor);
    materials.numberDecal.map = numberTexture;
    materials.numberDecal.needsUpdate = true;

    // Headlights
    materials.headlightGlass.color.set(cfg.headlightColor);
    materials.headlightGlass.emissive.set(cfg.headlightColor);
    headlights.forEach((h) => h.color.set(cfg.headlightColor));

    // Underglow
    const ugHex = getUnderglowColorHex(cfg.underglow);
    underglowLight.color.setHex(ugHex);
    underglowLight.intensity = cfg.underglow === 'none' ? 0 : 2.5;
    underglowPlane.material.color.setHex(ugHex);
    underglowPlane.material.opacity = cfg.underglow === 'none' ? 0 : 0.45;

    // Tires
    tireTexture = createTireTexture(cfg.tireType);
    materials.tireRubber.map = tireTexture;
    materials.tireRubber.needsUpdate = true;
  }

  // Initial builds
  rebuildWheelsAndCockpit(initialConfig);
  rebuildModularParts(initialConfig);

  return {
    rootGroup,
    frontLeftSteerPivot,
    frontRightSteerPivot,
    wheels,
    steeringWheelGroup,
    underglowLight,
    headlights,
    exhaustTipPosition,
    updateMaterials,
    rebuildModularParts,
    rebuildWheelsAndCockpit,
  };
}

function getUnderglowColorHex(underglow: string): number {
  switch (underglow) {
    case 'red':
      return 0xdc2626;
    case 'white':
      return 0xffffff;
    case 'cyan':
      return 0x06b6d4;
    case 'amber':
      return 0xf59e0b;
    default:
      return 0x000000;
  }
}
