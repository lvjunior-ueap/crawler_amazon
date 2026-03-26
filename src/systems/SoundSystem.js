import * as THREE from "three";

export class SoundSystem {
  constructor({ domElement, world }) {
    this.domElement = domElement;
    this.world = world;
    this.audioContext = null;
    this.masterGain = null;
    this.noiseBuffer = null;
    this.timeUntilStep = 0;
    this.isUnlocked = false;
    this.ambientReady = false;
    this.ambientSources = null;
    this.timeUntilBirdCall = 0;

    this.unlock = this.unlock.bind(this);
    window.addEventListener("pointerdown", this.unlock, { passive: true });
    window.addEventListener("keydown", this.unlock);
  }

  unlock() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;

      if (!AudioContextClass) {
        return;
      }

      this.audioContext = new AudioContextClass();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.18;
      this.masterGain.connect(this.audioContext.destination);
      this.noiseBuffer = this.createNoiseBuffer();
      this.createAmbientBed();
    }

    if (this.audioContext.state === "suspended") {
      this.audioContext.resume();
    }

    this.isUnlocked = this.audioContext.state === "running";
  }

  createNoiseBuffer() {
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.18, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < data.length; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  createAmbientBed() {
    const now = this.audioContext.currentTime;
    const airNoise = this.audioContext.createBufferSource();
    const airFilter = this.audioContext.createBiquadFilter();
    const airGain = this.audioContext.createGain();
    const waterNoise = this.audioContext.createBufferSource();
    const waterFilter = this.audioContext.createBiquadFilter();
    const waterGain = this.audioContext.createGain();
    const rainNoise = this.audioContext.createBufferSource();
    const rainFilter = this.audioContext.createBiquadFilter();
    const rainGain = this.audioContext.createGain();
    const leafTone = this.audioContext.createOscillator();
    const leafGain = this.audioContext.createGain();
    const leafLfo = this.audioContext.createOscillator();
    const leafLfoGain = this.audioContext.createGain();

    airNoise.buffer = this.noiseBuffer;
    airNoise.loop = true;
    airFilter.type = "bandpass";
    airFilter.frequency.value = 900;
    airFilter.Q.value = 0.4;
    airGain.gain.value = 0.012;

    waterNoise.buffer = this.noiseBuffer;
    waterNoise.loop = true;
    waterFilter.type = "lowpass";
    waterFilter.frequency.value = 420;
    waterGain.gain.value = 0.0001;

    rainNoise.buffer = this.noiseBuffer;
    rainNoise.loop = true;
    rainFilter.type = "bandpass";
    rainFilter.frequency.value = 2800;
    rainFilter.Q.value = 0.5;
    rainGain.gain.value = 0.0001;

    leafTone.type = "triangle";
    leafTone.frequency.value = 180;
    leafGain.gain.value = 0.004;
    leafLfo.type = "sine";
    leafLfo.frequency.value = 0.18;
    leafLfoGain.gain.value = 24;

    airNoise.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(this.masterGain);

    waterNoise.connect(waterFilter);
    waterFilter.connect(waterGain);
    waterGain.connect(this.masterGain);

    rainNoise.connect(rainFilter);
    rainFilter.connect(rainGain);
    rainGain.connect(this.masterGain);

    leafTone.connect(leafGain);
    leafGain.connect(this.masterGain);
    leafLfo.connect(leafLfoGain);
    leafLfoGain.connect(leafTone.frequency);

    airNoise.start(now);
    waterNoise.start(now);
    rainNoise.start(now);
    leafTone.start(now);
    leafLfo.start(now);

    this.ambientSources = {
      airGain,
      waterGain,
      rainGain,
      leafGain,
    };
    this.ambientReady = true;
    this.timeUntilBirdCall = 2.5;
  }

  update({ player, deltaSeconds }) {
    if (!this.isUnlocked || !this.audioContext) {
      return;
    }

    this.updateAmbientMix(player, deltaSeconds);

    const horizontalSpeed = new THREE.Vector2(player.velocity.x, player.velocity.z).length();
    const isMoving = horizontalSpeed > 0.45 && player.isGrounded;

    if (!isMoving) {
      this.timeUntilStep = 0;
      return;
    }

    const interval = THREE.MathUtils.clamp(0.62 - horizontalSpeed * 0.03, 0.24, 0.5);

    this.timeUntilStep -= deltaSeconds;

    if (this.timeUntilStep > 0) {
      return;
    }

    this.playStep(this.world.getSurfaceType(player.object.position));
    this.timeUntilStep = interval;
  }

  updateAmbientMix(player, deltaSeconds) {
    if (!this.ambientReady) {
      return;
    }

    const riverDistance = Math.abs(player.object.position.x - this.world.getRiverCenterX(player.object.position.z));
    const riverWidth = this.world.getRiverWidth(player.object.position.z);
    const nearWater = THREE.MathUtils.clamp(1 - riverDistance / (riverWidth + 10), 0, 1);
    const elevation = this.world.getGroundHeightAt(player.object.position.x, player.object.position.z);
    const canopyDepth = THREE.MathUtils.clamp((elevation + 1) / 4, 0, 1);
    const now = this.audioContext.currentTime;

    this.ambientSources.airGain.gain.setTargetAtTime(0.009 + canopyDepth * 0.008, now, 0.8);
    this.ambientSources.leafGain.gain.setTargetAtTime(0.003 + canopyDepth * 0.004, now, 0.9);
    this.ambientSources.waterGain.gain.setTargetAtTime(0.001 + nearWater * 0.022, now, 0.6);
    this.ambientSources.rainGain.gain.setTargetAtTime(this.world.rainAmount * 0.038, now, 0.5);

    this.timeUntilBirdCall -= deltaSeconds;

    if (this.timeUntilBirdCall <= 0) {
      this.playBirdCall(0.12 + canopyDepth * 0.08);
      this.timeUntilBirdCall = 4 + Math.random() * 7;
    }
  }

  playBirdCall(intensity) {
    const now = this.audioContext.currentTime;
    const chirp = this.audioContext.createOscillator();
    const chirpGain = this.audioContext.createGain();
    const chirpFilter = this.audioContext.createBiquadFilter();
    const startFrequency = 1400 + Math.random() * 900;
    const endFrequency = startFrequency + 700 + Math.random() * 600;

    chirp.type = "sine";
    chirp.frequency.setValueAtTime(startFrequency, now);
    chirp.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.09);
    chirpFilter.type = "bandpass";
    chirpFilter.frequency.value = 2200;
    chirpFilter.Q.value = 1.4;

    chirpGain.gain.setValueAtTime(0.0001, now);
    chirpGain.gain.exponentialRampToValueAtTime(intensity, now + 0.015);
    chirpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    chirp.connect(chirpFilter);
    chirpFilter.connect(chirpGain);
    chirpGain.connect(this.masterGain);

    chirp.start(now);
    chirp.stop(now + 0.12);
  }

  playInteractionSound(interactable) {
    if (!this.isUnlocked || !this.audioContext || !interactable) {
      return;
    }

    const now = this.audioContext.currentTime;
    const voice = this.audioContext.createOscillator();
    const harmonics = this.audioContext.createOscillator();
    const filter = this.audioContext.createBiquadFilter();
    const gain = this.audioContext.createGain();
    const baseFrequency =
      interactable.sound === "jaguar" ? 180 :
      interactable.sound === "capybara" ? 260 :
      interactable.sound === "agouti" ? 520 :
      720;
    const endFrequency =
      interactable.sound === "plant" ? 980 :
      interactable.sound === "agouti" ? 760 :
      baseFrequency * 0.74;

    voice.type = interactable.sound === "plant" ? "triangle" : "sawtooth";
    harmonics.type = "triangle";
    voice.frequency.setValueAtTime(baseFrequency, now);
    voice.frequency.exponentialRampToValueAtTime(endFrequency, now + 0.18);
    harmonics.frequency.setValueAtTime(baseFrequency * 1.5, now);
    harmonics.frequency.exponentialRampToValueAtTime(endFrequency * 1.2, now + 0.15);

    filter.type = interactable.sound === "plant" ? "bandpass" : "lowpass";
    filter.frequency.value = interactable.sound === "plant" ? 1200 : 900;
    filter.Q.value = interactable.sound === "plant" ? 1.8 : 0.8;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(interactable.soundIntensity ?? 0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    voice.connect(filter);
    harmonics.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    voice.start(now);
    harmonics.start(now);
    voice.stop(now + 0.24);
    harmonics.stop(now + 0.2);
  }

  playStep(surfaceType) {
    const now = this.audioContext.currentTime;
    const noise = this.audioContext.createBufferSource();
    const filter = this.audioContext.createBiquadFilter();
    const contour = this.audioContext.createGain();
    const thump = this.audioContext.createOscillator();
    const thumpGain = this.audioContext.createGain();
    const noiseGainValue = surfaceType === "water" ? 0.09 : 0.055;
    const cutoff = surfaceType === "water" ? 700 : 1100;
    const thumpFrequency = surfaceType === "water" ? 82 : 60;

    noise.buffer = this.noiseBuffer;
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(cutoff, now);
    contour.gain.setValueAtTime(0.0001, now);
    contour.gain.exponentialRampToValueAtTime(noiseGainValue, now + 0.01);
    contour.gain.exponentialRampToValueAtTime(0.0001, now + 0.11);

    thump.type = "triangle";
    thump.frequency.setValueAtTime(thumpFrequency, now);
    thump.frequency.exponentialRampToValueAtTime(thumpFrequency * 0.72, now + 0.08);
    thumpGain.gain.setValueAtTime(0.0001, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.055, now + 0.008);
    thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.085);

    noise.connect(filter);
    filter.connect(contour);
    contour.connect(this.masterGain);

    thump.connect(thumpGain);
    thumpGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.12);
    thump.start(now);
    thump.stop(now + 0.09);
  }
}
