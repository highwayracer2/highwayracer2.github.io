/**
 * Highway Racer 2 - Core Game Engine
 * Features: High-speed traffic weaving, dynamic particle FX, Web Audio synthesis, responsive canvas.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.engineOsc = null;
    this.engineGain = null;
    this.initAudioContext();
  }

  initAudioContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  ensureContext() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startEngine() {
    if (this.isMuted || !this.ctx || this.engineOsc) return;
    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.setValueAtTime(65, this.ctx.currentTime);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  updateEngine(speed, isNitro) {
    if (this.isMuted || !this.ctx || !this.engineOsc) return;
    try {
      const baseFreq = 65 + (speed / 300) * 160;
      const targetFreq = isNitro ? baseFreq * 1.5 : baseFreq;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
    } catch (e) {}
  }

  stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch (e) {}
      this.engineOsc = null;
    }
  }

  playCoinSound() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch (e) {}
  }

  playCloseCallSound() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  playNitroSound() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    try {
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.Q.setValueAtTime(3, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  playCrashSound() {
    if (this.isMuted || !this.ctx) return;
    this.ensureContext();
    try {
      const bufferSize = this.ctx.sampleRate * 0.7;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.6);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.7);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start();
    } catch (e) {}
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopEngine();
    } else {
      this.ensureContext();
      this.startEngine();
    }
    return this.isMuted;
  }
}

class HighwayRacerGame {
  constructor(canvasId, options = {}) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.audio = new AudioEngine();

    // Custom Options & Modes
    this.options = options;
    this.mode = options.mode || 'highway'; // 'highway', 'drift', 'police', 'ramp', 'moto'
    this.title = options.title || 'HIGHWAY RACER 2';
    this.storageKey = options.storageKey || 'hr2_highscore';
    this.themeColor = options.themeColor || '#00f0ff';

    // Canvas sizing
    this.dpr = window.devicePixelRatio || 1;
    this.width = 0;
    this.height = 0;
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Game state
    this.state = 'START'; // 'START', 'PLAYING', 'PAUSED', 'GAMEOVER'
    this.score = 0;
    this.distance = 0;
    this.highScore = parseInt(localStorage.getItem(this.storageKey) || '0', 10);
    this.speed = 0;
    this.maxSpeed = this.mode === 'moto' ? 240 : (this.mode === 'ramp' ? 250 : 220);
    this.nitroMaxSpeed = this.mode === 'moto' ? 340 : 315;
    this.nitro = 100;
    this.maxNitro = 100;
    this.isNitroActive = false;
    this.airTime = 0; // for ramp stunts

    // Road specs
    this.roadX = 0;
    this.roadWidth = 0;
    this.lanes = 4;
    this.roadOffset = 0;

    // Player vehicle dimensions
    const isMoto = this.mode === 'moto';
    this.player = {
      x: 0,
      y: 0,
      w: isMoto ? 28 : 46,
      h: isMoto ? 72 : 88,
      speedX: 0,
      targetLane: 1,
      tilt: 0,
      color: this.themeColor
    };

    // Entities
    this.traffic = [];
    this.items = []; // coins, nitro tanks, ramps
    this.particles = [];
    this.floatingTexts = [];

    // Controls
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
      nitro: false
    };

    this.bindEvents();
    this.reset();

    // Game loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height || 580;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(this.dpr, this.dpr);

    // Dynamic Road width based on screen width
    this.roadWidth = Math.min(this.width * 0.78, 480);
    this.roadX = (this.width - this.roadWidth) / 2;

    if (this.state === 'START' && this.player) {
      this.player.x = this.roadX + this.roadWidth / 2 - this.player.w / 2;
      this.player.y = this.height - 130;
    }
  }

  reset() {
    this.score = 0;
    this.distance = 0;
    this.speed = 0;
    this.nitro = 100;
    this.traffic = [];
    this.items = [];
    this.particles = [];
    this.floatingTexts = [];

    this.player.x = this.roadX + this.roadWidth / 2 - this.player.w / 2;
    this.player.y = this.height - 130;
    this.player.speedX = 0;
    this.player.tilt = 0;
  }

  start() {
    this.audio.ensureContext();
    this.audio.startEngine();
    this.reset();
    this.state = 'PLAYING';
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      this.audio.stopEngine();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.audio.startEngine();
      this.lastTime = performance.now();
    }
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        this.keys.up = true;
        e.preventDefault();
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        this.keys.down = true;
        e.preventDefault();
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        this.keys.left = true;
        e.preventDefault();
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        this.keys.right = true;
        e.preventDefault();
      }
      if (['Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        this.keys.nitro = true;
        if (this.state === 'START' || this.state === 'GAMEOVER') {
          this.start();
        }
        e.preventDefault();
      }
      if (e.code === 'KeyP') {
        this.togglePause();
      }
    });

    window.addEventListener('keyup', (e) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) this.keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) this.keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) this.keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) this.keys.right = false;
      if (['Space', 'ShiftLeft', 'ShiftRight'].includes(e.code)) this.keys.nitro = false;
    });

    // Canvas click to start or restart
    this.canvas.addEventListener('click', (e) => {
      if (this.state === 'START' || this.state === 'GAMEOVER') {
        this.start();
      }
    });
  }

  spawnTraffic() {
    const laneWidth = this.roadWidth / this.lanes;
    const lane = Math.floor(Math.random() * this.lanes);
    const laneCenterX = this.roadX + lane * laneWidth + laneWidth / 2;

    // Check if lane is already occupied at the top
    const isOccupied = this.traffic.some(car => Math.abs(car.y - (-100)) < 180 && Math.abs(car.x + car.w / 2 - laneCenterX) < 30);
    if (isOccupied) return;

    const carTypes = [
      { type: 'sports', w: 44, h: 84, color: '#ff2a6d', baseSpeed: 100 },
      { type: 'sedan', w: 46, h: 88, color: '#ffb703', baseSpeed: 85 },
      { type: 'truck', w: 52, h: 125, color: '#05d9e8', baseSpeed: 65 },
      { type: 'suv', w: 48, h: 92, color: '#9b5de5', baseSpeed: 80 }
    ];

    const model = carTypes[Math.floor(Math.random() * carTypes.length)];
    this.traffic.push({
      x: laneCenterX - model.w / 2,
      y: -150,
      w: model.w,
      h: model.h,
      color: model.color,
      type: model.type,
      speed: model.baseSpeed + Math.random() * 20,
      passed: false
    });
  }

  spawnItem() {
    const laneWidth = this.roadWidth / this.lanes;
    const lane = Math.floor(Math.random() * this.lanes);
    const laneCenterX = this.roadX + lane * laneWidth + laneWidth / 2;

    const isCoin = Math.random() > 0.35;
    this.items.push({
      x: laneCenterX,
      y: -60,
      type: isCoin ? 'coin' : 'nitro',
      size: 16,
      rotation: 0
    });
  }

  addParticles(x, y, color, count = 10, speedMul = 1) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = (Math.random() * 3 + 1) * speedMul;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  addFloatingText(text, x, y, color = '#00f0ff') {
    this.floatingTexts.push({
      text,
      x,
      y,
      color,
      alpha: 1,
      vy: -1.8
    });
  }

  update(dt) {
    if (this.state !== 'PLAYING') return;

    // Nitro control
    this.isNitroActive = this.keys.nitro && this.nitro > 0 && this.speed > 80;
    if (this.isNitroActive) {
      this.nitro = Math.max(0, this.nitro - dt * 28);
      if (Math.random() < 0.3) this.audio.playNitroSound();
    } else {
      this.nitro = Math.min(this.maxNitro, this.nitro + dt * 4); // Slow recharge
    }

    // Speed acceleration / braking
    const currentMaxSpeed = this.isNitroActive ? this.nitroMaxSpeed : this.maxSpeed;
    if (this.keys.up || this.isNitroActive) {
      const accelRate = this.isNitroActive ? 140 : 85;
      this.speed = Math.min(currentMaxSpeed, this.speed + accelRate * dt);
    } else if (this.keys.down) {
      this.speed = Math.max(0, this.speed - 160 * dt); // Brake hard
    } else {
      // Natural rolling speed
      this.speed = Math.min(currentMaxSpeed, Math.max(90, this.speed + 35 * dt));
    }

    this.audio.updateEngine(this.speed, this.isNitroActive);

    // Road scroll
    const scrollDelta = (this.speed * 12) * dt;
    this.roadOffset = (this.roadOffset + scrollDelta) % 60;
    this.distance += (this.speed * dt) / 3.6; // in meters
    this.score += Math.floor((this.speed / 10) * dt * (this.isNitroActive ? 2.5 : 1));

    // Player Lateral steering
    const turnSpeed = 340;
    let targetTilt = 0;
    if (this.keys.left) {
      this.player.x -= turnSpeed * dt;
      targetTilt = -0.12;
    }
    if (this.keys.right) {
      this.player.x += turnSpeed * dt;
      targetTilt = 0.12;
    }
    this.player.tilt += (targetTilt - this.player.tilt) * 0.15;

    // Road boundary collision
    const roadLeft = this.roadX + 12;
    const roadRight = this.roadX + this.roadWidth - this.player.w - 12;
    if (this.player.x < roadLeft) {
      this.player.x = roadLeft;
      this.speed = Math.max(40, this.speed - 90 * dt);
      this.addParticles(this.player.x, this.player.y + 40, '#fff', 2);
    }
    if (this.player.x > roadRight) {
      this.player.x = roadRight;
      this.speed = Math.max(40, this.speed - 90 * dt);
      this.addParticles(this.player.x + this.player.w, this.player.y + 40, '#fff', 2);
    }

    // Exhaust Nitro Particles
    if (this.isNitroActive || this.speed > 160) {
      const pColor = this.isNitroActive ? '#00f0ff' : '#ff5500';
      this.addParticles(this.player.x + 10, this.player.y + this.player.h, pColor, 1, 0.5);
      this.addParticles(this.player.x + this.player.w - 10, this.player.y + this.player.h, pColor, 1, 0.5);
    }

    // Spawn Traffic & Items
    if (Math.random() < 0.024) this.spawnTraffic();
    if (Math.random() < 0.012) this.spawnItem();

    // Update Traffic
    for (let i = this.traffic.length - 1; i >= 0; i--) {
      const car = this.traffic[i];
      // Relative movement speed against player
      const relSpeed = (this.speed - car.speed) * 12 * dt;
      car.y += relSpeed;

      // Close call detection (near-miss)
      if (!car.passed && car.y > this.player.y && car.y < this.player.y + this.player.h) {
        const lateralDist = Math.abs((this.player.x + this.player.w / 2) - (car.x + car.w / 2));
        if (lateralDist < 58 && lateralDist > 30 && this.speed > 120) {
          car.passed = true;
          this.score += 500;
          this.audio.playCloseCallSound();
          this.addFloatingText('+500 CLOSE CALL!', this.player.x - 10, this.player.y - 15, '#00ff88');
        }
      }

      // Check Collision with Player
      if (this.checkCollision(this.player, car)) {
        this.crash();
        return;
      }

      // Remove off-screen traffic
      if (car.y > this.height + 150 || car.y < -300) {
        this.traffic.splice(i, 1);
      }
    }

    // Update Items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      item.y += this.speed * 12 * dt;
      item.rotation += dt * 4;

      // Pick up item check
      const dx = (this.player.x + this.player.w / 2) - item.x;
      const dy = (this.player.y + this.player.h / 2) - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 38) {
        if (item.type === 'coin') {
          this.score += 150;
          this.audio.playCoinSound();
          this.addFloatingText('+150 COIN!', item.x - 20, item.y, '#ffd700');
          this.addParticles(item.x, item.y, '#ffd700', 8);
        } else if (item.type === 'nitro') {
          this.nitro = Math.min(this.maxNitro, this.nitro + 45);
          this.audio.playCoinSound();
          this.addFloatingText('+NITRO!', item.x - 20, item.y, '#00f0ff');
          this.addParticles(item.x, item.y, '#00f0ff', 10);
        }
        this.items.splice(i, 1);
        continue;
      }

      if (item.y > this.height + 60) {
        this.items.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= dt * 1.2;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  checkCollision(a, b) {
    const margin = 7;
    return (
      a.x + margin < b.x + b.w - margin &&
      a.x + a.w - margin > b.x + margin &&
      a.y + margin < b.y + b.h - margin &&
      a.y + a.h - margin > b.y + margin
    );
  }

  crash() {
    this.state = 'GAMEOVER';
    this.audio.stopEngine();
    this.audio.playCrashSound();
    this.addParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, '#ff3300', 40, 3);
    this.addParticles(this.player.x + this.player.w / 2, this.player.y + this.player.h / 2, '#ffcc00', 25, 2.5);

    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('hr2_highscore', this.highScore.toString());
    }
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Roadside Environment
    this.drawEnvironment();

    // 2. Draw Highway Asphalt & Lanes
    this.drawRoad();

    // 3. Draw Items (Coins & Nitro)
    this.drawItems();

    // 4. Draw Traffic
    this.drawTraffic();

    // 5. Draw Player Car
    this.drawPlayer();

    // 6. Draw Speedlines & Particles
    this.drawParticles();

    // 7. Draw Floating Texts
    this.drawFloatingTexts();

    // 8. Draw HUD Overlay
    this.drawHUD();

    // 9. Draw State Overlays (Start, Pause, Game Over)
    this.drawScreens();
  }

  drawEnvironment() {
    // Roadside shoulder stripes & dark neon horizon
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.height);
    grad.addColorStop(0, '#06070a');
    grad.addColorStop(1, '#0e111a');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Distant city silhouette / grid lines
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }
  }

  drawRoad() {
    const { roadX, roadWidth, lanes, roadOffset } = this;

    // Road asphalt
    this.ctx.fillStyle = '#11141e';
    this.ctx.fillRect(roadX, 0, roadWidth, this.height);

    // Guard rails / neon borders
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.shadowColor = '#00f0ff';
    this.ctx.shadowBlur = 10;
    this.ctx.fillRect(roadX - 4, 0, 4, this.height);
    this.ctx.fillRect(roadX + roadWidth, 0, 4, this.height);
    this.ctx.shadowBlur = 0;

    // Red-white kerb accents along sides
    const kerbHeight = 35;
    const kerbOffset = roadOffset % (kerbHeight * 2);
    for (let y = -kerbHeight * 2 + kerbOffset; y < this.height; y += kerbHeight * 2) {
      this.ctx.fillStyle = '#ff3300';
      this.ctx.fillRect(roadX - 8, y, 4, kerbHeight);
      this.ctx.fillRect(roadX + roadWidth + 4, y, 4, kerbHeight);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(roadX - 8, y + kerbHeight, 4, kerbHeight);
      this.ctx.fillRect(roadX + roadWidth + 4, y + kerbHeight, 4, kerbHeight);
    }

    // Lane dividing dashed lines
    const laneW = roadWidth / lanes;
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    this.ctx.lineWidth = 3;
    this.ctx.setLineDash([30, 30]);
    this.ctx.lineDashOffset = -roadOffset;

    for (let i = 1; i < lanes; i++) {
      const lx = roadX + i * laneW;
      this.ctx.beginPath();
      this.ctx.moveTo(lx, 0);
      this.ctx.lineTo(lx, this.height);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]);
  }

  drawItems() {
    this.items.forEach(item => {
      this.ctx.save();
      this.ctx.translate(item.x, item.y);
      this.ctx.rotate(item.rotation);

      if (item.type === 'coin') {
        // Glowing Gold Coin
        this.ctx.fillStyle = '#ffd700';
        this.ctx.shadowColor = '#ffd700';
        this.ctx.shadowBlur = 12;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 11, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#b8860b';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 7, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 9px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('$', 0, 0);
      } else {
        // Glowing Nitro Canister
        this.ctx.fillStyle = '#00f0ff';
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.shadowBlur = 14;
        this.ctx.fillRect(-6, -10, 12, 20);
        this.ctx.fillStyle = '#ff5500';
        this.ctx.fillRect(-4, -13, 8, 3);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 8px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('N', 0, 3);
      }
      this.ctx.restore();
    });
  }

  drawTraffic() {
    this.traffic.forEach(car => {
      this.ctx.save();
      this.ctx.translate(car.x, car.y);

      // Car shadow
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      this.ctx.fillRect(2, 6, car.w, car.h);

      // Car body
      this.ctx.fillStyle = car.color;
      this.roundRect(0, 0, car.w, car.h, 6);
      this.ctx.fill();

      // Windshield & rear window
      this.ctx.fillStyle = '#10141e';
      this.ctx.fillRect(5, car.h * 0.2, car.w - 10, car.h * 0.18); // front glass
      this.ctx.fillRect(6, car.h * 0.65, car.w - 12, car.h * 0.14); // rear glass

      // Roof
      this.ctx.fillStyle = 'rgba(0,0,0,0.18)';
      this.ctx.fillRect(7, car.h * 0.38, car.w - 14, car.h * 0.27);

      // Headlights / Taillights
      this.ctx.fillStyle = '#fff';
      this.ctx.fillRect(4, 0, 6, 3);
      this.ctx.fillRect(car.w - 10, 0, 6, 3);

      this.ctx.fillStyle = '#ff0033';
      this.ctx.shadowColor = '#ff0033';
      this.ctx.shadowBlur = 6;
      this.ctx.fillRect(4, car.h - 3, 7, 3);
      this.ctx.fillRect(car.w - 11, car.h - 3, 7, 3);

      this.ctx.restore();
    });
  }

  drawPlayer() {
    const { x, y, w, h, tilt } = this.player;

    this.ctx.save();
    this.ctx.translate(x + w / 2, y + h / 2);
    this.ctx.rotate(tilt);

    // Underglow Neon
    this.ctx.shadowColor = this.isNitroActive ? '#ff5500' : '#00f0ff';
    this.ctx.shadowBlur = 24;
    this.ctx.fillStyle = this.isNitroActive ? 'rgba(255, 85, 0, 0.4)' : 'rgba(0, 240, 255, 0.35)';
    this.ctx.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);

    // Car Body (High-tech aerodynamic racer)
    const bodyGrad = this.ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    bodyGrad.addColorStop(0, '#00b4d8');
    bodyGrad.addColorStop(0.5, '#90e0ef');
    bodyGrad.addColorStop(1, '#0077b6');
    this.ctx.fillStyle = bodyGrad;
    this.roundRect(-w / 2, -h / 2, w, h, 8);
    this.ctx.fill();

    // Racing Stripes
    this.ctx.fillStyle = '#060810';
    this.ctx.fillRect(-4, -h / 2, 8, h);

    // Front windshield
    this.ctx.fillStyle = '#0a101d';
    this.ctx.beginPath();
    this.ctx.moveTo(-w / 2 + 5, -h / 2 + 20);
    this.ctx.lineTo(w / 2 - 5, -h / 2 + 20);
    this.ctx.lineTo(w / 2 - 8, -h / 2 + 38);
    this.ctx.lineTo(-w / 2 + 8, -h / 2 + 38);
    this.ctx.closePath();
    this.ctx.fill();

    // Rear windshield
    this.ctx.fillRect(-w / 2 + 7, h / 2 - 28, w - 14, 12);

    // Headlight Beams illuminating forward
    this.ctx.shadowBlur = 0;
    const beamGrad = this.ctx.createLinearGradient(0, -h / 2, 0, -h / 2 - 120);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    this.ctx.fillStyle = beamGrad;
    this.ctx.beginPath();
    this.ctx.moveTo(-w / 2 + 4, -h / 2);
    this.ctx.lineTo(-w / 2 - 18, -h / 2 - 130);
    this.ctx.lineTo(w / 2 + 18, -h / 2 - 130);
    this.ctx.lineTo(w / 2 - 4, -h / 2);
    this.ctx.closePath();
    this.ctx.fill();

    // Spoiler
    this.ctx.fillStyle = '#05070c';
    this.ctx.fillRect(-w / 2 - 1, h / 2 - 8, w + 2, 5);

    // Taillights
    this.ctx.fillStyle = this.keys.down ? '#ff0000' : '#cc0022';
    this.ctx.shadowColor = '#ff0000';
    this.ctx.shadowBlur = this.keys.down ? 16 : 8;
    this.ctx.fillRect(-w / 2 + 4, h / 2 - 3, 8, 3);
    this.ctx.fillRect(w / 2 - 12, h / 2 - 3, 8, 3);

    this.ctx.restore();
  }

  drawParticles() {
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 8;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Speed warp lines at extreme velocities
    if (this.speed > 200) {
      const count = Math.floor((this.speed - 200) / 10);
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      this.ctx.lineWidth = 1.5;
      for (let i = 0; i < count; i++) {
        const sx = this.roadX + Math.random() * this.roadWidth;
        const sy = Math.random() * this.height;
        this.ctx.beginPath();
        this.ctx.moveTo(sx, sy);
        this.ctx.lineTo(sx, sy + 35);
        this.ctx.stroke();
      }
    }
  }

  drawFloatingTexts() {
    this.floatingTexts.forEach(ft => {
      this.ctx.save();
      this.ctx.globalAlpha = ft.alpha;
      this.ctx.fillStyle = ft.color;
      this.ctx.shadowColor = ft.color;
      this.ctx.shadowBlur = 10;
      this.ctx.font = '900 16px "Rajdhani", sans-serif';
      this.ctx.fillText(ft.text, ft.x, ft.y);
      this.ctx.restore();
    });
  }

  drawHUD() {
    // Top HUD panel
    const hudPadding = 20;

    // Score & High Score
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '800 20px "Rajdhani", sans-serif';
    this.ctx.fillText(`SCORE: ${this.score}`, hudPadding, 35);

    this.ctx.fillStyle = '#8e9bb5';
    this.ctx.font = '700 14px "Rajdhani", sans-serif';
    this.ctx.fillText(`BEST: ${this.highScore}`, hudPadding, 55);

    // Distance
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.font = '800 16px "Rajdhani", sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`${(this.distance / 1000).toFixed(2)} KM`, this.width - hudPadding, 35);

    // Speedometer Digital Display
    const spdDisplay = Math.round(this.speed);
    this.ctx.fillStyle = this.isNitroActive ? '#ff5500' : '#fff';
    this.ctx.font = '900 26px "Rajdhani", sans-serif';
    this.ctx.fillText(`${spdDisplay} KM/H`, this.width - hudPadding, 64);
    this.ctx.textAlign = 'left';

    // Nitro Fuel Gauge Bar
    const barW = 140;
    const barH = 10;
    const barX = this.width - hudPadding - barW;
    const barY = 74;

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    this.roundRect(barX, barY, barW, barH, 4);
    this.ctx.fill();

    const nitroWidth = (this.nitro / this.maxNitro) * barW;
    this.ctx.fillStyle = this.isNitroActive ? '#ff5500' : '#00f0ff';
    this.ctx.shadowColor = this.ctx.fillStyle;
    this.ctx.shadowBlur = 8;
    this.roundRect(barX, barY, nitroWidth, barH, 4);
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  drawScreens() {
    if (this.state === 'START') {
      this.ctx.fillStyle = 'rgba(5, 7, 12, 0.75)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = this.themeColor || '#00f0ff';
      this.ctx.shadowColor = this.themeColor || '#00f0ff';
      this.ctx.shadowBlur = 18;
      this.ctx.font = '900 38px "Rajdhani", sans-serif';
      this.ctx.fillText(this.title, this.width / 2, this.height / 2 - 30);

      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '700 18px "Outfit", sans-serif';
      this.ctx.fillText('CLICK HERE OR PRESS SPACE TO START', this.width / 2, this.height / 2 + 18);

      this.ctx.fillStyle = '#8e9bb5';
      this.ctx.font = '500 14px "Outfit", sans-serif';
      this.ctx.fillText('Steer: [A/D] or [Arrows] | Nitro: [SPACE]', this.width / 2, this.height / 2 + 48);
      this.ctx.textAlign = 'left';
    } else if (this.state === 'PAUSED') {
      this.ctx.fillStyle = 'rgba(5, 7, 12, 0.65)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = '900 36px "Rajdhani", sans-serif';
      this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = '600 16px "Outfit", sans-serif';
      this.ctx.fillText('Press [P] or Click Resume', this.width / 2, this.height / 2 + 35);
      this.ctx.textAlign = 'left';
    } else if (this.state === 'GAMEOVER') {
      this.ctx.fillStyle = 'rgba(7, 8, 14, 0.85)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.textAlign = 'center';
      this.ctx.fillStyle = '#ff0055';
      this.ctx.shadowColor = '#ff0055';
      this.ctx.shadowBlur = 20;
      this.ctx.font = '900 42px "Rajdhani", sans-serif';
      this.ctx.fillText('CRASHED!', this.width / 2, this.height / 2 - 50);

      this.ctx.shadowBlur = 0;
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '800 24px "Rajdhani", sans-serif';
      this.ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2);

      this.ctx.fillStyle = '#00f0ff';
      this.ctx.font = '700 18px "Rajdhani", sans-serif';
      this.ctx.fillText(`TOP RECORD: ${this.highScore}`, this.width / 2, this.height / 2 + 30);

      this.ctx.fillStyle = '#ffd700';
      this.ctx.font = '700 16px "Outfit", sans-serif';
      this.ctx.fillText('CLICK OR PRESS SPACE TO RACE AGAIN', this.width / 2, this.height / 2 + 75);
      this.ctx.textAlign = 'left';
    }
  }

  roundRect(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.arcTo(x + w, y, x + w, y + h, r);
    this.ctx.arcTo(x + w, y + h, x, y + h, r);
    this.ctx.arcTo(x, y + h, x, y, r);
    this.ctx.arcTo(x, y, x + w, y, r);
    this.ctx.closePath();
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }
}

// Global initialization hook
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('gameCanvas')) {
    const config = window.gameConfig || {};
    window.gameInstance = new HighwayRacerGame('gameCanvas', config);
  }
});
