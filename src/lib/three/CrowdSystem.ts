// CrowdSystem — Multitudes de figuras en el fondo
// Crea figuras simples que caminan para dar sensación de muchedumbre
import * as THREE from 'three';

interface CrowdFigure {
  mesh: THREE.Group;
  speed: number;
  offset: number;
  direction: number;
}

export class CrowdSystem {
  private figures: CrowdFigure[] = [];
  private active = true;

  constructor(scene: THREE.Scene, count = 30, color = 0x444444) {
    const bodyMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    const headMat = new THREE.MeshStandardMaterial({ color: 0x8B7355, roughness: 0.8 });
    const armMat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });

    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();

      // Cuerpo
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.6, 4), bodyMat);
      body.position.y = 0.5;
      group.add(body);

      // Cabeza
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.15, 4, 4), headMat);
      head.position.y = 0.95;
      group.add(head);

      group.position.set(
        (Math.random() - 0.5) * 50,
        0,
        -8 - Math.random() * 12
      );
      group.scale.setScalar(0.6 + Math.random() * 0.6);

      scene.add(group);

      this.figures.push({
        mesh: group,
        speed: 0.3 + Math.random() * 0.8,
        offset: Math.random() * 100,
        direction: Math.random() > 0.5 ? 1 : -1,
      });
    }
  }

  update(delta: number) {
    if (!this.active) return;
    this.figures.forEach((f) => {
      f.mesh.position.x += f.direction * f.speed * delta;
      f.mesh.position.z += Math.sin(Date.now() * 0.001 + f.offset) * delta * 0.2;
      // Walk animation
      f.mesh.position.y = Math.sin(Date.now() * 0.003 + f.offset) * 0.03;

      if (f.mesh.position.x > 25) f.direction = -1;
      if (f.mesh.position.x < -25) f.direction = 1;
    });
  }

  setActive(a: boolean) {
    this.active = a;
  }

  destroy() {
    this.figures.forEach((f) => {
      if (f.mesh.parent) f.mesh.parent.remove(f.mesh);
    });
    this.figures = [];
  }
}
