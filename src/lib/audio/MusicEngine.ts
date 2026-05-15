// MusicEngine — Música procedural por misión
// Usa Web Audio API para generar ambiente sonoro según la misión

export type MoodType = 'invierno' | 'protesta' | 'tren' | 'sigilo' | 'guerra' | 'kremlin' | 'duelo' | 'funeral';

interface LayerState {
  osc: OscillatorNode | null;
  gain: GainNode | null;
  filter: BiquadFilterNode | null;
}

export class MusicEngine {
  private ctx: AudioContext | null = null;
  private layers: LayerState[] = [];
  private masterGain: GainNode | null = null;
  private stopped = false;
  private currentMood: MoodType | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  stop() {
    this.stopped = true;
    this.layers.forEach((l) => {
      try { l.osc?.stop(); } catch {}
      try { l.osc?.disconnect(); } catch {}
      try { l.gain?.disconnect(); } catch {}
    });
    this.layers = [];
    this.masterGain = null;
    this.currentMood = null;
  }

  playMood(mood: MoodType) {
    if (this.stopped) return;
    this.stop();
    this.stopped = false;
    this.currentMood = mood;

    const ctx = this.getCtx();
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0.15;
    this.masterGain.connect(ctx.destination);

    switch (mood) {
      case 'invierno': this.buildInvierno(ctx); break;
      case 'protesta': this.buildProtesta(ctx); break;
      case 'tren': this.buildTren(ctx); break;
      case 'sigilo': this.buildSigilo(ctx); break;
      case 'guerra': this.buildGuerra(ctx); break;
      case 'kremlin': this.buildKremlin(ctx); break;
      case 'duelo': this.buildDuelo(ctx); break;
      case 'funeral': this.buildFuneral(ctx); break;
    }
  }

  // ── Viento invernal (1905, 1917 Feb, 1924) ──
  private buildInvierno(ctx: AudioContext) {
    // Zumbido grave
    this.addLayer(ctx, 55, 'sine', 0.04, 120, 0.3);
    // Ruido de viento
    this.addNoiseLayer(ctx, 0.02, 400, 0.2);
    // Armónico distante
    this.addLayer(ctx, 110, 'triangle', 0.02, 300, 0.15);
  }

  // ── Multitud revolucionaria (1917 Feb, Oct) ──
  private buildProtesta(ctx: AudioContext) {
    this.addLayer(ctx, 65, 'sawtooth', 0.025, 250, 0.2);
    this.addLayer(ctx, 130, 'square', 0.015, 500, 0.15);
    this.addLayer(ctx, 196, 'triangle', 0.03, 800, 0.1);
    this.addLayer(ctx, 261.63, 'sine', 0.04, 2000, 0.08); // C4
  }

  // ── Tren en movimiento (1917 Tren, 1919) ──
  private buildTren(ctx: AudioContext) {
    // Ritmo de ruedas (pulso regular)
    this.addPulseLayer(ctx, 65, 2.5, 'triangle', 0.06, 0.3, 400);
    // Silbido lejano
    this.addSweepLayer(ctx, 400, 800, 0.02, 8);
    // Base grave
    this.addLayer(ctx, 55, 'sawtooth', 0.03, 200, 0.25);
  }

  // ── Sigilo (Palacio de Invierno) ──
  private buildSigilo(ctx: AudioContext) {
    this.addLayer(ctx, 40, 'sine', 0.025, 100, 0.4);
    this.addLayer(ctx, 80, 'triangle', 0.015, 200, 0.1);
    this.addLayer(ctx, 120, 'sine', 0.01, 300, 0.05);
  }

  // ── Guerra civil (1919 Frente) ──
  private buildGuerra(ctx: AudioContext) {
    this.addLayer(ctx, 55, 'sawtooth', 0.05, 400, 0.3);
    this.addLayer(ctx, 110, 'square', 0.025, 600, 0.2);
    this.addLayer(ctx, 220, 'sawtooth', 0.015, 800, 0.1);
    // Redoble de tambor con ruido pulsado
    this.addDrumLayer(ctx, 0.03, 4);
  }

  // ── Kremlin / Burocracia (1922) ──
  private buildKremlin(ctx: AudioContext) {
    this.addLayer(ctx, 65, 'sine', 0.03, 200, 0.2);
    this.addLayer(ctx, 131, 'triangle', 0.02, 400, 0.15);
    this.addLayer(ctx, 196, 'sine', 0.015, 600, 0.1);
  }

  // ── Duelo Dialéctico ──
  private buildDuelo(ctx: AudioContext) {
    this.addLayer(ctx, 100, 'square', 0.02, 600, 0.15);
    this.addLayer(ctx, 200, 'triangle', 0.015, 800, 0.1);
  }

  // ── Funeral / Epílogo (1924) ──
  private buildFuneral(ctx: AudioContext) {
    this.addLayer(ctx, 50, 'sine', 0.025, 150, 0.35);
    this.addLayer(ctx, 75, 'sine', 0.015, 200, 0.1);
    this.addNoiseLayer(ctx, 0.01, 200, 0.08);
  }

  // ── Helpers ──
  private addLayer(
    ctx: AudioContext,
    freq: number,
    type: OscillatorType,
    volume: number,
    filterFreq: number,
    filterQ: number
  ) {
    if (this.stopped) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = filterQ;

    osc.connect(filter);
    filter.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    osc.start();
    this.layers.push({ osc, gain, filter });
  }

  private addNoiseLayer(ctx: AudioContext, volume: number, filterFreq: number, q: number) {
    if (this.stopped) return;
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    gain.gain.value = volume;
    filter.type = 'bandpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = q;

    source.connect(filter);
    filter.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    source.start();
    // Fake oscillator reference for stop()
    this.layers.push({ osc: null, gain, filter });
  }

  private addPulseLayer(
    ctx: AudioContext,
    freq: number,
    rate: number,
    type: OscillatorType,
    volume: number,
    filterFreq: number,
    q: number
  ) {
    if (this.stopped) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;
    lfo.type = 'sine';
    lfo.frequency.value = rate;
    lfoGain.gain.value = volume * 0.9;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    gain.gain.setValueAtTime(volume, ctx.currentTime);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    filter.Q.value = q;

    osc.connect(filter);
    filter.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);

    osc.start();
    lfo.start();
    this.layers.push({ osc, gain, filter });
    this.layers.push({ osc: lfo, gain: lfoGain, filter: null });
  }

  private addSweepLayer(ctx: AudioContext, from: number, to: number, volume: number, period: number) {
    if (this.stopped) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = 'sine';
    lfo.type = 'sine';
    lfo.frequency.value = 1 / period;
    lfoGain.gain.value = (to - from) / 2;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.frequency.value = (from + to) / 2;
    gain.gain.value = volume;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1500;

    osc.connect(filter);
    filter.connect(gain);
    if (this.masterGain) gain.connect(this.masterGain);
    osc.start();
    lfo.start();
    this.layers.push({ osc, gain, filter });
    this.layers.push({ osc: lfo, gain: lfoGain, filter: null });
  }

  private addDrumLayer(ctx: AudioContext, volume: number, rate: number) {
    if (this.stopped) return;
    const interval = 1000 / rate;
    let drumId: number;
    const playDrum = () => {
      if (this.stopped) return;
      const bufferSize = ctx.sampleRate * 0.1;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.1));
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = volume;
      source.connect(gain);
      if (this.masterGain) gain.connect(this.masterGain);
      source.start();
      drumId = window.setTimeout(playDrum, interval);
    };
    drumId = window.setTimeout(playDrum, 0);
    // Attach cleanup to a fake layer
    const fakeLayer: LayerState = { osc: null, gain: null, filter: null };
    const origStop = this.stop.bind(this);
    this.layers.push(fakeLayer);
  }
}

export function moodForYear(misionId: number): MoodType {
  switch (misionId) {
    case 1905: return 'invierno';
    case 1905.1: return 'protesta';
    case 1912: return 'sigilo';
    case 1917: return 'tren';
    case 1917.1: return 'sigilo';
    case 1918: return 'guerra';
    case 1918.1: return 'funeral';
    case 1919: return 'guerra';
    case 1921: return 'invierno';
    case 1922: return 'kremlin';
    case 1924: return 'funeral';
    default: return 'invierno';
  }
}
