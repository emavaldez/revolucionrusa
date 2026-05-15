// La Internacional — partitura completa para Web Audio API
// Melodía original de Pierre De Geyter (1888)
// Arreglada para reproducción procedural con osciladores

export interface Nota {
  freq: number;
  duracion: number; // en segundos
  nombre: string;
}

// Frecuencias base en C mayor (octava 4)
const C4 = 261.63;
const D4 = 293.66;
const E4 = 329.63;
const F4 = 349.23;
const G4 = 392.00;
const A4 = 440.00;
const B4 = 493.88;
const C5 = 523.25;
const D5 = 587.33;
const E5 = 659.25;
const F5 = 698.46;
const G5 = 783.99;

const NEGRA = 0.35; // duración base
const BLANCA = NEGRA * 2;
const CORCHEA = NEGRA / 2;
const REDONDA = NEGRA * 4;
const TRESILLO = NEGRA * 0.67;

// ── Melodía completa de La Internacional ──
// Estructura: Intro (4 notas) → Verso 1 → Estribillo → Verso 2 → Estribillo → Coda
export const MELODIA_COMPLETA: Nota[] = [
  // ── INTRO (fanfarria de 4 notas — la del puzzle) ──
  { freq: C4, duracion: NEGRA, nombre: 'Do' },
  { freq: E4, duracion: NEGRA, nombre: 'Mi' },
  { freq: G4, duracion: NEGRA, nombre: 'Sol' },
  { freq: C5, duracion: NEGRA * 1.5, nombre: 'Do' },

  // ── VERSO 1 "Debout les damnés de la terre" ──
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: D5, duracion: CORCHEA, nombre: 'Re' },
  { freq: E5, duracion: NEGRA, nombre: 'Mi' },
  { freq: D5, duracion: CORCHEA, nombre: 'Re' },
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: B4, duracion: NEGRA, nombre: 'Si' },
  { freq: G4, duracion: NEGRA, nombre: 'Sol' },
  { freq: A4, duracion: CORCHEA, nombre: 'La' },
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: B4, duracion: CORCHEA, nombre: 'Si' },
  { freq: A4, duracion: CORCHEA, nombre: 'La' },
  { freq: G4, duracion: BLANCA, nombre: 'Sol' },

  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: D5, duracion: CORCHEA, nombre: 'Re' },
  { freq: E5, duracion: NEGRA, nombre: 'Mi' },
  { freq: D5, duracion: CORCHEA, nombre: 'Re' },
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: B4, duracion: NEGRA, nombre: 'Si' },
  { freq: G4, duracion: NEGRA, nombre: 'Sol' },
  { freq: A4, duracion: CORCHEA, nombre: 'La' },
  { freq: G4, duracion: CORCHEA, nombre: 'Sol' },
  { freq: E4, duracion: CORCHEA, nombre: 'Mi' },
  { freq: C4, duracion: BLANCA, nombre: 'Do' },

  // ── ESTRIBILLO "C'est la lutte finale" ──
  { freq: D4, duracion: CORCHEA, nombre: 'Re' },
  { freq: E4, duracion: CORCHEA, nombre: 'Mi' },
  { freq: F4, duracion: CORCHEA, nombre: 'Fa' },
  { freq: G4, duracion: CORCHEA, nombre: 'Sol' },
  { freq: A4, duracion: NEGRA, nombre: 'La' },
  { freq: G4, duracion: NEGRA, nombre: 'Sol' },
  { freq: F4, duracion: NEGRA, nombre: 'Fa' },
  { freq: E4, duracion: NEGRA, nombre: 'Mi' },

  { freq: D4, duracion: CORCHEA, nombre: 'Re' },
  { freq: E4, duracion: CORCHEA, nombre: 'Mi' },
  { freq: F4, duracion: CORCHEA, nombre: 'Fa' },
  { freq: G4, duracion: CORCHEA, nombre: 'Sol' },
  { freq: A4, duracion: NEGRA, nombre: 'La' },
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: B4, duracion: CORCHEA, nombre: 'Si' },
  { freq: G4, duracion: BLANCA, nombre: 'Sol' },

  // ── VERSO 2 ──
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: D5, duracion: CORCHEA, nombre: 'Re' },
  { freq: E5, duracion: NEGRA, nombre: 'Mi' },
  { freq: D5, duracion: CORCHEA, nombre: 'Re' },
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: B4, duracion: NEGRA, nombre: 'Si' },
  { freq: G4, duracion: NEGRA, nombre: 'Sol' },
  { freq: A4, duracion: CORCHEA, nombre: 'La' },
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: B4, duracion: CORCHEA, nombre: 'Si' },
  { freq: A4, duracion: CORCHEA, nombre: 'La' },
  { freq: G4, duracion: BLANCA, nombre: 'Sol' },

  // ── ESTRIBILLO 2 ──
  { freq: D4, duracion: CORCHEA, nombre: 'Re' },
  { freq: E4, duracion: CORCHEA, nombre: 'Mi' },
  { freq: F4, duracion: CORCHEA, nombre: 'Fa' },
  { freq: G4, duracion: CORCHEA, nombre: 'Sol' },
  { freq: A4, duracion: NEGRA, nombre: 'La' },
  { freq: G4, duracion: NEGRA, nombre: 'Sol' },
  { freq: F4, duracion: NEGRA, nombre: 'Fa' },
  { freq: E4, duracion: NEGRA, nombre: 'Mi' },

  { freq: D4, duracion: CORCHEA, nombre: 'Re' },
  { freq: E4, duracion: CORCHEA, nombre: 'Mi' },
  { freq: F4, duracion: CORCHEA, nombre: 'Fa' },
  { freq: G4, duracion: CORCHEA, nombre: 'Sol' },
  { freq: A4, duracion: NEGRA, nombre: 'La' },
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: B4, duracion: CORCHEA, nombre: 'Si' },
  { freq: G4, duracion: BLANCA, nombre: 'Sol' },

  // ── CODA (final épico) ──
  { freq: G4, duracion: CORCHEA, nombre: 'Sol' },
  { freq: A4, duracion: CORCHEA, nombre: 'La' },
  { freq: B4, duracion: CORCHEA, nombre: 'Si' },
  { freq: C5, duracion: CORCHEA, nombre: 'Do' },
  { freq: D5, duracion: NEGRA, nombre: 'Re' },
  { freq: C5, duracion: NEGRA, nombre: 'Do' },
  { freq: B4, duracion: NEGRA, nombre: 'Si' },
  { freq: G4, duracion: NEGRA, nombre: 'Sol' },

  { freq: C5, duracion: NEGRA, nombre: 'Do' },
  { freq: E5, duracion: NEGRA, nombre: 'Mi' },
  { freq: G5, duracion: REDONDA, nombre: 'Sol' },
];

// ── Reproducir la Internacional completa ──
export function tocarInternacional(
  audioCtx: AudioContext,
  onNota?: (nota: Nota, index: number, total: number) => void,
  onFinish?: () => void
): { stop: () => void } {
  let timeoutIds: number[] = [];
  let stopped = false;
  let tiempoActual = 0;

  // Añadir un segundo de silencio al inicio
  tiempoActual += 1.0;

  // Acordes de acompañamiento (bajo)
  const acordes: { tiempo: number; freqs: number[] }[] = [
    { tiempo: 0, freqs: [C4, E4, G4] },
    { tiempo: NEGRA * 4 + CORCHEA * 8, freqs: [G4, B4, D5] },
    { tiempo: NEGRA * 8 + CORCHEA * 16, freqs: [F4, A4, C5] },
    { tiempo: NEGRA * 12 + CORCHEA * 24, freqs: [C4, E4, G4] },
  ];

  MELODIA_COMPLETA.forEach((nota, index) => {
    const startTime = tiempoActual;

    const id1 = window.setTimeout(() => {
      if (stopped) return;

      // Oscilador melódico (onda cuadrada con filtro)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.value = nota.freq;

      filter.type = 'lowpass';
      filter.frequency.value = 2000;

      gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + nota.duracion * 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + nota.duracion);

      // Segundo oscilador armónico (octava arriba, más suave)
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.value = nota.freq * 2;
      gain2.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + nota.duracion * 0.7);
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.start(audioCtx.currentTime);
      osc2.stop(audioCtx.currentTime + nota.duracion);

      // Callback para animación
      if (onNota) {
        onNota(nota, index, MELODIA_COMPLETA.length);
      }
    }, startTime * 1000);
    timeoutIds.push(id1);

    // Acompañamiento de acordes
    acordes.forEach((acorde) => {
      if (Math.abs(acorde.tiempo - tiempoActual) < 0.01) {
        const idAcorde = window.setTimeout(() => {
          if (stopped) return;
          acorde.freqs.forEach((f) => {
            const osc3 = audioCtx.createOscillator();
            const gain3 = audioCtx.createGain();
            osc3.type = 'sine';
            osc3.frequency.value = f;
            gain3.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain3.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + NEGRA * 3);
            osc3.connect(gain3);
            gain3.connect(audioCtx.destination);
            osc3.start(audioCtx.currentTime);
            osc3.stop(audioCtx.currentTime + NEGRA * 3);
          });
        }, startTime * 1000);
        timeoutIds.push(idAcorde);
      }
    });

    tiempoActual += nota.duracion;
  });

  // Callback final
  const finishId = window.setTimeout(() => {
    if (!stopped && onFinish) onFinish();
  }, tiempoActual * 1000 + 200);
  timeoutIds.push(finishId);

  return {
    stop: () => {
      stopped = true;
      timeoutIds.forEach(clearTimeout);
    },
  };
}

// ── Reproducir solo las 4 notas del puzzle (para prueba) ──
export function tocarNotasPuzzle(audioCtx: AudioContext): void {
  const secuencia = [
    { freq: C4, nombre: 'Do' },
    { freq: E4, nombre: 'Mi' },
    { freq: G4, nombre: 'Sol' },
    { freq: C5, nombre: 'Do' },
  ];
  secuencia.forEach((n, i) => {
    setTimeout(() => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = n.freq;
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    }, i * 300);
  });
}
