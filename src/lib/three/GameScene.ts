// GameScene — Escena Three.js principal con iluminación corregida
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
  private hemiLight: THREE.HemisphereLight;
  private dirLight: THREE.DirectionalLight;
  private fillLight: THREE.DirectionalLight;
  private rimLight: THREE.DirectionalLight;
  private ground: THREE.Mesh;
  private animFrame: number | null = null;
  private lastTime = 0;
  private config: GameSceneConfig;
  private cameraTargetX = 0;
  private hotspotMeshes: THREE.Mesh[] = [];

  constructor(container: HTMLElement, config: GameSceneConfig) {
    this.config = config;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Usar Reinhard en vez de ACES — ACES oscurece demasiado las sombras
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    container.appendChild(this.renderer.domElement);

    // Scene
    this.scene = new THREE.Scene();
    this.setBackground(config.colorFondo ?? 0x1a1a2e);

    // Camera
    this.camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    this.camera.position.set(0, 5, 12);
    this.camera.lookAt(0, 0.5, 0);

    // ── LUCES ──────────────────────────────────────────────────────────
    const hora = config.hora ?? 'noche';

    // 1. Hemisphere light — luz ambiental desde arriba (cielo) y abajo (suelo)
    // Esto evita que las caras inferiores queden completamente negras
    if (hora === 'noche') {
      this.hemiLight = new THREE.HemisphereLight(0x446688, 0x222244, 0.6);
    } else if (hora === 'atardecer') {
      this.hemiLight = new THREE.HemisphereLight(0xff8844, 0x443322, 0.8);
    } else {
      this.hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x556677, 1.0);
    }
    this.scene.add(this.hemiLight);

    // 2. Ambient light — relleno suave general
    this.ambientLight = new THREE.AmbientLight(0x8888cc, 0.5);
    this.scene.add(this.ambientLight);

    // 3. Directional light — luz principal con sombras
    if (hora === 'noche') {
      this.dirLight = new THREE.DirectionalLight(0x8888ff, 1.8);
      this.ambientLight.intensity = 0.5;
    } else if (hora === 'atardecer') {
      this.dirLight = new THREE.DirectionalLight(0xff8844, 2.0);
      this.ambientLight.intensity = 0.6;
    } else {
      this.dirLight = new THREE.DirectionalLight(0xffffcc, 2.5);
      this.ambientLight.intensity = 0.7;
    }
    this.dirLight.position.set(8, 15, 10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 40;
    this.dirLight.shadow.camera.left = -25;
    this.dirLight.shadow.camera.right = 25;
    this.dirLight.shadow.camera.top = 25;
    this.dirLight.shadow.camera.bottom = -25;
    this.scene.add(this.dirLight);

    // 4. Fill light — contraluz lateral
    this.fillLight = new THREE.DirectionalLight(0xaaaaff, 0.6);
    this.fillLight.position.set(-6, 4, -4);
    this.scene.add(this.fillLight);

    // 5. Rim light — luz de borde desde atrás (muy importante para siluetas en escenas nocturnas)
    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    this.rimLight.position.set(0, 2, -10);
    this.scene.add(this.rimLight);

    // ── SUELO ──────────────────────────────────────────────────────────────
    // Suelo más claro con textura sutil de nieve/tierra
    const groundColor = config.colorSuelo ?? (hora === 'noche' ? 0x556677 : 0x667788);
    const groundGeo = new THREE.PlaneGeometry(config.anchoMundo + 20, 20);
    const groundMat = new THREE.MeshStandardMaterial({
      color: groundColor,
      roughness: 0.95,
      metalness: 0.0,
      emissive: new THREE.Color(groundColor).multiplyScalar(0.1), // leve emisión para que no sea negro puro
    });
    this.ground = new THREE.Mesh(groundGeo, groundMat);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.position.set(0, -0.05, -1);
    this.ground.receiveShadow = true;
    this.scene.add(this.ground);

    // ── NIEBLA ─────────────────────────────────────────────────────────────
    if (config.bruma !== false) {
      // Niebla mucho más sutil: density más bajo, color más claro
      const fogColor = config.colorFondo ?? 0x223355;
      this.scene.fog = new THREE.FogExp2(fogColor, 0.008);
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

    // Buildings / props
    this.createBuildings(config.anchoMundo);

    // Start loop
    this.lastTime = performance.now();
    this.loop(this.lastTime);
    window.addEventListener('resize', this.handleResize);
  }

  private createBuildings(worldWidth: number) {
    // Material de edificios más claro (antes era 0x2a2a3a — casi negro)
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x445566,
      roughness: 0.85,
      metalness: 0.1,
    });
    const windowMat = new THREE.MeshStandardMaterial({
      color: 0xffaa44,
      emissive: 0xffaa44,
      emissiveIntensity: 0.5, // más brillo
    });

    for (let x = -worldWidth / 2 + 2; x < worldWidth / 2 - 2; x += 2.5) {
      if (Math.random() > 0.65) continue;

      const h = 2.5 + Math.random() * 4;
      const building = new THREE.Mesh(new THREE.BoxGeometry(1.8, h, 1.5), buildingMat);
      building.position.set(x, h / 2, -4.5);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      // Windows
      if (Math.random() > 0.3) {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.35), windowMat);
        win.position.set(x, 1.2 + Math.random() * (h - 1.8), -3.7);
        this.scene.add(win);
      }
    }

    // Farolas (point lights tenues a lo largo de la calle)
    const lampMat = new THREE.MeshStandardMaterial({
      color: 0xffaa44,
      emissive: 0xffaa44,
      emissiveIntensity: 0.8,
    });
    for (let x = -worldWidth / 2 + 4; x < worldWidth / 2 - 4; x += 5) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.1, 6, 6), lampMat);
      lamp.position.set(x, 1.8, 0);
      this.scene.add(lamp);

      // Poste
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.05, 1.8, 4),
        new THREE.MeshStandardMaterial({ color: 0x333333 })
      );
      post.position.set(x, 0.9, 0);
      this.scene.add(post);
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
    this.hotspotMeshes.forEach((m) => { if (m.parent) m.parent.remove(m); });
    this.hotspotMeshes = [];

    const mat = new THREE.MeshStandardMaterial({
      color: 0xff6644,
      emissive: 0xff4400,
      emissiveIntensity: 0.4,
      transparent: true,
      opacity: 0.35,
    });

    hotspots.forEach((hs) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), mat);
      mesh.position.set(
        hs.x - this.config.anchoMundo / 2,
        1.2,
        -(hs.y / 100) * 10 + 2
      );
      mesh.userData = { hotspotId: hs.id, tipo: hs.tipo };
      this.scene.add(mesh);
      this.hotspotMeshes.push(mesh);
    });
  }

  getClickedHotspot(ray: THREE.Raycaster): { id: string; tipo: string } | null {
    const intersects = ray.intersectObjects(this.hotspotMeshes);
    if (intersects.length > 0) {
      const obj = intersects[0].object;
      return { id: obj.userData.hotspotId as string, tipo: obj.userData.tipo as string };
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
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.05);
    const intersection = new THREE.Vector3();
    if (ray.ray.intersectPlane(groundPlane, intersection)) {
      return intersection;
    }
    return null;
  }

  private loop = (now: number) => {
    const delta = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    // Cámara sigue al personaje
    const target = this.cameraTargetX;
    const camX = this.camera.position.x;
    this.camera.position.x += (target - camX) * 0.05;
    this.camera.lookAt(this.cameraTargetX * 0.8 + 2, 0.5, 0);

    // Hotspot glow pulsante
    this.hotspotMeshes.forEach((m, i) => {
      const sc = 1 + Math.sin(now * 0.002 + i) * 0.3;
      m.scale.setScalar(sc);
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
        0.25 + Math.sin(now * 0.003 + i) * 0.25;
    });

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
    if (config.colorFondo !== undefined) this.setBackground(config.colorFondo);
    if (config.nieve !== undefined) {
      if (config.nieve && !this.snow) this.snow = new SnowParticles(this.scene);
      else if (!config.nieve && this.snow) { this.snow.destroy(); this.snow = null; }
    }
    if (config.multitud !== undefined) {
      if (config.multitud && !this.crowd) this.crowd = new CrowdSystem(this.scene, 20);
      else if (!config.multitud && this.crowd) { this.crowd.destroy(); this.crowd = null; }
    }
    if (config.hora !== undefined) {
      if (config.hora === 'noche') {
        this.ambientLight.intensity = 0.5;
        this.dirLight.color.setHex(0x8888ff);
        this.dirLight.intensity = 1.8;
        this.hemiLight.color.setHex(0x446688);
        this.hemiLight.groundColor.setHex(0x222244);
        this.hemiLight.intensity = 0.6;
      } else if (config.hora === 'atardecer') {
        this.ambientLight.intensity = 0.6;
        this.dirLight.color.setHex(0xff8844);
        this.dirLight.intensity = 2.0;
        this.hemiLight.color.setHex(0xff8844);
        this.hemiLight.groundColor.setHex(0x443322);
        this.hemiLight.intensity = 0.8;
      } else {
        this.ambientLight.intensity = 0.7;
        this.dirLight.color.setHex(0xffffcc);
        this.dirLight.intensity = 2.5;
        this.hemiLight.color.setHex(0x87CEEB);
        this.hemiLight.groundColor.setHex(0x556677);
        this.hemiLight.intensity = 1.0;
      }
    }
  }

  destroy() {
    if (this.animFrame !== null) cancelAnimationFrame(this.animFrame);
    window.removeEventListener('resize', this.handleResize);
    this.snow?.destroy();
    this.crowd?.destroy();
    this.renderer.dispose();
    const parent = this.renderer.domElement.parentElement;
    if (parent) parent.removeChild(this.renderer.domElement);
  }
}
