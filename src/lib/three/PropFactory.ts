// PropFactory — Genera modelos 3D simples para objetos y NPCs del juego
import * as THREE from 'three';

// ── MATERIALES COMPARTIDOS ────────────────────────────────────────────
const matPapel = new THREE.MeshStandardMaterial({ color: 0xe8dcc8, roughness: 0.8 });
const matMetal = new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.6, metalness: 0.4 });
const madera = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.9 });
const matVidrio = new THREE.MeshStandardMaterial({ color: 0x88bbcc, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.6 });
const matPiel = new THREE.MeshStandardMaterial({ color: 0xE8B89D, roughness: 0.7 });
const telaAzul = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.85 });
const telaRoja = new THREE.MeshStandardMaterial({ color: 0xbe1111, roughness: 0.75 });
const telaMarron = new THREE.MeshStandardMaterial({ color: 0x6B4423, roughness: 0.9 });
const matPan = new THREE.MeshStandardMaterial({ color: 0xC4A35A, roughness: 0.95 });
const matCarbon = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 1.0 });
const matGrasa = new THREE.MeshStandardMaterial({ color: 0xDDCC88, roughness: 0.9 });
const matBotella = new THREE.MeshStandardMaterial({ color: 0x88BB66, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.7 });
const matSello = new THREE.MeshStandardMaterial({ color: 0xCD853F, roughness: 0.5, metalness: 0.7 });
const matTiza = new THREE.MeshStandardMaterial({ color: 0xF5F5F0, roughness: 0.9 });
const matLlave = new THREE.MeshStandardMaterial({ color: 0x777788, roughness: 0.5, metalness: 0.8 });
const matPartitura = new THREE.MeshStandardMaterial({ color: 0xF5E6C8, roughness: 0.7 });
const matFoto = new THREE.MeshStandardMaterial({ color: 0xCCBB99, roughness: 0.6 });
const matBandera = new THREE.MeshStandardMaterial({ color: 0xbe1111, roughness: 0.7 });
const matTinta = new THREE.MeshStandardMaterial({ color: 0x330000, roughness: 0.8 });

export type PropTipo =
  | 'npc' | 'npc_mujer' | 'npc_obrero' | 'npc_capataz'
  | 'volante' | 'pan' | 'caldera' | 'puerta' | 'engranaje'
  | 'grasa' | 'schnapps' | 'sello' | 'tiza' | 'racion'
  | 'carbon' | 'botella_vacia' | 'partitura' | 'piano'
  | 'foto' | 'documentos' | 'llave_inglesa' | 'mapa'
  | 'tintero' | 'bandera' | 'mesa' | 'reloj' | 'farol'
  | 'monumento' | 'caja' | 'generic' | 'generic_peq' | 'generic_grande';

// ── GENERADOR PRINCIPAL ───────────────────────────────────────────────
export function crearProp(tipo: PropTipo, label?: string): THREE.Group {
  const grupo = new THREE.Group();

  switch (tipo) {
    // ── NPCs ─────────────────────────────────────────────────────────
    case 'npc': {
      construirHumanoide(grupo, telaMarron, telaAzul, matPiel);
      break;
    }
    case 'npc_mujer': {
      const bufMat = new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.85 });
      construirHumanoide(grupo, bufMat, telaRoja, matPiel);
      // Pañuelo extra
      const buf = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 6, 10, Math.PI), telaRoja);
      buf.position.set(0, 1.35, 0);
      buf.rotation.x = Math.PI;
      grupo.add(buf);
      break;
    }
    case 'npc_obrero': {
      const overol = new THREE.MeshStandardMaterial({ color: 0x334466, roughness: 0.9 });
      construirHumanoide(grupo, overol, overol, matPiel);
      // Gorra
      const gorra = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.08, 8), overol);
      gorra.position.set(0, 1.65, 0);
      grupo.add(gorra);
      break;
    }
    case 'npc_capataz': {
      const chaleco = new THREE.MeshStandardMaterial({ color: 0x553322, roughness: 0.8 });
      construirHumanoide(grupo, telaMarron, chaleco, matPiel);
      // Sombrero
      const sombrero = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.25, 0.1, 8), telaMarron);
      sombrero.position.set(0, 1.68, 0);
      grupo.add(sombrero);
      break;
    }

    // ── OBJETOS ──────────────────────────────────────────────────────
    case 'volante': {
      const papel = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.7), matPapel);
      papel.position.y = 0.1;
      papel.rotation.x = Math.random() * 0.3;
      papel.rotation.z = Math.random() * 0.3;
      grupo.add(papel);
      break;
    }
    case 'pan': {
      const esf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), matPan);
      esf.scale.set(1, 0.7, 1);
      esf.position.y = 0.2;
      grupo.add(esf);
      break;
    }
    case 'caldera': {
      const cil = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.8, 10), matMetal);
      cil.position.y = 0.4;
      grupo.add(cil);
      const remache = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshStandardMaterial({ color: 0x666677, metalness: 0.6 }));
      for (let i = 0; i < 6; i++) {
        const r = remache.clone();
        const ang = (i / 6) * Math.PI * 2;
        r.position.set(Math.cos(ang) * 0.4, 0.4 + Math.random() * 0.3, Math.sin(ang) * 0.4);
        grupo.add(r);
      }
      break;
    }
    case 'puerta': {
      const marco = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.1), madera);
      marco.position.y = 0.5;
      grupo.add(marco);
      const manija = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 6), new THREE.MeshStandardMaterial({ color: 0xDDAA44, metalness: 0.8 }));
      manija.position.set(0.2, 0.4, 0.06);
      grupo.add(manija);
      break;
    }
    case 'engranaje': {
      const eng = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12), matMetal);
      eng.position.y = 0.3;
      grupo.add(eng);
      for (let i = 0; i < 6; i++) {
        const d = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.12), matMetal);
        const ang = (i / 6) * Math.PI * 2;
        d.position.set(Math.cos(ang) * 0.3, 0.3, Math.sin(ang) * 0.3);
        grupo.add(d);
      }
      break;
    }
    case 'grasa': {
      const lata = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.2, 8), matGrasa);
      lata.position.y = 0.15;
      grupo.add(lata);
      break;
    }
    case 'schnapps': {
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.06, 0.25, 8), matBotella);
      body.position.y = 0.2;
      grupo.add(body);
      const cuello = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.08, 6), matBotella);
      cuello.position.y = 0.38;
      grupo.add(cuello);
      break;
    }
    case 'sello': {
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 8), matSello);
      base.position.y = 0.08;
      grupo.add(base);
      const asa = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.02, 6, 8), matSello);
      asa.position.y = 0.16;
      asa.rotation.x = Math.PI / 2;
      grupo.add(asa);
      break;
    }
    case 'tiza': {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.15, 6), matTiza);
      t.position.y = 0.1;
      t.rotation.x = Math.random() * 0.2;
      t.rotation.z = Math.random() * 0.2;
      grupo.add(t);
      break;
    }
    case 'racion': {
      const lata = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.15, 8), new THREE.MeshStandardMaterial({ color: 0x556644, roughness: 0.8 }));
      lata.position.y = 0.12;
      grupo.add(lata);
      break;
    }
    case 'carbon': {
      const c = new THREE.Mesh(new THREE.DodecahedronGeometry(0.08), matCarbon);
      c.position.y = 0.1;
      c.rotation.set(Math.random(), Math.random(), Math.random());
      grupo.add(c);
      break;
    }
    case 'botella_vacia': {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.2, 8), matVidrio);
      b.position.y = 0.15;
      grupo.add(b);
      break;
    }
    case 'partitura': {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35), matPartitura);
      p.position.y = 0.2;
      p.rotation.x = -Math.PI / 2.5;
      grupo.add(p);
      const lineas = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.25), new THREE.MeshBasicMaterial({ color: 0x886644, transparent: true, opacity: 0.3 }));
      lineas.position.y = 0.01;
      lineas.position.z = 0.05;
      lineas.rotation.x = -Math.PI / 2.5;
      grupo.add(lineas);
      break;
    }
    case 'piano': {
      const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.4), new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 }));
      cuerpo.position.y = 0.2;
      grupo.add(cuerpo);
      // Teclas
      for (let i = 0; i < 7; i++) {
        const tecla = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.15), new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xFFFFFF : 0x111111 }));
        tecla.position.set(-0.3 + i * 0.09, 0.36, 0.1);
        grupo.add(tecla);
      }
      break;
    }
    case 'foto': {
      const f = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.2, 0.02), matFoto);
      f.position.y = 0.15;
      grupo.add(f);
      break;
    }
    case 'documentos': {
      const d = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.4), matPapel);
      d.position.y = 0.1;
      d.rotation.x = Math.random() * 0.1;
      grupo.add(d);
      break;
    }
    case 'llave_inglesa': {
      const mango = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.02, 0.25, 6), matLlave);
      mango.rotation.z = Math.PI / 2;
      mango.position.y = 0.1;
      grupo.add(mango);
      break;
    }
    case 'mapa': {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.02, 0.45), matPapel);
      m.position.y = 0.05;
      grupo.add(m);
      break;
    }
    case 'tintero': {
      const tin = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.1, 8), matTinta);
      tin.position.y = 0.08;
      grupo.add(tin);
      break;
    }
    case 'bandera': {
      const asta = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x553322 }));
      asta.position.y = 0.4;
      grupo.add(asta);
      const tela = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), matBandera);
      tela.position.set(0.15, 0.6, 0);
      grupo.add(tela);
      break;
    }
    case 'mesa': {
      const tablero = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.04, 0.4), madera);
      tablero.position.y = 0.5;
      grupo.add(tablero);
      for (let i = 0; i < 4; i++) {
        const pata = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.48, 4), madera);
        pata.position.set(i % 2 === 0 ? -0.25 : 0.25, 0.24, i < 2 ? -0.15 : 0.15);
        grupo.add(pata);
      }
      break;
    }
    case 'reloj': {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0xCD853F, metalness: 0.6 }));
      r.position.y = 0.5;
      grupo.add(r);
      const esfera = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), new THREE.MeshStandardMaterial({ color: 0xFFF8E7 }));
      esfera.position.y = 0.52;
      grupo.add(esfera);
      break;
    }
    case 'farol': {
      const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.8, 6), new THREE.MeshStandardMaterial({ color: 0x333333 }));
      poste.position.y = 0.4;
      grupo.add(poste);
      const luz = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), new THREE.MeshStandardMaterial({
        color: 0xffaa44, emissive: 0xffaa44, emissiveIntensity: 0.6
      }));
      luz.position.y = 0.85;
      grupo.add(luz);
      break;
    }
    case 'monumento': {
      const base = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.6), new THREE.MeshStandardMaterial({ color: 0x888899, roughness: 0.6 }));
      base.position.y = 0.05;
      grupo.add(base);
      const estela = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.7, 0.2), new THREE.MeshStandardMaterial({ color: 0x999AAA, roughness: 0.5 }));
      estela.position.y = 0.45;
      grupo.add(estela);
      break;
    }
    case 'caja': {
      const c = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), madera);
      c.position.y = 0.1;
      grupo.add(c);
      break;
    }
    case 'generic_grande': {
      const g = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.8 }));
      g.position.y = 0.25;
      grupo.add(g);
      break;
    }
    case 'generic_peq': {
      const g = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.1, 0.15), new THREE.MeshStandardMaterial({ color: 0x667788, roughness: 0.7 }));
      g.position.y = 0.05;
      grupo.add(g);
      break;
    }
    default: {
      const g = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.15, 0.2), new THREE.MeshStandardMaterial({ color: 0x778899, roughness: 0.7 }));
      g.position.y = 0.1;
      grupo.add(g);
    }
  }

  return grupo;
}

// ── MAPEAR hotspot tipo/itemId a PropTipo ────────────────────────────
export function hotspotToProp(
  tipo: string,
  itemId?: string,
  label?: string
): PropTipo {
  if (tipo === 'hablar' || tipo === 'debatir') {
    if (label?.toLowerCase().includes('capataz')) return 'npc_capataz';
    if (label?.toLowerCase().includes('obrero')) return 'npc_obrero';
    if (label?.toLowerCase().includes('mujer') || label?.toLowerCase().includes('kollontai')) return 'npc_mujer';
    if (label?.toLowerCase().includes('trotsky') || label?.toLowerCase().includes('lenin')) return 'npc';
    return 'npc';
  }
  if (tipo === 'recoger') {
    switch (itemId) {
      case 'volante': return 'volante';
      case 'pan_duro': return 'pan';
      case 'grasa': return 'grasa';
      case 'schnapps': return 'schnapps';
      case 'sello': return 'sello';
      case 'tiza': return 'tiza';
      case 'raciones': return 'racion';
      case 'carbon': return 'carbon';
      case 'botella_vacia': return 'botella_vacia';
      case 'partitura_rota': return 'partitura';
      case 'foto': return 'foto';
      case 'documentos': return 'documentos';
      case 'llave_inglesa': return 'llave_inglesa';
      case 'mapa': return 'mapa';
      case 'tinta': return 'tintero';
      default: return 'generic_peq';
    }
  }
  if (tipo === 'usar') {
    if (label?.toLowerCase().includes('puerta')) return 'puerta';
    if (label?.toLowerCase().includes('engranaje')) return 'engranaje';
    if (label?.toLowerCase().includes('piano')) return 'piano';
    if (label?.toLowerCase().includes('mesa')) return 'mesa';
    if (label?.toLowerCase().includes('reloj')) return 'reloj';
    if (label?.toLowerCase().includes('farol')) return 'farol';
    if (label?.toLowerCase().includes('caldera')) return 'caldera';
    if (label?.toLowerCase().includes('monumento') || label?.toLowerCase().includes('mausoleo')) return 'monumento';
    if (label?.toLowerCase().includes('caja')) return 'caja';
    if (label?.toLowerCase().includes('bandera')) return 'bandera';
    return 'generic';
  }
  if (tipo === 'examinar') {
    if (label?.toLowerCase().includes('caldera')) return 'caldera';
    if (label?.toLowerCase().includes('monumento') || label?.toLowerCase().includes('mausoleo')) return 'monumento';
    if (label?.toLowerCase().includes('palacio')) return 'generic_grande';
    if (label?.toLowerCase().includes('mapa') || label?.toLowerCase().includes('carta')) return 'documentos';
    if (label?.toLowerCase().includes('bandera')) return 'bandera';
    if (label?.toLowerCase().includes('nieve')) return 'generic_peq';
    if (label?.toLowerCase().includes('tren')) return 'generic_grande';
    return 'generic';
  }
  if (tipo === 'decision') {
    // Las decisiones son eventos, no objetos físicos — usar marcador
    return 'generic';
  }
  return 'generic';
}

// ── Helper: construir humanoide genérico ─────────────────────────────
function construirHumanoide(
  grupo: THREE.Group,
  matCuerpo: THREE.MeshStandardMaterial,
  matRopa: THREE.MeshStandardMaterial,
  matPielMat: THREE.MeshStandardMaterial
) {
  // Cuerpo
  const cuerpo = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.5, 8), matCuerpo);
  cuerpo.position.y = 0.65;
  cuerpo.castShadow = true;
  grupo.add(cuerpo);

  // Cabeza
  const cabeza = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), matPielMat);
  cabeza.position.y = 1.0;
  cabeza.castShadow = true;
  grupo.add(cabeza);

  // Brazos
  const brazoIzq = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.25, 6), matCuerpo);
  brazoIzq.position.set(-0.25, 0.7, 0);
  brazoIzq.rotation.z = 0.2;
  grupo.add(brazoIzq);

  const brazoDer = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.25, 6), matCuerpo);
  brazoDer.position.set(0.25, 0.7, 0);
  brazoDer.rotation.z = -0.2;
  grupo.add(brazoDer);

  // Piernas
  const piernaIzq = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 6), matRopa);
  piernaIzq.position.set(-0.08, 0.1, 0);
  grupo.add(piernaIzq);

  const piernaDer = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.2, 6), matRopa);
  piernaDer.position.set(0.08, 0.1, 0);
  grupo.add(piernaDer);

  // Ojos
  const ojoMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
  const ojoD = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), ojoMat);
  ojoD.position.set(-0.04, 1.04, 0.14);
  grupo.add(ojoD);
  const ojoI = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), ojoMat);
  ojoI.position.set(0.04, 1.04, 0.14);
  grupo.add(ojoI);
}
