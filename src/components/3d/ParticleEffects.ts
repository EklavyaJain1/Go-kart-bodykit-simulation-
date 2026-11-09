import * as THREE from 'three';

/**
 * High-performance reusable particle pools for tire smoke and exhaust flames
 * Zero Garbage Collection per-frame allocation
 */

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  active: boolean;
  baseScale: number;
}

export class ParticleSystem {
  public group: THREE.Group;
  private smokePool: Particle[] = [];
  private flamePool: Particle[] = [];
  private smokeMat: THREE.MeshBasicMaterial;
  private flameMat: THREE.MeshBasicMaterial;
  private sparkMat: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.group = new THREE.Group();
    this.group.name = 'ParticleSystem';
    scene.add(this.group);

    // Smoke material
    this.smokeMat = new THREE.MeshBasicMaterial({
      color: 0x9ca3af,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });

    // Flame / exhaust blast material
    this.flameMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });

    this.sparkMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
    });

    // Pre-allocate 40 smoke particles
    const smokeGeo = new THREE.SphereGeometry(0.08, 6, 6);
    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(smokeGeo, this.smokeMat.clone());
      mesh.visible = false;
      this.group.add(mesh);
      this.smokePool.push({
        mesh,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1,
        active: false,
        baseScale: 1,
      });
    }

    // Pre-allocate 30 flame/spark particles
    const flameGeo = new THREE.SphereGeometry(0.05, 6, 6);
    for (let i = 0; i < 30; i++) {
      const mesh = new THREE.Mesh(flameGeo, this.flameMat.clone());
      mesh.visible = false;
      this.group.add(mesh);
      this.flamePool.push({
        mesh,
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 0.4,
        active: false,
        baseScale: 1,
      });
    }
  }

  // Spawn tire drift smoke
  public emitTireSmoke(x: number, y: number, z: number, intensity = 1) {
    for (let i = 0; i < 2; i++) {
      const p = this.smokePool.find((item) => !item.active);
      if (!p) return;

      p.active = true;
      p.mesh.visible = true;
      p.life = 0;
      p.maxLife = 0.5 + Math.random() * 0.4;
      p.baseScale = (0.6 + Math.random() * 0.8) * intensity;
      p.mesh.position.set(
        x + (Math.random() - 0.5) * 0.1,
        y + 0.05,
        z + (Math.random() - 0.5) * 0.1
      );
      p.velocity.set(
        (Math.random() - 0.5) * 0.6,
        0.3 + Math.random() * 0.4,
        (Math.random() - 0.5) * 0.6
      );
    }
  }

  // Spawn exhaust flames & backfire sparks
  public emitExhaustFlame(origin: THREE.Vector3, dir: THREE.Vector3, isSpitfire = false) {
    const count = isSpitfire ? 8 : 3;
    for (let i = 0; i < count; i++) {
      const p = this.flamePool.find((item) => !item.active);
      if (!p) return;

      p.active = true;
      p.mesh.visible = true;
      p.life = 0;
      p.maxLife = 0.18 + Math.random() * 0.2;
      p.baseScale = isSpitfire ? 1.5 : 0.8;
      p.mesh.position.copy(origin);
      p.velocity.set(
        dir.x + (Math.random() - 0.5) * 0.4,
        dir.y + (Math.random() - 0.5) * 0.4,
        dir.z + (Math.random() - 0.5) * 0.4
      ).multiplyScalar(3.5 + Math.random() * 2);

      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      if (Math.random() > 0.4) {
        mat.color.setHex(0xff2200); // crimson red flame
      } else {
        mat.color.setHex(0xffea00); // fiery yellow core
      }
    }
  }

  public update(delta: number) {
    // Update smoke
    for (const p of this.smokePool) {
      if (!p.active) continue;
      p.life += delta;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      const progress = p.life / p.maxLife;
      p.mesh.position.x += p.velocity.x * delta;
      p.mesh.position.y += p.velocity.y * delta;
      p.mesh.position.z += p.velocity.z * delta;

      const scale = p.baseScale * (1 + progress * 2.5);
      p.mesh.scale.set(scale, scale, scale);

      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - progress) * 0.35;
    }

    // Update flames
    for (const p of this.flamePool) {
      if (!p.active) continue;
      p.life += delta;
      if (p.life >= p.maxLife) {
        p.active = false;
        p.mesh.visible = false;
        continue;
      }

      const progress = p.life / p.maxLife;
      p.mesh.position.x += p.velocity.x * delta;
      p.mesh.position.y += p.velocity.y * delta;
      p.mesh.position.z += p.velocity.z * delta;

      const scale = p.baseScale * (1 - progress * 0.8);
      p.mesh.scale.set(scale, scale, scale);

      const mat = p.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = (1 - progress) * 0.8;
    }
  }

  public dispose() {
    this.smokePool.forEach((p) => {
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    });
    this.flamePool.forEach((p) => {
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    });
    this.smokeMat.dispose();
    this.flameMat.dispose();
    this.sparkMat.dispose();
  }
}
