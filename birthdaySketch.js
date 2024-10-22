function setup() {
    createCanvas(windowWidth, windowHeight);
    fill(240);
    noStroke();
    loadFont(
      "https://ec-scripts.vercel.app/fonts/Sacramento-Regular.ttf",
      drawText,
      () => {
        alert("Error loading font.");
      }
    );
  }
  
  // This Redraws the Canvas when resized
  function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
  }
  
  let snowflakes = []; // array to hold snowflake objects
  let sf = null;
  
  function drawText(font) {
    sf = font;
  }
  
  function draw() {
    clear();
    background("rgba(0, 0, 0, 0)");
    let t = frameCount / 120; // update time
  
    // create a random number of snowflakes each frame
    snowflakes.push(new snowflake()); // append snowflake object
  
    // loop through snowflakes with a for..of loop
    for (let flake of snowflakes) {
      flake.update(t); // update snowflake position
      flake.display(); // draw snowflake
    }
  
    fill(230, 230, 240);
    textFont(sf ? sf : "sans-serif");
    textAlign(CENTER, CENTER);
    textSize(50);
    text(
      `Happy Birthday! ^-^
  Kiddo !!`,
      window.innerWidth / 2,
      window.innerHeight / 2
    );
  }
  
  // snowflake class
  function snowflake() {
    // initialize coordinates
    this.posX = 0;
    this.posY = random(-25, 0);
    this.initialangle = random(0, 2 * PI);
    this.size = random(1, 3);
  
    // radius of snowflake spiral
    this.radius = sqrt(random(pow(width / 2, 2)));
  
    this.update = function (time) {
      // x position follows a circle
      let w = 0.5 / this.size; // angular speed
      let angle = w * time + this.initialangle;
      this.posX = width / 2 + this.radius * sin(angle);
  
      // different size snowflakes fall at slightly different y speeds
      this.posY += pow(this.size, 0.75);
  
      // delete snowflake if past end of screen
      if (this.posY > height) {
        let index = snowflakes.indexOf(this);
        snowflakes.splice(index, 1);
      }
    };
  
    this.display = function () {
      ellipse(this.posX, this.posY, this.size);
    };
  }
  