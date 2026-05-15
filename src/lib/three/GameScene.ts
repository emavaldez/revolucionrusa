// GameScene — Escena Three.js principal que maneja renderizado, cámara, luces
import * as THREE from 'three';
import { SnowParticles } from './SnowParticles';
import { CharacterModel } from './CharacterModel';
import { CrowdSystem } from './CrowdSystem';

export interface GameSceneConfig {
  anchoMundo: number;
  altoMundo?: number;
  nieve?: boolean;
  multitud?: boolean;
  hora?: 'dia' | 'atardecer' | 'noche';
  colorFondo?: number;
  colorSuelo?: number;
  bruma?: boolean;
}

export class GameScene {
  public renderer: THREE.WebGLRenderer;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public character: CharacterModel;
  public snow: SnowParticles | null = null;
  public crowd: CrowdSystem | null = null;

  private ambientLight: THREE.AmbientLight;
  private dirLight: THREE.DirectionalLight;
  private ground: THREE.Mesh;
  private animFrame: number | null = null;
  private lastTime = 0;
  private config: GameSceneConfig;
  private cameraTargetX = 0;

  // Hotspot indicators en 3D
  private hotspotMeshes: THREE.Mesh[] = [];

  constructor(container: HTMLElement, config: GameSceneConfig) {
    this.config = config;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.setBackground(config.colorFondo ?? 0x1a1a2e);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 6, 14);
    this.camera.lookAt(0, 1.2, 0);

    // Lighting
    this.ambientLight = new THREE.AmbientLight(0x404060, 0.4);
    this.scene.add(this.ambientLight);

    const hora = config.hora ?? 'noche';
    if (hora === 'noche') {
      this.dirLight = new THREE.DirectionalLight(0x4466aa, 0.6);
      this.ambientLight.intensity = 0.25;
    } else if (hora === 'atardecer') {
      this.dirLight = new THREE.DirectionalLight(0xff8844, 1.0);
      this.ambientLight.intensity = 0.35;
    } else {
      this.dirLight = new THREE.DirectionalLight(0xffffcc, 1.2);
      this.ambientLight.intensity = 0.5;
    }
    this.dirLight.position.set(5, 12, 8);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 30;
    this.dirLight.shadow.camera.left = -20;
    this.dirLight.shadow.camera.right = 20;
    this.dirLight.shadow.camera.top = 20;
    this.dirLight.shadow.camera.bottom = -20;
    this.scene.add(this.dirLight);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0x8888ff, 0.3);
    fillLight.position.set(-5, 3, -5);
    this.scene.add(fillLight);

    // Ground (runs the full world width)
    const groundGeo = new THREE.PlaneGeometry(config.anchoMundo + 20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: config.colorSuelo ?? 0x334455,
      roughness: 0.9,
      metalness: 0.1,
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(0, -0.1, -2);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // Fog
    if (config.bruma !== false) {
      this.scene.fog = new THREE.FogExp2(
        config.colorFondo ?? 0x1a1a2e,
        0.025
      );
    }

    // Character
    this.character = new CharacterModel();
    this.scene.add(this.character.group);

    // Snow
    if (config.nieve) {
      this.snow = new SnowParticles(this.scene);
    }

    // Crowd
    if (config.multitud) {
      this.crowd = new CrowdSystem(this.scene, 20);
    }

    // Ambient buildings / props (side walls)
    this.createBuildings(config.anchoMundo);

    // Start loop
    this.lastTime = performance.now();
    this.loop(this.lastTime);

    // Resize handler
    window.addEventListener('resize', this.handleResize);
  }

  private createBuildings(worldWidth: number) {
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a3a,
      roughness: 0.9,
      metalness: 0.2,
    });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffaa44,
      emissive: 0xffaa44,
      emissiveIntensity: 0.3,
    });

    for (let x = -worldWidth / 2 + 2; x < worldWidth / 2 - 2; x += 2.5) {
      if (Math.random() > 0.7) continue;

      const h = 2 + Math.random() * 4;
      const building = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, h, 1.5),
        buildingMat
      );
      building.position.set(x, h / 2, -4.5);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      // Windows
      if (Math.random() > 0.3) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(0.2, 0.3),
          windowMat
        );
        win.position.set(x, 1 + Math.random() * (h - 1.5), -3.7);
        this.scene.add(win);
      }
    }
  }

  private setBackground(color: number) {
    this.scene.background = new THREE.Color(color);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(color);
    }
  }

  setCameraTarget(x: number) {
    this.cameraTargetX = Math.max(
      -this.config.anchoMundo / 2 + 8,
      Math.min(x, this.config.anchoMundo / 2 - 8)
    );
  }

  setHotspots(hotspots: { x: number; y: number; tipo: string; id: string }[]) {
    // Remove old
    this.hotspotMeshes.forEach((m) => {
      if (m.parent) m.parent.remove(m);
    });
    this.hotspotMeshes = [];

    const mat = new THREE.MeshStandardMaterial({
      color: 0xff4444,
      emissive: 0xff0000,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.3,
    });

    hotspots.forEach((hs) => {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        mat
      );
      mesh.position.set(
        hs.x - this.config.anchoMundo / 2,
        1,
        -(hs.y / 100) * 10 + 2
      );
      mesh.userData = { hotspotId: hs.id, tipo: hs.tipo };
      this.scene.add(mesh);
      this.hotspotMeshes.push(mesh);
    });
  }

  getHotspot3D(): { id: string; tipo: string; position: THREE.Vector3 }[] {
    return this.hotspotMeshes.map((m) => ({
      id: m.userData.hotspotId as string,
      tipo: m.userData.tipo as string,
      position: m.position.clone(),
    }));
  }

  getClickedHotspot(
    ray: THREE.Raycaster
  ): { id: string; tipo: string } | null {
    const intersects = ray.intersectObjects(this.hotspotMeshes);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      return {
        id: obj.userData.hotspotId as string,
        tipo: obj.userData.tipo as string,
      };
    }
    return null;
  }

  screenToRay(mouseX: number, mouseY: number): THREE.Raycaster {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((mouseX - rect.left) / rect.width) * 2 - 1;
    const y = -((mouseY - rect.top) / rect.height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    return raycaster;
  }

  getGroundIntersection(mouseX: number, mouseY: number): THREE.Vector3 | null {
    const ray = this.screenToRay(mouseX, mouseY);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.1);
    const intersection = new THREE.Vector3();
    ray.ray.intersectPlane(groundPlane, intersection);
    if (intersection) {
      return intersection;
    }
    return null;
  }

  private loop = (now: number) => {
    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    // Camera follows target with smooth lerp
    const camX = this.camera.position.x;
    const target = this.cameraTargetX;
    this.camera.position.x += (target - camX) * 0.05;
    this.camera.lookAt(this.cameraTargetX * 0.8 + 2, 1.2, 0);

    // Animate hotspot glow
    this.hotspotMeshes.forEach((m, i) => {
      const sc = 1 + Math.sin(now * 0.002 + i) * 0.3;
      m.scale.setScalar(sc);
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.15 + Math.sin(now * 0.003 + i) * 0.15;
    });

    // Update systems
    this.character.update(delta);
    this.snow?.update(delta);
    this.crowd?.update(delta);

    this.renderer.render(this.scene, this.camera);
    this.animFrame = requestAnimationFrame(this.loop);
  };

  private handleResize = () => {
    const canvas = this.renderer.domElement;
    const parent = canvas.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    this.renderer.setSize(w, h);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  };

  changeConfig(config: Partial<GameSceneConfig>) {
    Object.assign(this.config, config);
    if (config.colorFondo !== undefined) {
      this.setBackground(config.colorFondo);
    }
    if (config.nieve !== undefined) {
      if (config.nieve && !this.snow) {
        this.snow = new SnowParticles(this.scene);
      } else if (!config.nieve && this.snow) {
        this.snow.destroy();
        this.snow = null;
      }
    }
    if (config.multitud !== undefined) {
      if (config.multitud && !this.crowd) {
        this.crowd = new CrowdSystem(this.scene, 20);
      } else if (!config.multitud && this.crowd) {
        this.crowd.destroy();
        this.crowd = null;
      }
    }
    if (config.hora !== undefined) {
      if (config.hora === 'noche') {
        this.ambientLight.intensity = 0.25;
        this.dirLight.color.setHex(0x4466aa);
        this.dirLight.intensity = 0.6;
      } else if (config.hora === 'atardecer') {
        this.ambientLight.intensity = 0.35;
        this.dirLight.color.setHex(0xff8844);
        this.dirLight.intensity = 1.0;
      } else {
        this.ambientLight.intensity = 0.5;
        this.dirLight.color.setHex(0xffffcc);
        this.dirLight.intensity = 1.2;
      }
    }
  }

  destroy() {
    if (this.animFrame !== null) {
      cancelAnimationFrame(this.animFrame);
    }
    window.removeEventListener('resize', this.handleResize);
    this.snow?.destroy();
    this.crowd?.destroy();
    this.renderer.dispose();
    const parent = this.renderer.domElement.parentElement;
    if (parent) {
      parent.removeChild(this.renderer.domElement);
    }
  }
}
