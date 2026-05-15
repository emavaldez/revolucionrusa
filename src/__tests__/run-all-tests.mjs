#!/usr/bin/env node
// Tests exhaustivos para el juego Revolución Rusa
// Corre con: node src/__tests__/run-all-tests.mjs

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  } else {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  }
}

function assertEq(actual, expected, message) {
  if (actual !== expected) {
    console.error(`  ❌ FAIL: ${message}`);
    console.error(`     Expected: ${JSON.stringify(expected)}`);
    console.error(`     Actual:   ${JSON.stringify(actual)}`);
    failed++;
  } else {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  }
}

// ─────────────────────────────────────────────
// Cargar módulos del juego
// ─────────────────────────────────────────────
const gameFiles = [
  'lib/game/FervorSystem.ts',
  'lib/game/DueloDialecticoData.ts',
  'lib/game/ItemCombination.ts',
  'lib/game/HistoricalCodex.ts',
  'lib/audio/LaInternacional.ts',
  'lib/audio/MusicEngine.ts',
];

console.log('\n📂 Verificando existencia de archivos del juego...');
gameFiles.forEach((f) => {
  const fp = path.join(SRC, f);
  assert(existsSync(fp), `Archivo existe: ${f}`);
});

console.log('\n📂 Verificando archivos de componentes...');
const componentFiles = [
  'components/scenes/ThreeEngine.tsx',
  'components/ui/DueloDialog.tsx',
  'components/ui/PianoModal.tsx',
  'components/ui/CodexPanel.tsx',
  'context/GameContext.tsx',
  'app/page.tsx',
];
componentFiles.forEach((f) => {
  const fp = path.join(SRC, f);
  assert(existsSync(fp), `Archivo existe: ${f}`);
});

// ─────────────────────────────────────────────
// Test 1: ThreeEngine Mission Data Structure
// ─────────────────────────────────────────────
console.log('\n🎯 Test 1: Estructura de Misiones en ThreeEngine');

const threeEngineContent = readFileSync(
  path.join(SRC, 'components/scenes/ThreeEngine.tsx'),
  'utf-8'
);

// Extract mission IDs from MISIONES_DATA
const missionIds = [];
const missionRegex = /(\d+(?:\.\d+)?):\s*\{/g;
let m;
while ((m = missionRegex.exec(threeEngineContent)) !== null) {
  const id = parseFloat(m[1]);
  if (id >= 1900) missionIds.push(id);
}

assert(missionIds.length >= 10, `Al menos 10 misiones definidas (tiene ${missionIds.length})`);
assert(missionIds.includes(1905), 'Misión 1905 existe');
assert(missionIds.includes(1912), 'Misión 1912 existe');
assert(missionIds.includes(1917), 'Misión 1917 existe');
assert(missionIds.includes(1917.1), 'Misión 1917.1 existe');
assert(missionIds.includes(1918), 'Misión 1918 existe');
assert(missionIds.includes(1919), 'Misión 1919 existe');
assert(missionIds.includes(1921), 'Misión 1921 existe');
assert(missionIds.includes(1922), 'Misión 1922 existe');
assert(missionIds.includes(1924), 'Misión 1924 existe');

// Each mission should have titulo, año, ubicacion, descripcion, tresScene, hotspots
for (const id of missionIds) {
  // Extract mission block
  const blockStart = threeEngineContent.indexOf(`${id}: {`);
  const blockEnd = threeEngineContent.indexOf('},', blockStart) + 2;
  const block = threeEngineContent.substring(blockStart, blockEnd);

  assert(block.includes('titulo:'), `Misión ${id}: tiene titulo`);
  assert(block.includes('año:'), `Misión ${id}: tiene año`);
  assert(block.includes('ubicacion:'), `Misión ${id}: tiene ubicacion`);
  assert(block.includes('descripcion:'), `Misión ${id}: tiene descripcion`);
  assert(block.includes('anchoMundo:'), `Misión ${id}: tiene anchoMundo`);
  assert(block.includes('tresScene:'), `Misión ${id}: tiene tresScene`);
  assert(block.includes('hotspots:'), `Misión ${id}: tiene hotspots`);
  assert(block.includes('pista:'), `Misión ${id}: tiene pista`);

  // Count hotspots for each mission
  const hsCount = (block.match(/id: '/g) || []).length;
  assert(hsCount >= 3, `Misión ${id}: al menos 3 hotspots (tiene ${hsCount})`);
}

// ─────────────────────────────────────────────
// Test 2: Hotspot types and valid structure
// ─────────────────────────────────────────────
console.log('\n🎯 Test 2: Validación de Hotspots por misión');

const allowedTypes = ['recoger', 'hablar', 'usar', 'examinar', 'debatir', 'decision'];
const tipoRegex = /tipo:\s*'(\w+)'/g;

let tipoCounts = {};
while ((m = tipoRegex.exec(threeEngineContent)) !== null) {
  tipoCounts[m[1]] = (tipoCounts[m[1]] || 0) + 1;
}

for (const tipo of allowedTypes) {
  assert(
    tipoCounts[tipo] > 0,
    `Hotspots de tipo '${tipo}' existen (${tipoCounts[tipo] || 0} encontrados)`
  );
}

// Check recoger hotspots have items
const recogerCount = (threeEngineContent.match(/tipo: 'recoger'/g) || []).length;
const itemCount = (threeEngineContent.match(/item:\s*\{/g) || []).length;
assert(itemCount >= recogerCount, `Todos los hotspots 'recoger' tienen item (${itemCount} items para ${recogerCount} recoger)`);

// ─────────────────────────────────────────────
// Test 3: Decisiones en FervorSystem
// ─────────────────────────────────────────────
console.log('\n🎯 Test 3: Sistema de Fervor y Decisiones');

const fervorContent = readFileSync(path.join(SRC, 'lib/game/FervorSystem.ts'), 'utf-8');

// Count decision IDs
const decisionRegex = /id:\s*'([a-z_]+)'/g;
const decisionIds = [];
while ((m = decisionRegex.exec(fervorContent)) !== null) {
  // Skip 'bloody_sunday', 'brest_litovsk' etc - these are decision IDs
  if (m[1].length > 3) decisionIds.push(m[1]);
}

assert(decisionIds.length >= 15, `Al menos 15 IDs de decisiones/reacciones (tiene ${decisionIds.length})`);

// Check calcularEpilogo exists and has different outputs
assert(fervorContent.includes("'LA LLAMA RADICAL'"), 'Epílogo radical existe');
assert(fervorContent.includes("'LA DISIDENTE'"), 'Epílogo disidente existe');
assert(fervorContent.includes("'LA SUPERVIVIENTE'"), 'Epílogo superviviente existe');
assert(fervorContent.includes("'LA DIPLOMÁTICA'"), 'Epílogo diplomática existe');
assert(fervorContent.includes("'EL LEGADO DE ALEXANDRA'"), 'Epílogo default existe');

// ─────────────────────────────────────────────
// Test 4: DueloDialectico — preguntas y respuestas
// ─────────────────────────────────────────────
console.log('\n🎯 Test 4: Sistema Duelo Dialéctico');

const dueloContent = readFileSync(path.join(SRC, 'lib/game/DueloDialecticoData.ts'), 'utf-8');

// Count rounds (misiones con duelo)
const roundRegex = /id:\s*'([a-z0-9_]+)'/g;
const roundIds = new Set();
while ((m = roundRegex.exec(dueloContent)) !== null) {
  if (m[1].includes('_')) roundIds.add(m[1]);
}
assert(roundIds.size >= 5, `Al menos 5 rondas de duelo (tiene ${roundIds.size})`);

// Count questions
const questionCount = (dueloContent.match(/pregunta:/g) || []).length;
assert(questionCount >= 8, `Al menos 8 preguntas (tiene ${questionCount})`);

// Each question should have 3 answers
const answerArrays = dueloContent.match(/respuestas:\s*\[([^\]]+)\]/g) || [];
for (const arr of answerArrays) {
  const answers = arr.match(/texto:/g) || [];
  assert(answers.length >= 3, `Cada pregunta tiene 3 respuestas (una tiene ${answers.length})`);
}

// Each answer should have a 'correcta' field
const correctas = (dueloContent.match(/correcta:/g) || []).length;
assert(correctas >= 24, `Cada respuesta tiene 'correcta' (${correctas} encontradas, esperado ≥24)`);

// ─────────────────────────────────────────────
// Test 5: ItemCombination — combinaciones válidas
// ─────────────────────────────────────────────
console.log('\n🎯 Test 5: Sistema de Combinación de Items');

const itemContent = readFileSync(path.join(SRC, 'lib/game/ItemCombination.ts'), 'utf-8');

const recipeCount = (itemContent.match(/id:\s*'[a-z_]+'/g) || []).length;
assert(recipeCount >= 8, `Al menos 8 recetas de combinación (tiene ${recipeCount})`);

// Each recipe should have itemA, itemB, resultado, mensaje
assert(itemContent.includes('itemA:'), 'Recetas tienen itemA');
assert(itemContent.includes('itemB:'), 'Recetas tienen itemB');
assert(itemContent.includes('resultado:'), 'Recetas tienen resultado');
assert(itemContent.includes('mensaje:'), 'Recetas tienen mensaje');

// Check checkCombinacion function
assert(itemContent.includes('export function checkCombinacion'), 'checkCombinacion existe');
assert(itemContent.includes('getCombinacionesCon'), 'getCombinacionesCon existe');

// ─────────────────────────────────────────────
// Test 6: HistoricalCodex — entradas completas
// ─────────────────────────────────────────────
console.log('\n🎯 Test 6: Codex Histórico');

const codexContent = readFileSync(path.join(SRC, 'lib/game/HistoricalCodex.ts'), 'utf-8');

const entryCount = (codexContent.match(/id:\s*'[a-z_]+'/g) || []).length;
assert(entryCount >= 11, `Al menos 11 entradas de codex (tiene ${entryCount})`);

// Each entry should have titulo, año, categoria, resumen, texto, desbloqueadoPor, cita
assert(codexContent.includes('titulo:'), 'Codex entries tienen titulo');
assert(codexContent.includes('categoria:'), 'Codex entries tienen categoria');
assert(codexContent.includes('resumen:'), 'Codex entries tienen resumen');
assert(codexContent.includes('texto:'), 'Codex entries tienen texto');
assert(codexContent.includes('desbloqueadoPor:'), 'Codex entries tienen desbloqueadoPor');
assert(codexContent.includes('cita:'), 'Codex entries tienen cita');

// Categories
const categories = ['personaje', 'evento', 'lugar', 'concepto'];
for (const cat of categories) {
  assert(codexContent.includes(`categoria: '${cat}'`), `Codex tiene categoría '${cat}'`);
}

// Helper functions
assert(codexContent.includes('getCodexByFlag'), 'getCodexByFlag existe');
assert(codexContent.includes('getDesbloqueados'), 'getDesbloqueados existe');

// ─────────────────────────────────────────────
// Test 7: La Internacional — estructura musical
// ─────────────────────────────────────────────
console.log('\n🎯 Test 7: La Internacional — estructura musical');

const laIntContent = readFileSync(path.join(SRC, 'lib/audio/LaInternacional.ts'), 'utf-8');

// Melody should have many notes
assert(laIntContent.includes('MELODIA_COMPLETA'), 'MELODIA_COMPLETA existe');
const noteCount = (laIntContent.match(/{ freq:/g) || []).length;
assert(noteCount >= 50, `Al menos 50 notas en la melodía completa (tiene ${noteCount})`);

assert(laIntContent.includes('export function tocarInternacional'), 'tocarInternacional existe');
assert(laIntContent.includes('export function tocarNotasPuzzle'), 'tocarNotasPuzzle existe');

// Should include verses and chorus
assert(laIntContent.includes('C5'), 'Melodía usa nota C5');
assert(laIntContent.includes('G4'), 'Melodía usa nota G4');

// ─────────────────────────────────────────────
// Test 8: GameContext — estado completo
// ─────────────────────────────────────────────
console.log('\n🎯 Test 8: GameContext');

const ctxContent = readFileSync(path.join(SRC, 'context/GameContext.tsx'), 'utf-8');

const stateFields = ['nombre', 'genero', 'año', 'ubicacion', 'inventario', 'fervor', 'misionesCompletadas', 'pistasUsadas', 'decisiones', 'codexDesbloqueados', 'flags'];
for (const field of stateFields) {
  assert(ctxContent.includes(field), `GameState tiene campo '${field}'`);
}

const methods = ['addItem', 'removeItem', 'hasItem', 'modifyFervor', 'recordDecision', 'unlockCodex', 'setFlag', 'hasFlag', 'resetGame'];
for (const method of methods) {
  assert(ctxContent.includes(method), `GameContext exporta '${method}'`);
}

// ─────────────────────────────────────────────
// Test 9: MusicEngine — moods por misión
// ─────────────────────────────────────────────
console.log('\n🎯 Test 9: MusicEngine');

const musicContent = readFileSync(path.join(SRC, 'lib/audio/MusicEngine.ts'), 'utf-8');

assert(musicContent.includes('export class MusicEngine'), 'MusicEngine class exportada');
assert(musicContent.includes('playMood'), 'playMood existe');
assert(musicContent.includes('stop()'), 'stop existe');

const moods = ['invierno', 'protesta', 'tren', 'sigilo', 'guerra', 'kremlin', 'duelo', 'funeral'];
for (const mood of moods) {
  assert(musicContent.includes(mood), `MusicEngine tiene mood '${mood}'`);
}

// moodForYear function
assert(musicContent.includes('export function moodForYear'), 'moodForYear existe');

// ─────────────────────────────────────────────
// Test 10: CharacterModel — animaciones
// ─────────────────────────────────────────────
console.log('\n🎯 Test 10: CharacterModel 3D');

const charContent = readFileSync(path.join(SRC, 'lib/three/CharacterModel.ts'), 'utf-8');

assert(charContent.includes('startDance'), 'startDance existe');
assert(charContent.includes('stopDance'), 'stopDance existe');
assert(charContent.includes('setMoving'), 'setMoving existe');
assert(charContent.includes('setPosition'), 'setPosition existe');
assert(charContent.includes('lookAt'), 'lookAt existe');
assert(charContent.includes('update('), 'update existe');

// ── Summary ─────────────────────────────────
console.log(`\n${'='.repeat(50)}`);
console.log(`📊 RESULTADOS: ${passed} pasaron, ${failed} fallaron`);
console.log(`${'='.repeat(50)}\n`);

process.exit(failed > 0 ? 1 : 0);
