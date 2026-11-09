import * as THREE from 'three';

/**
 * Procedural Canvas Textures for Go-Kart Studio
 * High-resolution canvas generators with SRGBColorSpace and zero 404 dependencies
 */

// Generate tire sidewall and tread texture
export function createTireTexture(tireType: string, brandText = 'APEX CORSA'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark rubber base
  ctx.fillStyle = '#18181A';
  ctx.fillRect(0, 0, 1024, 1024);

  // Sidewall circles
  ctx.strokeStyle = '#28282C';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(512, 512, 420, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = '#121214';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(512, 512, 340, 0, Math.PI * 2);
  ctx.stroke();

  // Branding text along circle
  ctx.save();
  ctx.translate(512, 512);
  ctx.fillStyle = '#E5E7EB';
  ctx.font = 'bold 36px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Top brand
  ctx.fillText(brandText, 0, -380);
  // Bottom spec
  ctx.font = 'bold 26px sans-serif';
  ctx.fillStyle = '#DC2626';
  ctx.fillText('• 11x7.10-5 COMPETITION •', 0, 380);
  ctx.restore();

  // Tread patterns in center / sides
  if (tireType === 'wet_grooved') {
    ctx.strokeStyle = '#0B0B0C';
    ctx.lineWidth = 18;
    for (let x = 80; x < 940; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 40, 200);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x, 1024);
      ctx.lineTo(x + 40, 824);
      ctx.stroke();
    }
  } else if (tireType === 'dirt_knobby') {
    ctx.fillStyle = '#080809';
    for (let y = 50; y < 980; y += 80) {
      for (let x = 60; x < 960; x += 100) {
        ctx.fillRect(x + (y % 160 === 0 ? 40 : 0), y, 50, 35);
      }
    }
  } else if (tireType === 'drift_hard') {
    // White wall stripe
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 16;
    ctx.beginPath();
    ctx.arc(512, 512, 360, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // Slick - subtle heat grain
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let i = 0; i < 3000; i++) {
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// Generate carbon fiber weave texture
export function createCarbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#151518';
  ctx.fillRect(0, 0, 64, 64);

  ctx.fillStyle = '#222227';
  ctx.fillRect(0, 0, 32, 32);
  ctx.fillRect(32, 32, 32, 32);

  ctx.fillStyle = '#101012';
  for (let i = 0; i < 32; i += 4) {
    ctx.fillRect(i, 0, 2, 32);
    ctx.fillRect(32 + i, 32, 2, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

// Generate brake rotor texture
export function createBrakeDiscTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Steel brushed base
  ctx.fillStyle = '#9CA3AF';
  ctx.fillRect(0, 0, 512, 512);

  // Concentric friction rings
  ctx.strokeStyle = '#6B7280';
  for (let r = 120; r < 240; r += 8) {
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Cross-drilled cooling holes
  ctx.fillStyle = '#1F2937';
  for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
    for (let dist = 140; dist < 230; dist += 26) {
      const x = 256 + Math.cos(angle + (dist % 50) * 0.05) * dist;
      const y = 256 + Math.sin(angle + (dist % 50) * 0.05) * dist;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Generate custom race number decal texture for front nosecone & side pods
export function createNumberDecalTexture(number: string, color: string, bgStyle: 'shield' | 'circle' = 'shield'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Transparent background
  ctx.clearRect(0, 0, 512, 512);

  // Badge background
  ctx.save();
  ctx.translate(256, 256);

  if (bgStyle === 'shield') {
    ctx.fillStyle = '#0F0F12';
    ctx.beginPath();
    ctx.moveTo(0, -180);
    ctx.lineTo(160, -120);
    ctx.lineTo(130, 140);
    ctx.lineTo(0, 200);
    ctx.lineTo(-130, 140);
    ctx.lineTo(-160, -120);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = color || '#DC2626';
    ctx.lineWidth = 12;
    ctx.stroke();
  } else {
    ctx.fillStyle = '#0F0F12';
    ctx.beginPath();
    ctx.arc(0, 0, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color || '#DC2626';
    ctx.lineWidth = 14;
    ctx.stroke();
  }

  // Subtitle
  ctx.fillStyle = '#9CA3AF';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('APEX RACING', 0, -100);

  // Main Race Number
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 160px "Arial Black", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(number.slice(0, 3) || '07', 0, 20);

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Generate racing check & grid asphalt showroom floor texture
export function createGarageFloorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark showroom tile base
  ctx.fillStyle = '#090A0D';
  ctx.fillRect(0, 0, 1024, 1024);

  // High-tech hexagonal & grid lines
  const tileSize = 64;
  ctx.strokeStyle = '#15171D';
  ctx.lineWidth = 1.5;

  for (let x = 0; x <= 1024; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }

  for (let y = 0; y <= 1024; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Center pit lane red boundary guides
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(256, 0);
  ctx.lineTo(256, 1024);
  ctx.moveTo(768, 0);
  ctx.lineTo(768, 1024);
  ctx.stroke();

  // White hash markings
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 3;
  for (let y = 64; y < 1024; y += 128) {
    ctx.beginPath();
    ctx.moveTo(240, y);
    ctx.lineTo(256, y);
    ctx.moveTo(768, y);
    ctx.lineTo(784, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(12, 12);
  return texture;
}

// Generate forged carbon fiber marbled texture
export function createForgedCarbonTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#141416';
  ctx.fillRect(0, 0, 512, 512);

  // Marbled directional carbon flakes
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const length = 18 + Math.random() * 32;
    const angle = (Math.random() - 0.5) * 0.9;
    const lightness = 25 + Math.floor(Math.random() * 45);
    ctx.strokeStyle = `rgb(${lightness}, ${lightness}, ${lightness + 5})`;
    ctx.lineWidth = 4 + Math.random() * 8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

// Generate brushed metal anisotropic grain texture
export function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#CCCCCC';
  ctx.fillRect(0, 0, 256, 256);

  // Fine brushed horizontal streaks
  for (let y = 0; y < 256; y += 2) {
    const shade = 180 + Math.floor(Math.random() * 55);
    ctx.strokeStyle = `rgb(${shade}, ${shade}, ${shade})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

