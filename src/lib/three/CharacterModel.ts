// CharacterModel — Personaje 3D de Alexandra Kollontai
// Modelo estilizado low-poly con animaciones
import * as THREE from 'three';

export interface AnimState {
  tipo: 'idle' | 'walk' | 'dance' | 'point';
  tiempo: number;
}

export class CharacterModel {
  public group: THREE.Group;
  private body: THREE.Mesh;
  private head: THREE.Mesh;
  private scarf: THREE.Mesh;
  private leftArm: THREE.Mesh;
  private rightArm: THREE.Mesh;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private hair: THREE.Mesh;
  private animState: AnimState = { tipo: 'idle', tiempo: 0 };
  private walkPhase = 0;
  private isMoving = false;
  private moveTarget: { x: number; z: number } | null = null;
  private moveSpeed = 0;

  constructor() {
    this.group = new THREE.Group();

    // Materiales
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xf5d6c6, roughness: 0.7 });
    const coatMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
    const scarfMat = new THREE.MeshStandardMaterial({ color: 0xbe1111, roughness: 0.6, emissive: 0x330000, emissiveIntensity: 0.1 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.9 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.9 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a });

    // Cuerpo (abrigo)
    const bodyGeo = new THREE.CylinderGeometry(0.8, 0.9, 1.6, 8);
    this.body = new THREE.Mesh(bodyGeo, coatMat);
    this.body.position.y = 1.4;
    this.group.add(this.body);

    // Cabeza
    const headGeo = new THREE.SphereGeometry(0.5, 12, 12);
    this.head = new THREE.Mesh(headGeo, skinMat);
    this.head.position.y = 2.4;
    this.group.add(this.head);

    // Cabello
    const hairGeo = new THREE.SphereGeometry(0.52, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    this.hair = new THREE.Mesh(hairGeo, hairMat);
    this.hair.position.y = 2.42;
    this.hair.position.z = -0.05;
    this.hair.scale.set(1, 0.5, 1.1);
    this.group.add(this.hair);

    // Pañuelo rojo
    const scarfGeo = new THREE.TorusGeometry(0.55, 0.08, 6, 12, Math.PI);
    this.scarf = new THREE.Mesh(scarfGeo, scarfMat);
    this.scarf.position.y = 2.0;
    this.scarf.rotation.x = Math.PI;
    this.group.add(this.scarf);

    // Brazos
    const armGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.7, 6);
    this.leftArm = new THREE.Mesh(armGeo, coatMat);
    this.leftArm.position.set(-0.95, 1.8, 0);
    this.leftArm.rotation.z = 0.2;
    this.group.add(this.leftArm);

    this.rightArm = new THREE.Mesh(armGeo, coatMat);
    this.rightArm.position.set(0.95, 1.8, 0);
    this.rightArm.rotation.z = -0.2;
    this.group.add(this.rightArm);

    // Piernas
    const legGeo = new THREE.CylinderGeometry(0.18, 0.2, 0.6, 6);
    this.leftLeg = new THREE.Mesh(legGeo, bootMat);
    this.leftLeg.position.set(-0.35, 0.3, 0);
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, bootMat);
    this.rightLeg.position.set(0.35, 0.3, 0);
    this.group.add(this.rightLeg);

    // Ojos (puntitos)
    const eyeGeo = new THREE.SphereGeometry(0.04, 6, 6);
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.15, 2.5, 0.46);
    this.group.add(leftEye);
    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.15, 2.5, 0.46);
    this.group.add(rightEye);

    // Escalamos el grupo entero para que sea del mismo tamaño que los NPCs
    // Player height 2.9 * scale = NPC height 1.15 * 0.7 = 0.805 → scale = 0.28
    this.group.scale.set(0.28, 0.28, 0.28);
  }

  setPosition(x: number, z: number) {
    this.group.position.set(x, 0, z);
  }

  lookAt(direction: 'izq' | 'der') {
    this.group.scale.x = direction === 'izq' ? -1 : 1;
  }

  setMoving(moving: boolean) {
    this.isMoving = moving;
  }

  startDance() {
    this.animState = { tipo: 'dance', tiempo: 0 };
  }

  stopDance() {
    this.animState = { tipo: 'idle', tiempo: 0 };
  }

  moveTo(targetX: number, targetZ: number, speed: number, worldHalf?: number) {
    // Limitar dentro del mundo
    if (worldHalf) {
      targetX = Math.max(-worldHalf + 2, Math.min(targetX, worldHalf - 2));
      targetZ = Math.max(-8, Math.min(targetZ, 6)); // no ir al fondo
    }
    this.moveTarget = { x: targetX, z: targetZ };
    this.moveSpeed = speed;
    this.isMoving = true;
  }

  isAtTarget(): boolean {
    return !this.isMoving;
  }

  update(delta: number) {
    this.animState.tiempo += delta;

    // Movimiento interpolado hacia el target
    if (this.isMoving && this.moveTarget) {
      const dx = this.moveTarget.x - this.group.position.x;
      const dz = this.moveTarget.z - this.group.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist < 0.1) {
        // Snap al target y detener
        this.group.position.x = this.moveTarget.x;
        this.group.position.z = this.moveTarget.z;
        this.isMoving = false;
        this.moveTarget = null;
      } else {
        // Interpolar hacia el target
        const step = this.moveSpeed * delta;
        if (step >= dist) {
          this.group.position.x = this.moveTarget.x;
          this.group.position.z = this.moveTarget.z;
          this.isMoving = false;
          this.moveTarget = null;
        } else {
          const ratio = step / dist;
          this.group.position.x += dx * ratio;
          this.group.position.z += dz * ratio;
        }
      }
    }

    switch (this.animState.tipo) {
      case 'dance': {
        // Baile con brazos arriba y balanceo
        const t = this.animState.tiempo;
        this.leftArm.rotation.z = 0.2 + Math.sin(t * 3) * 0.8;
        this.leftArm.rotation.x = Math.sin(t * 2) * 0.3;
        this.rightArm.rotation.z = -0.2 - Math.sin(t * 3 + Math.PI) * 0.8;
        this.rightArm.rotation.x = Math.sin(t * 2 + Math.PI) * 0.3;
        this.head.rotation.z = Math.sin(t * 2.5) * 0.15;
        this.head.rotation.x = Math.sin(t * 1.5) * 0.1;
        // Balanceo del cuerpo
        this.body.position.y = 1.4 + Math.sin(t * 4) * 0.05;
        this.scarf.rotation.z = Math.sin(t * 2) * 0.2;
        this.group.rotation.y = Math.sin(t * 1.5) * 0.08;
        break;
      }

      case 'walk': {
        this.walkPhase += delta * 5;
        // Brazos balanceándose
        this.leftArm.rotation.z = 0.2 + Math.sin(this.walkPhase) * 0.3;
        this.rightArm.rotation.z = -0.2 - Math.sin(this.walkPhase) * 0.3;
        // Piernas
        this.leftLeg.rotation.x = Math.sin(this.walkPhase) * 0.4;
        this.rightLeg.rotation.x = -Math.sin(this.walkPhase) * 0.4;
        // Cabeza sigue
        this.head.rotation.z = 0;
        this.head.rotation.x = 0;
        break;
      }

      case 'idle': {
        // Respiración suave
        const breath = Math.sin(this.animState.tiempo * 1.5) * 0.02;
        this.body.position.y = 1.4 + breath;
        this.leftArm.rotation.z = 0.2;
        this.leftArm.rotation.x = 0;
        this.rightArm.rotation.z = -0.2;
        this.rightArm.rotation.x = 0;
        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;
        this.head.rotation.z = 0;
        this.head.rotation.x = 0;
        break;
      }
    }
  }

  setAnimation(tipo: AnimState['tipo']) {
    if (this.animState.tipo !== tipo) {
      this.animState = { tipo, tiempo: 0 };
    }
  }

  getPosition(): THREE.Vector3 {
    return this.group.position.clone();
  }
}
