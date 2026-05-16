// Melodías rusas de época para reproducir con Web Audio API
// Canciones populares de la Rusia de 1900-1920

export interface MelodiaRusa {
  nombre: string;
  descripcion: string;
  notas: { freq: number; duracion: number }[];
}

// Polyushko Polye (Ой, поля мои, поля) — canción folklórica rusa
// Melodía tradicional reconocible, compás lento y melancólico
const N = 0.4; // negra
const B = 0.8; // blanca
const C = 0.2; // corchea

const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23;
const G4 = 392.00, A4 = 440.00, B4 = 493.88;
const C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99;

export const MELODIAS_RUSAS: Record<string, MelodiaRusa> = {
  polyushko: {
    nombre: 'Polyushko Polye',
    descripcion: 'Canción folklórica rusa sobre los campos y la vida campesina',
    notas: [
      { freq: C4, duracion: B },
      { freq: E4, duracion: N },
      { freq: G4, duracion: N },
      { freq: C5, duracion: B },
      { freq: C5, duracion: C },
      { freq: B4, duracion: C },
      { freq: C5, duracion: C },
      { freq: D5, duracion: C },
      { freq: E5, duracion: B },
      { freq: D5, duracion: N },
      { freq: C5, duracion: N },
      { freq: B4, duracion: B },
      { freq: G4, duracion: B },
      { freq: A4, duracion: N },
      { freq: B4, duracion: N },
      { freq: C5, duracion: B },
      { freq: G4, duracion: N },
      { freq: E4, duracion: N },
      { freq: C4, duracion: B },
    ],
  },
  internacional: {
    nombre: 'La Internacional',
    descripcion: 'Himno revolucionario — himno de la URSS hasta 1944',
    notas: [
      { freq: C4, duracion: N }, { freq: E4, duracion: N },
      { freq: G4, duracion: N }, { freq: C5, duracion: B },
      { freq: C5, duracion: C }, { freq: D5, duracion: C },
      { freq: E5, duracion: N }, { freq: D5, duracion: C },
      { freq: C5, duracion: C }, { freq: B4, duracion: N },
      { freq: G4, duracion: N }, { freq: A4, duracion: C },
      { freq: C5, duracion: C }, { freq: B4, duracion: C },
      { freq: A4, duracion: C }, { freq: G4, duracion: B },
    ],
  },
  // "Smuglyanka" (Смуглянка) — canción popular moldava/rusa de la época
  smuglyanka: {
    nombre: 'Smuglyanka',
    descripcion: 'Canción popular sobre una muchacha moldava — alegre y bailable',
    notas: [
      { freq: G4, duracion: C }, { freq: G4, duracion: C },
      { freq: A4, duracion: C }, { freq: B4, duracion: C },
      { freq: C5, duracion: N }, { freq: D5, duracion: N },
      { freq: C5, duracion: C }, { freq: B4, duracion: C },
      { freq: A4, duracion: N }, { freq: G4, duracion: N },
      { freq: C5, duracion: C }, { freq: C5, duracion: C },
      { freq: D5, duracion: C }, { freq: E5, duracion: C },
      { freq: D5, duracion: N }, { freq: C5, duracion: N },
      { freq: B4, duracion: N }, { freq: G4, duracion: B },
    ],
  },
};

// Reproducir una melodía rusa
export function tocarMelodiaRusa(
  audioCtx: AudioContext,
  nombre: string,
  onFinish?: () => void,
  loop = true
): { stop: () => void } {
  const melodia = MELODIAS_RUSAS[nombre];
  if (!melodia) return { stop: () => {} };

  let timeoutIds: number[] = [];
  let stopped = false;
  let tiempoActual = 0.5; // pausa inicial

  const tocarVuelta = () => {
    melodia.notas.forEach((nota, index) => {
      const startTime = tiempoActual;

      const id = window.setTimeout(() => {
        if (stopped) return;

        // Voz melódica (triángulo suave)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();
        osc.type = 'triangle';
        osc.frequency.value = nota.freq;
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + nota.duracion * 0.8);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + nota.duracion);

        // Armónico (quinta, más suave)
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.type = 'sine';
        osc2.frequency.value = nota.freq * 1.5;
        gain2.gain.setValueAtTime(0.01, audioCtx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + nota.duracion * 0.6);
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.start();
        osc2.stop(audioCtx.currentTime + nota.duracion);
      }, startTime * 1000);
      timeoutIds.push(id);
      tiempoActual += nota.duracion;
    });
  };

  tocarVuelta();

  if (loop) {
    // Programar repetición
    const loopId = window.setTimeout(() => {
      if (!stopped) {
        tiempoActual += 0.5; // pausa entre loops
        tocarVuelta();
      }
    }, tiempoActual * 1000);
    timeoutIds.push(loopId);
  }

  if (onFinish) {
    const id = window.setTimeout(onFinish, (tiempoActual + 0.5) * 1000);
    timeoutIds.push(id);
  }

  return {
    stop: () => {
      stopped = true;
      timeoutIds.forEach(clearTimeout);
    },
  };
}

// Elegir melodía según la misión
export function melodiaParaMision(misionId: number): string {
  switch (misionId) {
    case 1905: case 1905.1: return 'polyushko';
    case 1912: return 'smuglyanka';
    case 1917: case 1917.1: return 'internacional';
    case 1918: return 'polyushko';
    case 1919: return 'smuglyanka';
    case 1921: return 'polyushko';
    case 1922: return 'internacional';
    case 1924: return 'polyushko';
    default: return 'polyushko';
  }
}
