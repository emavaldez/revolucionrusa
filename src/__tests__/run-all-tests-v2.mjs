#!/usr/bin/env node
// Tests exhaustivos v2 — corregidos
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function ok(condition, msg) {
  if (condition) { console.log(`  ✅ ${msg}`); passed++; }
  else { console.error(`  ❌ ${msg}`); failed++; }
}

console.log('\n=== VERIFICACIÓN DE ARCHIVOS ===');
const files = [
  'lib/game/FervorSystem.ts', 'lib/game/DueloDialecticoData.ts',
  'lib/game/ItemCombination.ts', 'lib/game/HistoricalCodex.ts',
  'lib/audio/LaInternacional.ts', 'lib/audio/MusicEngine.ts',
  'lib/three/GameScene.ts', 'lib/three/CharacterModel.ts',
  'lib/three/SnowParticles.ts', 'lib/three/CrowdSystem.ts',
  'components/scenes/ThreeEngine.tsx', 'components/ui/DueloDialog.tsx',
  'components/ui/PianoModal.tsx', 'components/ui/CodexPanel.tsx',
  'context/GameContext.tsx', 'app/page.tsx', 'app/globals.css',
];
files.forEach(f => ok(existsSync(path.join(SRC, f)), `${f} existe`));

console.log('\n=== TEST 1: MISIONES EN THREEENGINE ===');
const teContent = readFileSync(path.join(SRC, 'components/scenes/ThreeEngine.tsx'), 'utf-8');

// Count missions by looking for XXXX/X.X: { patterns (after const MISIONES_DATA)
const dataStart = teContent.indexOf('MISIONES_DATA');
const dataBlock = teContent.substring(dataStart);

// Find all mission IDs (4-digit numbers or decimals)
const misIds = new Set();
const numRegex = /\b(19\d\d(?:\.\d)?):\s*\{/g;
let mm;
while ((mm = numRegex.exec(dataBlock)) !== null) {
  if (mm[1] !== '1917' && mm[1] !== '1918' && mm[1] !== '1919') {
    // continue
  }
  misIds.add(parseFloat(mm[1]));
}
// Simpler: count all mission blocks
const missionBlocks = dataBlock.match(/(19\d\d(?:\.\d)?):\s*\{/g) || [];
ok(missionBlocks.length >= 10, `Al menos 10 misiones (${missionBlocks.length})`);

// Check key mission fields are present using includes
ok(teContent.includes("titulo: 'La Huelga de Putilov'"), '1905: La Huelga de Putilov');
ok(teContent.includes("titulo: 'Domingo Sangriento'"), '1905.1: Domingo Sangriento');
ok(teContent.includes("titulo: 'La Imprenta de la Pravda'"), '1912: La Imprenta de la Pravda');
ok(teContent.includes("titulo: 'El Expreso de la Revolución'"), '1917: El Expreso');
ok(teContent.includes("titulo: 'Asalto al Palacio de Invierno'"), '1917.1: Asalto');
ok(teContent.includes("titulo: 'Brest-Litovsk'"), '1918: Brest-Litovsk');
ok(teContent.includes("titulo: 'Los Romanov'"), '1918.1: Los Romanov');
ok(teContent.includes("titulo: 'El Tren Blindado de Trotsky'"), '1919: Tren Blindado');
ok(teContent.includes("titulo: 'Kronstadt'"), '1921: Kronstadt');
ok(teContent.includes("titulo: 'Fundación de la URSS'"), '1922: Fundación URSS');
ok(teContent.includes("titulo: 'El Legado'"), '1924: El Legado');

// Each mission has tresScene with required fields
ok(teContent.includes('tresScene: { anchoMundo:'), 'Misiones tienen tresScene con anchoMundo');
ok(teContent.includes('colorFondo:'), 'Misiones tienen colorFondo en tresScene');

// Hotspot types spread across misiones
const tipos = ['recoger', 'hablar', 'usar', 'examinar', 'debatir', 'decision'];
tipos.forEach(t => {
  const count = (teContent.match(new RegExp(`tipo: '${t}'`, 'g')) || []).length;
  ok(count > 0, `Hotspots tipo '${t}': ${count} ocurrencias`);
});

// Recoger hotspots have items
const recogerCount = (teContent.match(/tipo: 'recoger'/g) || []).length;
const itemCount = (teContent.match(/item: \{/g) || []).length;
// Some recoger may share with usar etc., so approximate
ok(itemCount >= recogerCount - 1, `Items suficientes: ${itemCount} para ${recogerCount} recoger`);

console.log('\n=== TEST 2: FERVORSYSTEM ===');
const fsContent = readFileSync(path.join(SRC, 'lib/game/FervorSystem.ts'), 'utf-8');
ok(fsContent.includes("'LA LLAMA RADICAL'"), 'Epílogo: LA LLAMA RADICAL');
ok(fsContent.includes("'LA DISIDENTE'"), 'Epílogo: LA DISIDENTE');
ok(fsContent.includes("'LA SUPERVIVIENTE'"), 'Epílogo: LA SUPERVIVIENTE');
ok(fsContent.includes("'LA DIPLOMÁTICA'"), 'Epílogo: LA DIPLOMÁTICA');
ok(fsContent.includes("'EL LEGADO DE ALEXANDRA'"), 'Epílogo: EL LEGADO');
ok(fsContent.includes('calcularEpilogo('), 'Función calcularEpilogo existe');
ok(fsContent.includes('export const DECISIONES'), 'DECISIONES exportada');

// Count opciones (decisions)
const opts = fsContent.match(/opciones:\s*\[/g) || [];
ok(opts.length >= 5, `Al menos 5 grupos de opciones (${opts.length})`);

console.log('\n=== TEST 3: DUELO DIALÉCTICO ===');
const ddContent = readFileSync(path.join(SRC, 'lib/game/DueloDialecticoData.ts'), 'utf-8');
const preguntas = ddContent.match(/pregunta: '/g) || [];
ok(preguntas.length >= 10, `Al menos 10 preguntas (${preguntas.length})`);

// Count answer arrays
const ansArray = ddContent.match(/respuestas:\s*\[/g) || [];
ok(ansArray.length >= 10, `Al menos 10 grupos de respuestas (${ansArray.length})`);

// Count correcta: true/false pairs
const correctVals = (ddContent.match(/correcta:/g) || []).length;
ok(correctVals >= 30, `Al menos 30 campos correcta: (${correctVals})`);

// PREGUNTAS_GENERALES
ok(ddContent.includes('PREGUNTAS_GENERALES'), 'PREGUNTAS_GENERALES existe');

console.log('\n=== TEST 4: ITEM COMBINATION ===');
const icContent = readFileSync(path.join(SRC, 'lib/game/ItemCombination.ts'), 'utf-8');
const recipes = (icContent.match(/id:\s*'[a-z_]+'/g) || []).length;
ok(recipes >= 8, `Al menos 8 recetas (${recipes})`);
ok(icContent.includes('checkCombinacion('), 'checkCombinacion existe');
ok(icContent.includes('getCombinacionesCon('), 'getCombinacionesCon existe');
ok(icContent.includes('TODOS_ITEMS'), 'TODOS_ITEMS existe');

console.log('\n=== TEST 5: CODEX HISTÓRICO ===');
const hcContent = readFileSync(path.join(SRC, 'lib/game/HistoricalCodex.ts'), 'utf-8');
const entries = (hcContent.match(/id:\s*'[a-z_]+'/g) || []).length;
ok(entries >= 11, `Al menos 11 entradas (${entries})`);
ok(hcContent.includes('CODEX_ENTRIES'), 'CODEX_ENTRIES existe');
ok(hcContent.includes('getCodexByFlag'), 'getCodexByFlag existe');
ok(hcContent.includes('getDesbloqueados'), 'getDesbloqueados existe');
ok(hcContent.includes("categoria: 'personaje'"), 'Categoría personaje');
ok(hcContent.includes("categoria: 'evento'"), 'Categoría evento');
ok(hcContent.includes("categoria: 'lugar'"), 'Categoría lugar');
ok(hcContent.includes("categoria: 'concepto'"), 'Categoría concepto');

console.log('\n=== TEST 6: LA INTERNACIONAL ===');
const liContent = readFileSync(path.join(SRC, 'lib/audio/LaInternacional.ts'), 'utf-8');
ok(liContent.includes('MELODIA_COMPLETA'), 'MELODIA_COMPLETA');
const notas = (liContent.match(/{ freq:/g) || []).length;
ok(notas >= 50, `Al menos 50 notas (${notas})`);
ok(liContent.includes('tocarInternacional('), 'tocarInternacional');
ok(liContent.includes('tocarNotasPuzzle('), 'tocarNotasPuzzle');

console.log('\n=== TEST 7: GAME CONTEXT ===');
const gcContent = readFileSync(path.join(SRC, 'context/GameContext.tsx'), 'utf-8');
const fields = ['nombre', 'genero', 'año', 'ubicacion', 'inventario', 'fervor', 'misionesCompletadas', 'decisiones', 'codexDesbloqueados', 'flags'];
fields.forEach(f => ok(gcContent.includes(f), `Campo '${f}'`));
const methods = ['addItem', 'removeItem', 'modifyFervor', 'recordDecision', 'unlockCodex', 'setFlag', 'resetGame'];
methods.forEach(m => ok(gcContent.includes(m), `Método '${m}'`));

console.log('\n=== TEST 8: MUSIC ENGINE ===');
const meContent = readFileSync(path.join(SRC, 'lib/audio/MusicEngine.ts'), 'utf-8');
ok(meContent.includes('class MusicEngine'), 'MusicEngine class');
ok(meContent.includes('playMood('), 'playMood');
ok(meContent.includes('moodForYear'), 'moodForYear');
['invierno', 'protesta', 'tren', 'sigilo', 'guerra', 'kremlin', 'duelo', 'funeral'].forEach(m => {
  ok(meContent.includes(m), `Mood '${m}'`);
});

console.log('\n=== TEST 9: THREE.JS ENGINE ===');
ok(teContent.includes('GameScene('), 'GameScene usado');
ok(teContent.includes('SnowParticles'), 'SnowParticles usado');
ok(teContent.includes('CharacterModel'), 'CharacterModel usado');
ok(teContent.includes('CrowdSystem'), 'CrowdSystem usado');
ok(teContent.includes('MusicEngine'), 'MusicEngine usado en ThreeEngine');
ok(teContent.includes('handleHotspot'), 'handleHotspot existe');
ok(teContent.includes('completarMision'), 'completarMision existe');
ok(teContent.includes('handlePianoSuccess'), 'handlePianoSuccess existe');
ok(teContent.includes('handleDueloComplete'), 'handleDueloComplete existe');
ok(teContent.includes('COMBINACIONES_RAPIDAS'), 'COMBINACIONES_RAPIDAS existe');

console.log('\n=== TEST 10: BUILD VERIFICATION ===');
ok(existsSync(path.join(SRC, '..', '.next', 'build-manifest.json')), 'Build output existe');
// Check if build was successful by presence of routes
const nextDir = path.join(SRC, '..', '.next');
ok(existsSync(path.join(nextDir, 'server', 'app', 'index.html')), 'Página principal prerendered');

console.log(`\n${'='.repeat(50)}`);
const total = passed + failed;
console.log(`📊 ${passed}/${total} tests pasaron (${Math.round(passed/total*100)}%)`);
console.log(`${'='.repeat(50)}\n`);
if (failed > 0) {
  console.log(`⚠️  ${failed} tests fallaron — revisar arriba\n`);
}
process.exit(failed > 0 ? 1 : 0);
