// GameScene — Escena Three.js principal con iluminación corregida
import * as THREE from 'three';
import { SnowParticles } from './SnowParticles';
import { CharacterModel } from './CharacterModel';
import { CrowdSystem } from './CrowdSystem';
import { crearProp, hotspotToProp } from './PropFactory';

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

    // Character — empieza a la izquierda del mundo
    this.character = new CharacterModel();
    this.character.setPosition(-config.anchoMundo / 2 + 4, 0);
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
    // ── CARGAR TEXTURAS CC0 (brick, stone, wood) ──
    // Fallback a colores sólidos si falla la carga
    const texLoader = new THREE.TextureLoader();

    function loadTex(path: string, repeatX: number, repeatY: number): THREE.Texture | null {
      try {
        const tex = texLoader.load(path);
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);
        tex.anisotropy = 4;
        return tex;
      } catch {
        return null;
      }
    }

    const brickTex = loadTex('/textures/brick.webp', 2, 3);
    const stoneTex = loadTex('/textures/stone.webp', 2, 2);
    const woodTex  = loadTex('/textures/wood.webp', 1, 2);

    // Fallback colors por si las texturas no cargan
    const brickColor  = 0x8c7e55; // ladrillo rojizo
    const stoneColor  = 0x67594b; // piedra gris
    const woodColor   = 0x5a3e2b; // madera oscura
    const roofColor   = 0x556644;

    function matWithTex(tex: THREE.Texture | null, fallbackColor: number, roughness = 0.85, metalness = 0.1) {
      return new THREE.MeshStandardMaterial({
        map: tex ?? undefined,
        color: tex ? 0xffffff : fallbackColor,
        roughness,
        metalness,
      });
    }

    const buildingMat = matWithTex(brickTex, brickColor, 0.85, 0.1);
    const darkMat     = matWithTex(null,    0x445566, 0.85, 0.05);
    const warmMat     = matWithTex(stoneTex, stoneColor, 0.9, 0.0);
    const churchMat   = matWithTex(stoneTex, 0x779988, 0.8, 0.0);
    const roofMat     = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.9 });

    const winMat = new THREE.MeshStandardMaterial({
      color: 0xffaa44, emissive: 0xffaa44, emissiveIntensity: 0.6,
    });
    const paleWinMat = new THREE.MeshStandardMaterial({
      color: 0x88ccff, emissive: 0x4488cc, emissiveIntensity: 0.3,
    });

    // ── IGLESIA ORTODOXA (cúpula de cebolla) ──
    // Se coloca a la derecha del mundo
    const churchX = worldWidth / 2 - 8;
    const churchBody = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 3.0, 2.0),
      churchMat
    );
    churchBody.position.set(churchX, 1.5, -4);
    churchBody.castShadow = true;
    this.scene.add(churchBody);

    // Cúpula de cebolla (dos esferas achatadas apiladas)
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x88AA88, roughness: 0.6, metalness: 0.3 });
    const domeBase = new THREE.Mesh(new THREE.SphereGeometry(0.8, 10, 8), domeMat);
    domeBase.scale.set(1, 0.4, 1);
    domeBase.position.set(churchX, 3.3, -4);
    this.scene.add(domeBase);

    const domeTop = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), domeMat);
    domeTop.scale.set(1, 0.5, 1);
    domeTop.position.set(churchX, 3.8, -4);
    this.scene.add(domeTop);

    // Cruz en la punta
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xDDAA44, metalness: 0.8 });
    const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.25, 0.03), crossMat);
    crossV.position.set(churchX, 4.2, -4);
    this.scene.add(crossV);
    const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.03), crossMat);
    crossH.position.set(churchX, 4.15, -4);
    this.scene.add(crossH);

    // ── EDIFICIOS PRINCIPALES ──
    let buildingIndex = 0;
    for (let x = -worldWidth / 2 + 3; x < worldWidth / 2 - 3; x += 2.8) {
      if (Math.random() > 0.6) continue;
      buildingIndex++;

      const mat = buildingIndex % 3 === 0 ? darkMat : buildingIndex % 3 === 1 ? buildingMat : warmMat;
      const h = 2.5 + Math.random() * 5;
      const w = 1.5 + Math.random() * 0.8;
      const d = 1.2 + Math.random() * 0.8;

      const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      building.position.set(x, h / 2, -4.5);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      // Ventanas en dos filas
      const winRows = Math.floor(h / 1.2);
      for (let row = 0; row < winRows; row++) {
        for (let col = -1; col <= 1; col++) {
          if (Math.random() > 0.5) continue;
          const wMat = Math.random() > 0.3 ? winMat : paleWinMat;
          const win = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.22), wMat);
          win.position.set(
            x + col * 0.35,
            0.8 + row * 1.0 + Math.random() * 0.2,
            -4.5 + d / 2 + 0.01
          );
          this.scene.add(win);
        }
      }

      // Techo a dos aguas (para dar variedad)
      if (Math.random() > 0.5 && h > 3) {
        const roof = new THREE.Mesh(
          new THREE.ConeGeometry(w * 0.7, 0.6, 4),
          roofMat
        );
        roof.position.set(x, h + 0.3, -4.5);
        roof.rotation.y = Math.PI / 4;
        this.scene.add(roof);
      }
    }

    // ── CHIMENEAS DE FÁBRICA (Putilov) ──
    const chimneyMat = matWithTex(brickTex, 0x554433, 0.95, 0.0);
    for (let i = 0; i < 3; i++) {
      const chX = -worldWidth / 2 + 2 + i * 1.5;
      const chimney = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 3.5, 8), chimneyMat);
      chimney.position.set(chX, 1.75, -4);
      this.scene.add(chimney);

      // Humo (esferas semitransparentes)
      if (Math.random() > 0.3) {
        const smokeMat = new THREE.MeshStandardMaterial({
          color: 0x889999, transparent: true, opacity: 0.15,
        });
        const smoke = new THREE.Mesh(new THREE.SphereGeometry(0.2, 6, 6), smokeMat);
        smoke.position.set(chX, 3.8 + Math.random() * 0.5, -4);
        this.scene.add(smoke);
      }
    }

    // ── FAROLAS A GAS (1905 — San Petersburgo) ──
    const vidrioGas = new THREE.MeshStandardMaterial({ color: 0x88bbcc, roughness: 0.1, transparent: true, opacity: 0.5 });
    const llamaGas = new THREE.MeshStandardMaterial({ color: 0xff6633, emissive: 0xff4400, emissiveIntensity: 0.3 });
    const postMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    for (let x = -worldWidth / 2 + 4; x < worldWidth / 2 - 4; x += 6) {
      if (Math.random() > 0.7) continue;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 1.8, 6), postMat);
      post.position.set(x, 0.9, 0);
      this.scene.add(post);
      // Caja de vidrio del farol
      const caja = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.08), vidrioGas);
      caja.position.set(x, 1.85, 0);
      this.scene.add(caja);
      // Llama
      const llama = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), llamaGas);
      llama.position.set(x, 1.85, 0);
      this.scene.add(llama);
    }

    // ── CERCA / REJA ──
    const fenceMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });
    for (let x = -worldWidth / 2 + 2; x < worldWidth / 2 - 2; x += 1.5) {
      if (Math.random() > 0.5) continue;
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.4, 0.03), fenceMat);
      bar.position.set(x, 0.2, 2.5);
      this.scene.add(bar);
    }

    // ── ÁRBOLES (esferas verdes) ──
    const treeMat = new THREE.MeshStandardMaterial({ color: 0x334433, roughness: 0.95 });
    const trunkMat = matWithTex(woodTex, 0x443322, 0.95, 0.0);
    for (let x = -worldWidth / 2 + 6; x < worldWidth / 2 - 6; x += 4) {
      if (Math.random() > 0.6) continue;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.5, 6), trunkMat);
      trunk.position.set(x, 0.25, 3.5);
      this.scene.add(trunk);
      const foliage = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), treeMat);
      foliage.position.set(x, 0.7, 3.5);
      this.scene.add(foliage);
    }
  }

  private setBackground(color: number) {
    this.scene.background = new THREE.Color(color);
    if (this.scene.fog instanceof THREE.FogExp2) {
      this.scene.fog.color.setHex(color);
    }
  }

  setCameraTarget(x: number) {
    const halfWorld = this.config.anchoMundo / 2;
    this.cameraTargetX = Math.max(-halfWorld + 8, Math.min(x, halfWorld - 8));
  }

  setHotspots(hotspots: { x: number; y: number; tipo: string; id: string; itemId?: string; label?: string }[]) {
    this.hotspotMeshes.forEach((m) => { if (m.parent) m.parent.remove(m); });
    this.hotspotMeshes = [];

    hotspots.forEach((hs) => {
      const propTipo = hotspotToProp(hs.tipo, hs.itemId, hs.label);
      const propGroup = crearProp(propTipo, hs.label);

      // hs.x y hs.y vienen en coordenadas mundiales desde ThreeEngine
      propGroup.position.set(hs.x, 0, hs.y);

      // Escalar NPCs para que coincidan con el personaje principal
      if (hs.tipo === 'hablar' || hs.tipo === 'debatir') {
        propGroup.scale.setScalar(0.7);
      }

      // Aro indicador tenue bajo cada prop
      const ringGeo = new THREE.RingGeometry(0.25, 0.35, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xff6644,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      propGroup.add(ring);

      (propGroup as any).__ring = ring;
      (propGroup as any).__ringTimer = Math.random() * 100;

      propGroup.userData = { hotspotId: hs.id, tipo: hs.tipo };
      this.scene.add(propGroup);
      this.hotspotMeshes.push(propGroup as any);
    });
  }

  getClickedHotspot(ray: THREE.Raycaster): { id: string; tipo: string } | null {
    const meshes: THREE.Object3D[] = [];
    this.hotspotMeshes.forEach((group) => {
      group.traverse((child) => {
        if (child.type === 'Mesh') meshes.push(child);
      });
    });
    const intersects = ray.intersectObjects(meshes);
    if (intersects.length > 0) {
      // Walk up to find the group's userData
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj) {
        if (obj.userData.hotspotId) {
          return { id: obj.userData.hotspotId as string, tipo: obj.userData.tipo as string };
        }
        obj = obj.parent;
      }
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

    // Cámara sigue al personaje con interpolación suave (lerp más lento)
    const target = this.cameraTargetX;
    const camX = this.camera.position.x;
    // lerp con factor bajo para movimiento muy suave
    this.camera.position.x += (target - camX) * 0.02;
    this.camera.lookAt(this.cameraTargetX * 0.6 + 2, 0.5, 0);

    // Animate hotspot glow
    this.hotspotMeshes.forEach((m, i) => {
      const ring = (m as any).__ring;
      if (ring) {
        const t = (now + i * 300) * 0.002;
        const scale = 1 + Math.sin(t) * 0.2;
        ring.scale.setScalar(scale);
        ring.material.opacity = 0.15 + Math.sin(t) * 0.15;
      }
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
