import * as THREE from 'three';
import { createGarageFloorTexture } from './proceduralTextures';

export interface EnvironmentHandles {
  garageGroup: THREE.Group;
  trackGroup: THREE.Group;
  setMode: (mode: 'garage' | 'track') => void;
  dispose: () => void;
}

export function buildEnvironments(scene: THREE.Scene): EnvironmentHandles {
  // 1. GARAGE SHOWROOM
  const garageGroup = new THREE.Group();
  garageGroup.name = 'GarageShowroom';

  // Showroom floor
  const floorTexture = createGarageFloorTexture();
  const floorGeo = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorTexture,
    roughness: 0.45,
    metalness: 0.25,
  });
  const floorMesh = new THREE.Mesh(floorGeo, floorMat);
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;
  garageGroup.add(floorMesh);

  // Soft contact shadow plane directly beneath kart
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const sCtx = shadowCanvas.getContext('2d')!;
  const grad = sCtx.createRadialGradient(128, 128, 20, 128, 128, 120);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
  grad.addColorStop(0.5, 'rgba(0, 0, 0, 0.4)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  sCtx.fillStyle = grad;
  sCtx.fillRect(0, 0, 256, 256);

  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 3.2),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    })
  );
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.005; // grounded
  garageGroup.add(contactShadow);

  // Overhead Hexagonal Neon Studio Ceiling Rig
  const neonRigGroup = new THREE.Group();
  neonRigGroup.position.set(0, 3.8, 0);

  const neonMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const redNeonMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });

  // Hexagon tubes
  const hexRadius = 2.4;
  for (let i = 0; i < 6; i++) {
    const angle1 = (i * Math.PI) / 3;
    const angle2 = ((i + 1) * Math.PI) / 3;
    const x1 = Math.cos(angle1) * hexRadius;
    const z1 = Math.sin(angle1) * hexRadius;
    const x2 = Math.cos(angle2) * hexRadius;
    const z2 = Math.sin(angle2) * hexRadius;

    const dx = x2 - x1;
    const dz = z2 - z1;
    const len = Math.hypot(dx, dz);

    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, len, 8),
      i % 2 === 0 ? neonMat : redNeonMat
    );
    tube.position.set((x1 + x2) / 2, 0, (z1 + z2) / 2);
    tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(dx, 0, dz).normalize());
    neonRigGroup.add(tube);
  }
  garageGroup.add(neonRigGroup);

  scene.add(garageGroup);

  // 2. TEST DRIVE RACE TRACK CIRCUIT
  const trackGroup = new THREE.Group();
  trackGroup.name = 'TestDriveTrack';
  trackGroup.visible = false;

  // Track ground tarmac base
  const trackGroundGeo = new THREE.PlaneGeometry(160, 160);
  const trackGroundMat = new THREE.MeshStandardMaterial({
    color: 0x111215,
    roughness: 0.85,
  });
  const trackGround = new THREE.Mesh(trackGroundGeo, trackGroundMat);
  trackGround.rotation.x = -Math.PI / 2;
  trackGround.receiveShadow = true;
  trackGroup.add(trackGround);

  // Track Loop Curve Definition (Continuous oval with infield chicane)
  const trackCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.01, 35),
    new THREE.Vector3(25, 0.01, 30),
    new THREE.Vector3(40, 0.01, 10),
    new THREE.Vector3(38, 0.01, -20),
    new THREE.Vector3(20, 0.01, -38),
    new THREE.Vector3(-5, 0.01, -36),
    new THREE.Vector3(-15, 0.01, -18),
    new THREE.Vector3(-32, 0.01, -5),
    new THREE.Vector3(-36, 0.01, 20),
    new THREE.Vector3(-20, 0.01, 35),
  ], true);

  // Generate Track Surface Ribbon (Width: 10m)
  const trackPoints = trackCurve.getPoints(120);
  const trackWidth = 5.0; // half-width 5m = 10m track
  const ribbonGeom = new THREE.BufferGeometry();
  const vertices: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i <= trackPoints.length; i++) {
    const pt = trackPoints[i % trackPoints.length];
    const nextPt = trackPoints[(i + 1) % trackPoints.length];
    const tangent = new THREE.Vector3().subVectors(nextPt, pt).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    // Left vertex
    vertices.push(pt.x + normal.x * trackWidth, 0.015, pt.z + normal.z * trackWidth);
    uvs.push(0, i / trackPoints.length * 20);

    // Right vertex
    vertices.push(pt.x - normal.x * trackWidth, 0.015, pt.z - normal.z * trackWidth);
    uvs.push(1, i / trackPoints.length * 20);
  }

  const indices: number[] = [];
  for (let i = 0; i < trackPoints.length; i++) {
    const p1 = i * 2;
    const p2 = i * 2 + 1;
    const p3 = (i + 1) * 2;
    const p4 = (i + 1) * 2 + 1;

    indices.push(p1, p2, p3);
    indices.push(p2, p4, p3);
  }

  ribbonGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  ribbonGeom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  ribbonGeom.setIndex(indices);
  ribbonGeom.computeVertexNormals();

  const trackAsphaltMat = new THREE.MeshStandardMaterial({
    color: 0x1e2026,
    roughness: 0.7,
    metalness: 0.15,
  });
  const ribbonMesh = new THREE.Mesh(ribbonGeom, trackAsphaltMat);
  ribbonMesh.receiveShadow = true;
  trackGroup.add(ribbonMesh);

  // Red & White Apex Curbs on inner/outer track edges
  const curbGeo = new THREE.BoxGeometry(0.6, 0.04, 1.2);
  const curbMatRed = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
  const curbMatWhite = new THREE.MeshBasicMaterial({ color: 0xffffff });

  for (let i = 0; i < trackPoints.length; i += 2) {
    const pt = trackPoints[i];
    const nextPt = trackPoints[(i + 1) % trackPoints.length];
    const tangent = new THREE.Vector3().subVectors(nextPt, pt).normalize();
    const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

    // Outer curb
    const curbOut = new THREE.Mesh(curbGeo, i % 4 === 0 ? curbMatRed : curbMatWhite);
    curbOut.position.set(pt.x + normal.x * (trackWidth + 0.3), 0.03, pt.z + normal.z * (trackWidth + 0.3));
    curbOut.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    trackGroup.add(curbOut);

    // Inner curb
    const curbIn = new THREE.Mesh(curbGeo, i % 4 === 0 ? curbMatWhite : curbMatRed);
    curbIn.position.set(pt.x - normal.x * (trackWidth + 0.3), 0.03, pt.z - normal.z * (trackWidth + 0.3));
    curbIn.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
    trackGroup.add(curbIn);
  }

  // Start / Finish Line Gantry across the straightaway
  const gantryGroup = new THREE.Group();
  gantryGroup.position.set(0, 0, 35);

  // Gantry pillars
  const pillarGeo = new THREE.BoxGeometry(0.4, 4.2, 0.4);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x22242a, metalness: 0.8 });
  const pillarL = new THREE.Mesh(pillarGeo, pillarMat);
  pillarL.position.set(-6.5, 2.1, 0);
  gantryGroup.add(pillarL);

  const pillarR = new THREE.Mesh(pillarGeo, pillarMat);
  pillarR.position.set(6.5, 2.1, 0);
  gantryGroup.add(pillarR);

  // Overhead beam
  const beam = new THREE.Mesh(new THREE.BoxGeometry(13.4, 0.6, 0.5), pillarMat);
  beam.position.set(0, 4.0, 0);
  gantryGroup.add(beam);

  // Digital LED Timing Board
  const timerSign = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.8, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 })
  );
  timerSign.position.set(0, 3.8, 0.28);
  gantryGroup.add(timerSign);

  // Checkered Start/Finish Line on track ground
  const checkCanvas = document.createElement('canvas');
  checkCanvas.width = 512;
  checkCanvas.height = 128;
  const cCtx = checkCanvas.getContext('2d')!;
  cCtx.fillStyle = '#111';
  cCtx.fillRect(0, 0, 512, 128);
  for (let y = 0; y < 2; y++) {
    for (let x = 0; x < 16; x++) {
      if ((x + y) % 2 === 0) {
        cCtx.fillStyle = '#FFFFFF';
        cCtx.fillRect(x * 32, y * 64, 32, 64);
      }
    }
  }
  const checkTex = new THREE.CanvasTexture(checkCanvas);
  const startLine = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 1.4),
    new THREE.MeshBasicMaterial({ map: checkTex, depthWrite: false })
  );
  startLine.rotation.x = -Math.PI / 2;
  startLine.position.set(0, 0.02, 35);
  trackGroup.add(startLine);

  trackGroup.add(gantryGroup);

  // Neon Apex Beacon Pylons around the circuit
  for (let i = 0; i < trackPoints.length; i += 12) {
    const pt = trackPoints[i];
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.12, 2.8, 8),
      new THREE.MeshBasicMaterial({ color: 0xdc2626 })
    );
    beacon.position.set(pt.x * 1.25, 1.4, pt.z * 1.25);
    trackGroup.add(beacon);
  }

  scene.add(trackGroup);

  return {
    garageGroup,
    trackGroup,
    setMode: (mode: 'garage' | 'track') => {
      garageGroup.visible = mode === 'garage';
      trackGroup.visible = mode === 'track';
    },
    dispose: () => {
      scene.remove(garageGroup);
      scene.remove(trackGroup);
      floorGeo.dispose();
      floorMat.dispose();
      ribbonGeom.dispose();
      trackAsphaltMat.dispose();
      curbGeo.dispose();
    },
  };
}
