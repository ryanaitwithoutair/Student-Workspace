// Web Audio API Ambient Sound Generator for Evolve Focus Workspace

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.activeSoundId = null;
    this.masterGain = null;
    this.currentNodes = [];
    this.intervalId = null;
    this.volume = 0.7;
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
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
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
      case 'ocean':
        this.createOcean();
        break;
      case 'river':
        this.createRiver();
        break;
      case 'forest':
        this.createForest();
        break;
      case 'rain':
        this.createRain();
        break;
      case 'cafe':
        this.createCafe();
        break;
      case 'wind':
        this.createWind();
        break;
      case 'chimes':
        this.createChimes();
        break;
      case 'white-noise':
        this.createNoise('white');
        break;
      case 'brown-noise':
        this.createNoise('brown');
        break;
      case 'pink-noise':
        this.createNoise('pink');
        break;
      case 'binaural':
        this.createBinauralBeats();
        break;
      default:
        break;
    }

    return true; // Playing
  }

  // --- Audio Generators --- //

  createBufferSource(buffer, loop = true) {
    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    return source;
  }

  generateNoiseBuffer(type = 'white', seconds = 5) {
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    if (type === 'white') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    } else if (type === 'brown') {
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain boost
      }
    } else if (type === 'pink') {
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
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }
    }
    return buffer;
  }

  createNoise(type) {
    const buffer = this.generateNoiseBuffer(type, 5);
    const noise = this.createBufferSource(buffer);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'white' ? 4000 : type === 'brown' ? 800 : 3000;

    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();

    this.currentNodes.push(noise, filter);
  }

  createOcean() {
    const buffer = this.generateNoiseBuffer('pink', 6);
    const noise = this.createBufferSource(buffer);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 350;

    const swellGain = this.ctx.createGain();
    swellGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    // LFO for wave modulation
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.12; // Wave period ~8s

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.3;

    lfo.connect(lfoGain);
    lfoGain.connect(swellGain.gain);

    noise.connect(filter);
    filter.connect(swellGain);
    swellGain.connect(this.masterGain);

    lfo.start();
    noise.start();

    this.currentNodes.push(noise, filter, swellGain, lfo, lfoGain);
  }

  createRiver() {
    const buffer = this.generateNoiseBuffer('pink', 5);
    const noise = this.createBufferSource(buffer);

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 900;
    bandpass.Q.value = 1.2;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 2200;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.45;

    noise.connect(bandpass);
    bandpass.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.currentNodes.push(noise, bandpass, lowpass, gain);
  }

  createForest() {
    // Gentle wind backdrop
    const buffer = this.generateNoiseBuffer('pink', 5);
    const wind = this.createBufferSource(buffer);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;

    const windGain = this.ctx.createGain();
    windGain.gain.value = 0.25;

    wind.connect(filter);
    filter.connect(windGain);
    windGain.connect(this.masterGain);
    wind.start();

    this.currentNodes.push(wind, filter, windGain);

    // Occasional bird chirp synthesis
    const triggerBirdChirp = () => {
      if (this.activeSoundId !== 'forest') return;
      
      const osc = this.ctx.createOscillator();
      const chirpGain = this.ctx.createGain();

      const startFreq = 2200 + Math.random() * 800;
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq + 1200, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(startFreq - 300, now + 0.15);

      chirpGain.gain.setValueAtTime(0, now);
      chirpGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(chirpGain);
      chirpGain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.18);
    };

    this.intervalId = setInterval(() => {
      if (Math.random() > 0.4) {
        triggerBirdChirp();
      }
    }, 2500);
  }

  createRain() {
    const buffer = this.generateNoiseBuffer('pink', 5);
    const noise = this.createBufferSource(buffer);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 600;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 4500;

    const rainGain = this.ctx.createGain();
    rainGain.gain.value = 0.4;

    noise.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(rainGain);
    rainGain.connect(this.masterGain);

    noise.start();
    this.currentNodes.push(noise, highpass, lowpass, rainGain);
  }

  createCafe() {
    const buffer = this.generateNoiseBuffer('brown', 5);
    const noise = this.createBufferSource(buffer);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 500;
    filter.Q.value = 0.8;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.4;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
    this.currentNodes.push(noise, filter, gain);
  }

  createWind() {
    const buffer = this.generateNoiseBuffer('white', 6);
    const noise = this.createBufferSource(buffer);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 300;
    filter.Q.value = 3.0;

    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2; // Slow wind frequency shift

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 250; // Shift range

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gain = this.ctx.createGain();
    gain.gain.value = 0.5;

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    lfo.start();
    noise.start();

    this.currentNodes.push(noise, filter, lfo, lfoGain, gain);
  }

  createChimes() {
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.50, 1318.51]; // C pentatonic

    const triggerChime = () => {
      if (this.activeSoundId !== 'chimes') return;
      const freq = notes[Math.floor(Math.random() * notes.length)];
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 3.6);
    };

    triggerChime();
    this.intervalId = setInterval(() => {
      if (Math.random() > 0.3) {
        triggerChime();
      }
    }, 2000);
  }

  createBinauralBeats() {
    // 40Hz Gamma focus beat on 200Hz carrier tone
    const carrier = 200;
    const beat = 40;

    const oscL = this.ctx.createOscillator();
    const oscR = this.ctx.createOscillator();

    oscL.type = 'sine';
    oscR.type = 'sine';

    oscL.frequency.value = carrier;
    oscR.frequency.value = carrier + beat;

    const pannerL = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const pannerR = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (pannerL && pannerR) {
      pannerL.pan.value = -1;
      pannerR.pan.value = 1;

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
    gainL.gain.value = 0.25;
    gainR.gain.value = 0.25;

    oscL.start();
    oscR.start();

    this.currentNodes.push(oscL, oscR, gainL, gainR);
  }

  playChimeNotification() {
    this.init();
    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.8);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 0.85);
    });
  }
}

export const soundEngine = new SoundEngine();
