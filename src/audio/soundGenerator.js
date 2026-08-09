// Web Audio API Ambient Sound Generator — Ultra-Soothing Deep-Focus Soundscapes

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.activeSoundId = null;
    this.masterGain = null;
    this.currentNodes = [];
    this.intervalId = null;
    this.volume = 0.5;
    this.isMuted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.08);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.08);
    }
    return this.isMuted;
  }

  stopCurrent() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.currentNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {
        // Safe catch for node cleanup
      }
    });
    this.currentNodes = [];
    this.activeSoundId = null;
  }

  playSound(soundId) {
    this.init();

    if (this.activeSoundId === soundId) {
      this.stopCurrent();
      return false; // Stopped
    }

    this.stopCurrent();
    this.activeSoundId = soundId;

    switch (soundId) {
      case 'rain':
        this.createWhisperingRain();
        break;
      case 'ocean':
        this.createVelvetOceanTide();
        break;
      case 'river':
        this.createQuietMeadowStream();
        break;
      case 'forest':
        this.createWarmForestBreeze();
        break;
      case 'cafe':
        this.createCozySanctuary();
        break;
      case 'chimes':
        this.createZenSingingBowls();
        break;
      case 'brown-noise':
        this.createDeepSubBassBrownNoise();
        break;
      case 'binaural':
        this.createAlphaBinauralBeats();
        break;
      default:
        break;
    }

    return true; // Playing
  }

  // --- Timer Sound Effects --- //

  // Play Timer Start Sound (Short, subtle 2-note ascending chime: 523.25Hz -> 659.25Hz)
  playTimerStartSound(volume = 0.6, enabled = true) {
    if (!enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const startTime = now + idx * 0.08;
      const attackVolume = volume * 0.12;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(attackVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  // Play Timer End Sound (Clear, pleasant 3-note Solfeggio bell cascade: 528Hz -> 648Hz -> 792Hz)
  playTimerEndSound(volume = 0.6, enabled = true) {
    if (!enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    const notes = [528, 648, 792];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const startTime = now + idx * 0.16;
      const attackVolume = volume * 0.2;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(attackVolume, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 1.25);
    });
  }

  // --- Ultra-Soothing Audio Generators --- //

  createBufferSource(buffer, loop = true) {
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    return source;
  }

  generatePinkNoiseBuffer(seconds = 6) {
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.05; // Ultra soft amplitude
      b6 = white * 0.115926;
    }
    return buffer;
  }

  generateBrownNoiseBuffer(seconds = 6) {
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 1.2; // Soft warm rumble
    }
    return buffer;
  }

  // 1. Whispering Rain (Deep, warm rain without harsh high frequencies)
  createWhisperingRain() {
    const buffer = this.generatePinkNoiseBuffer(6);
    const noise = this.createBufferSource(buffer);

    const lowpass1 = this.ctx.createBiquadFilter();
    lowpass1.type = 'lowpass';
    lowpass1.frequency.value = 380;

    const lowpass2 = this.ctx.createBiquadFilter();
    lowpass2.type = 'lowpass';
    lowpass2.frequency.value = 650;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.22;

    noise.connect(lowpass1);
    lowpass1.connect(lowpass2);
    lowpass2.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.currentNodes.push(noise, lowpass1, lowpass2, gain);
  }

  // 2. Velvet Ocean Tide (Deep low-frequency tide with 14s swell cycle)
  createVelvetOceanTide() {
    const buffer = this.generatePinkNoiseBuffer(6);
    const noise = this.createBufferSource(buffer);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 220;

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.1, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.07; // Slow 14s wave swell

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.12;

    lfo.connect(lfoGain);
    lfoGain.connect(swellGain.gain);

    noise.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(this.masterGain);

    lfo.start();
    noise.start();

    this.currentNodes.push(noise, filter, swellGain, lfo, lfoGain);
  }

  // 3. Quiet Meadow Stream (Warm babbling brook filtered at low frequencies)
  createQuietMeadowStream() {
    const buffer = this.generatePinkNoiseBuffer(6);
    const noise = this.createBufferSource(buffer);

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 450;
    bandpass.Q.value = 0.8;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 900;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.25;

    noise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.currentNodes.push(noise, bandpass, lowpass, gain);
  }

  // 4. Warm Forest Breeze (Deep canopy breeze with soft 432Hz bird whispers)
  createWarmForestBreeze() {
    const buffer = this.generatePinkNoiseBuffer(6);
    const wind = this.createBufferSource(buffer);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 280;

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.15;

    wind.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);
    wind.start();

    this.currentNodes.push(wind, filter, windGain);

    // Soft 432Hz sine bird whisper
    const triggerBirdWhisper = () => {
      if (this.activeSoundId !== 'forest') return;
      const osc = this.ctx.createOscillator();
      const chirpGain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now);
      osc.frequency.exponentialRampToValueAtTime(576, now + 0.2);

      chirpGain.gain.setValueAtTime(0, now);
      chirpGain.gain.linearRampToValueAtTime(0.02, now + 0.05);
      chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(chirpGain);
      chirpGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.36);
    };

    this.intervalId = setInterval(() => {
      if (Math.random() > 0.5) {
        triggerBirdWhisper();
      }
    }, 4500);
  }

  // 5. Cozy Sanctuary (Subtle low-end warmth)
  createCozySanctuary() {
    const buffer = this.generateBrownNoiseBuffer(6);
    const noise = this.createBufferSource(buffer);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 220;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.22;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.currentNodes.push(noise, filter, gain);
  }

  // 6. Zen Singing Bowls (432Hz & 528Hz Solfeggio Tibetan harmonics)
  createZenSingingBowls() {
    const notes = [216, 432, 528, 648]; // Solfeggio harmonics

    const triggerSingingBowl = () => {
      if (this.activeSoundId !== 'chimes') return;
      const freq = notes[Math.floor(Math.random() * notes.length)];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 5.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 5.6);
    };

    triggerSingingBowl();
    this.intervalId = setInterval(() => {
      if (Math.random() > 0.3) {
        triggerSingingBowl();
      }
    }, 4000);
  }

  // 7. Deep Sub-Bass Brown Noise (Masking high frequencies with warm sub-rumble)
  createDeepSubBassBrownNoise() {
    const buffer = this.generateBrownNoiseBuffer(6);
    const noise = this.createBufferSource(buffer);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 160;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.3;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.currentNodes.push(noise, filter, gain);
  }

  // 8. Alpha Relaxation Binaural Beats (136.1Hz Om carrier + 8Hz Alpha beat)
  createAlphaBinauralBeats() {
    const carrier = 136.1; // Om tuning
    const beat = 8; // 8Hz Alpha relaxation

    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();

    oscL.type = 'sine';
    oscR.type = 'sine';

    oscL.frequency.value = carrier;
    oscR.frequency.value = carrier + beat;

    const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (pannerL && pannerR) {
      pannerL.pan.value = -0.8;
      pannerR.pan.value = 0.8;

      oscL.connect(pannerL);
      oscR.connect(pannerR);

      pannerL.connect(this.masterGain);
      pannerR.connect(this.masterGain);
      this.currentNodes.push(pannerL, pannerR);
    } else {
      oscL.connect(this.masterGain);
      oscR.connect(this.masterGain);
    }

    const gainL = this.ctx.createGain();
    const gainR = this.ctx.createGain();
    gainL.gain.value = 0.12;
    gainR.gain.value = 0.12;

    oscL.start();
    oscR.start();

    this.currentNodes.push(oscL, oscR, gainL, gainR);
  }
}

export const soundEngine = new SoundEngine();
