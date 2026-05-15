// SnowParticles — Sistema de partículas de nieve en Three.js
import * as THREE from 'three';

export class SnowParticles {
  private particles: THREE.Points;
  private material: THREE.PointsMaterial;
  private positions: Float32Array;
  private velocities: Float32Array;
  private count: number;
  public active = true;

  constructor(scene: THREE.Scene, count = 2000) {
    this.count = count;
    const geo = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    this.velocities = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      this.positions[i * 3] = (Math.random() - 0.5) * 60;
      this.positions[i * 3 + 1] = Math.random() * 30;
      this.positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
      this.velocities[i] = 0.5 + Math.random() * 1.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.material = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.25,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geo, this.material);
    scene.add(this.particles);
  }

  update(delta: number) {
    if (!this.active) return;
    for (let i = 0; i < this.count; i++) {
      this.positions[i * 3 + 1] -= this.velocities[i] * delta * 2;
      this.positions[i * 3] += Math.sin(this.positions[i * 3 + 1] * 0.5) * delta * 0.3;
      this.positions[i * 3 + 2] += Math.cos(this.positions[i * 3 + 1] * 0.3) * delta * 0.2;

      if (this.positions[i * 3 + 1] < -2) {
        this.positions[i * 3 + 1] = 28;
        this.positions[i * 3] = (Math.random() - 0.5) * 60;
        this.positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
      }
    }
    this.particles.geometry.attributes.position.needsUpdate = true;
  }

  setIntensity(multiplier: number) {
    this.material.size = 0.15 * multiplier;
    this.material.opacity = 0.8 * multiplier;
  }

  destroy() {
    if (this.particles.parent) {
      this.particles.parent.remove(this.particles);
    }
    this.geometry.dispose();
    this.material.dispose();
  }

  private get geometry() {
    return this.particles.geometry;
  }
}
