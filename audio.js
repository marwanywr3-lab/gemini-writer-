/**
 * مشغل وتوليد الأصوات الدافئة بالمتصفح (Web Audio API)
 * يولد أصوات المطر، الموقد، والرياح برمجياً دون الحاجة لملفات صوت خارجية ثقيلة
 */

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.tracks = {
      rain: { playing: false, node: null, gain: null, volume: 0.4 },
      fire: { playing: false, node: null, gain: null, volume: 0.3 },
      wind: { playing: false, node: null, gain: null, volume: 0.25 }
    };
    this.masterVolume = 0.6;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  setMasterVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  setTrackVolume(name, val) {
    if (!this.tracks[name]) return;
    this.tracks[name].volume = Math.max(0, Math.min(1, val));
    if (this.tracks[name].gain && this.ctx) {
      this.tracks[name].gain.gain.setTargetAtTime(this.tracks[name].volume, this.ctx.currentTime, 0.05);
    }
  }

  toggleTrack(name) {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const track = this.tracks[name];
    if (!track) return false;

    if (track.playing) {
      this.stopTrack(name);
      return false;
    } else {
      this.startTrack(name);
      return true;
    }
  }

  startTrack(name) {
    const track = this.tracks[name];
    if (track.playing) return;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(track.volume, this.ctx.currentTime);
    gain.connect(this.masterGain);
    track.gain = gain;

    if (name === 'rain') {
      track.node = this.createRainNode(gain);
    } else if (name === 'fire') {
      track.node = this.createFireNode(gain);
    } else if (name === 'wind') {
      track.node = this.createWindNode(gain);
    }

    track.playing = true;
  }

  stopTrack(name) {
    const track = this.tracks[name];
    if (!track.playing) return;

    if (track.node) {
      try {
        if (track.node.stop) track.node.stop();
        track.node.disconnect();
      } catch (e) {}
      track.node = null;
    }
    track.playing = false;
  }

  // توليد صوت المطر: ضوضاء وردية مع فلتر تمرير منخفض
  createRainNode(dest) {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);

    noise.connect(filter);
    filter.connect(dest);
    noise.start();
    return noise;
  }

  // توليد صوت الموقد وطقطقة الحطب
  createFireNode(dest) {
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // طقطقة عشوائية حادة تحاكي تكسر الخشب
      const isCrackle = Math.random() < 0.002;
      if (isCrackle) {
        data[i] = (Math.random() * 2 - 1) * 0.8;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.04; // هسهسة اللهب
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }

  // توليد صوت نسيم الرياح العليل
  createWindNode(dest) {
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);

    // تذبذب طفيف في تردد الريح لإعطاء إحساس بالتموج الطبيعي
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(0.2, this.ctx.currentTime);
    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(150, this.ctx.currentTime);
    osc.connect(oscGain);
    oscGain.connect(filter.frequency);
    osc.start();

    source.connect(filter);
    filter.connect(dest);
    source.start();
    return source;
  }
}

window.ambientAudio = new AmbientAudioEngine();
