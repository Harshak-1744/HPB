const DEBUG = false;
const FLOW_TILE_SIZE = 15; 
const FLOW_TILE_INFLUENCE = 0.25; 
const FLOW_TILE_MOVEMENT = 0.0008; 
const PARTICLES_NUMBER = DEBUG ? 300 : 150; // Decreased particle count for clarity
const PARTICLES_MAX_MAGNITUDE = 4; // Reduced value for smoother particles

const FTS_HALF = FLOW_TILE_SIZE / 2;

let flowField;
let particles = [];
let fps;
let noiseZ = 0;
let timer = 0;
const RANDOM_PHASE_DURATION = 6 * 1000;
const TRANSITION_DURATION = 80 * 100;
let transitionStartTime = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  colorMode(HSB);
  noStroke();

  fps = document.querySelector('#fps');
  flowField = new FlowField();

  for (let i = 0; i < PARTICLES_NUMBER; i++) {
    addParticle(true);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
  flowField = new FlowField();
  particles = [];
  for (let i = 0; i < PARTICLES_NUMBER; i++) {
    addParticle(true);
  }
}

function addParticle(randomizePosition) {
  let x, y;
  if (randomizePosition) {
    x = random(width);
    y = random(height);
  } else {
    x = random(width);
    y = random(height);
  }

  particles.push(new Particle(x, y));
}

function draw() {
  noiseZ = frameCount * FLOW_TILE_MOVEMENT;
  if (fps) fps.innerHTML = round(frameRate(), 2);
  
  timer += deltaTime;
  if (timer >= RANDOM_PHASE_DURATION) {
    if (transitionStartTime === 0) {
      transitionStartTime = millis();
    }
  }

  flowField.update();

  if (DEBUG) {
    background(0);
    flowField.draw();
  }

  for (let i = 0; i < particles.length; i++) {
    const particle = particles[i];
    if (particle.isDead()) {
      particles.splice(i, 1);
      addParticle(timer < RANDOM_PHASE_DURATION);
    } else {
      if (timer >= RANDOM_PHASE_DURATION) {
        const elapsed = millis() - transitionStartTime;
        const t = constrain(elapsed / TRANSITION_DURATION, 0, 1);
        particle.moveToInfinityShape(t);
      } else {
        particle.updateRandomMovement();
      }
      particle.draw();
    }
  }

  // Draw a series of black dots forming an infinity symbol
  let x = 30 * cos(frameCount * 0.1) + width / 2;
  let y = 10 * sin(frameCount * 0.2) + height / 2;
  stroke(0);
  point(x, y);
}

class Particle {
  constructor(x, y) {
    this.color = [map(noise(x * 0.01, y * 0.01, noiseZ), 0.3, 0.7, 180, 360), 100, 150, (DEBUG ? 1 : 0.5)];
    this.magnitude = random(1, PARTICLES_MAX_MAGNITUDE);
    this.position = createVector(x, y);
    this.prevPosition = this.position.copy();
    this.direction = p5.Vector.random2D();
    this.direction.setMag(this.magnitude);
    this.transitionCompleted = false;
  }

  isDead() {
    return this.position.x < 0 || this.position.y < 0 || this.position.x > width || this.position.y > height;
  }

  updateRandomMovement() {
    this.position.add(this.direction);
    if (random() < 0.05) {
      this.direction = p5.Vector.random2D();
      this.direction.setMag(this.magnitude);
    }
  }

  moveToInfinityShape(t) {
    const centerX = width / 2;
    const centerY = height / 2;
    const scaleFactor = min(width, height) * 0.4; // Increased scale for a more distinct infinity symbol

    // Use a parametric equation for a clear infinity symbol (lemniscate)
    const angle = frameCount * 0.02; // Reduced speed for a smoother appearance
    const sinAngle = sin(angle);
    const cosAngle = cos(angle);
    const denominator = 1 + pow(sinAngle, 2);
    
    const x = scaleFactor * cosAngle / denominator + centerX;
    const y = scaleFactor * sinAngle * cosAngle / denominator + centerY;

    const target = createVector(x, y);
    this.direction = p5.Vector.sub(target, this.position).normalize().mult(this.magnitude);
    this.position.add(this.direction);

    if (t >= 1) {
      this.transitionCompleted = true;
    }
  }

  draw() {
    push();
    if (!DEBUG) {
      strokeCap(SQUARE);
      blendMode(LIGHTEST);
    }
    stroke(...this.color);
    strokeWeight(1);
    line(this.prevPosition.x, this.prevPosition.y, this.position.x, this.position.y);
    this.prevPosition = this.position.copy();
    pop();
  }
}

class FlowField {
  constructor() {
    this.flowField = [];
    for (let x = 0; x <= width; x += FLOW_TILE_SIZE) {
      this.flowField[x] = [];
      for (let y = 0; y <= height; y += FLOW_TILE_SIZE) {
        this.flowField[x][y] = new FlowTile(x, y);
      }
    }
  }

  getTileFor(currentX, currentY) {
    const x = floor(currentX / FLOW_TILE_SIZE) * FLOW_TILE_SIZE;
    const y = floor(currentY / FLOW_TILE_SIZE) * FLOW_TILE_SIZE;
    if (this.flowField[x] !== undefined) {
      if (this.flowField[x][y] !== undefined) {
        return this.flowField[x][y];
      }
    }
  }

  update() {
    for (const x in this.flowField) {
      const columns = this.flowField[x];
      for (const y in columns) {
        const tile = columns[y];
        tile.update();
      }
    }
  }

  draw() {
    for (const x in this.flowField) {
      const columns = this.flowField[x];
      for (const y in columns) {
        const tile = columns[y];
        tile.draw();
      }
    }
  }
}

class FlowTile {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.center = createVector(x + FTS_HALF, y + FTS_HALF);
    this.color = 0;
    this.update();
  }

  getRotation(x, y) {
    const size = 0.003;
    return map(noise(x * size, y * size, noiseZ), 0.3, 0.7, 0, PI * 2);
  }

  update() {
    this.direction = p5.Vector.fromAngle(this.getRotation(this.center.x, this.center.y));
  }

  draw() {
    push();
    stroke(0, 0, 25);
    noFill();
    rect(this.position.x, this.position.y, FLOW_TILE_SIZE, FLOW_TILE_SIZE);

    this.direction = p5.Vector.fromAngle(this.getRotation(this.center.x, this.center.y));
    translate(this.center.x, this.center.y);
    rotate(this.direction.heading());

    push();
    stroke(0, 0, 25);
    line(0, 0, FTS_HALF, 0);
    pop();

    pop();
  }
}
