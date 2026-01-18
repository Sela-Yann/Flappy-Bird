const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ================= GAME STATE =================
let gameRunning = true;
let gameOver = false;
let score = 0;
let highScore = localStorage.getItem("highScore") || 0;

// ================= BIRD =================
const bird = {
  x: 80,
  y: 200,
  r: 20,
  velocity: 0,
  gravity: 0.4,
  flap: -7,

  draw() {
    ctx.fillStyle = "#FFD700";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();

    // eye
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(this.x + 6, this.y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
  },

  update() {
    this.velocity += this.gravity;
    this.y += this.velocity;
  }
};

// ================= PIPES =================
const pipes = [];
const pipeGap = 150;
let pipeTimer = 0;

function createPipe() {
  const topHeight = Math.random() * 200 + 50;
  return {
    x: canvas.width,
    width: 60,
    top: topHeight,
    bottom: topHeight + pipeGap,
    scored: false
  };
}

// ================= DRAW =================
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // ground
  ctx.fillStyle = "#228B22";
  ctx.fillRect(0, canvas.height - 40, canvas.width, 40);

  bird.draw();

  // pipes
  ctx.fillStyle = "#228B22";
  pipes.forEach(p => {
    ctx.fillRect(p.x, 0, p.width, p.top);
    ctx.fillRect(
      p.x,
      p.bottom,
      p.width,
      canvas.height - p.bottom - 40
    );
  });

  // score
  ctx.fillStyle = "#000";
  ctx.font = "bold 24px Arial";
  ctx.fillText("Score: " + score, 20, 40);
  ctx.fillText("Best: " + highScore, 20, 70);

  // game over screen
  if (gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.font = "bold 36px Arial";
    ctx.fillText("Game Over", canvas.width / 2, 260);

    ctx.font = "22px Arial";
    ctx.fillText("Score: " + score, canvas.width / 2, 300);
    ctx.fillText("Tap to Try Again", canvas.width / 2, 340);

    ctx.textAlign = "left";
  }
}

// ================= UPDATE =================
function update() {
  bird.update();

  // pipes
  pipeTimer++;
  if (pipeTimer > 100) {
    pipes.push(createPipe());
    pipeTimer = 0;
  }

  pipes.forEach(p => {
    p.x -= 3;

    // score
    if (!p.scored && p.x + p.width < bird.x - bird.r) {
      score++;
      p.scored = true;
      document.getElementById('score').textContent = score;
    }

    // collision
    if (
      bird.x + bird.r > p.x &&
      bird.x - bird.r < p.x + p.width &&
      (bird.y - bird.r < p.top || bird.y + bird.r > p.bottom)
    ) {
      endGame();
    }
  });

  // ground collision
  if (bird.y + bird.r > canvas.height - 40) {
    endGame();
  }

  // ceiling
  if (bird.y - bird.r < 0) {
    bird.y = bird.r;
    bird.velocity = 0;
  }

  // remove off-screen pipes
  while (pipes.length && pipes[0].x + pipes[0].width < 0) {
    pipes.shift();
  }
}

// ================= GAME LOOP =================
function loop() {
  if (gameRunning) update();
  draw();
  requestAnimationFrame(loop);
}

// ================= GAME OVER =================
function endGame() {
  gameRunning = false;
  gameOver = true;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

// ================= RESTART =================
function restart() {
  bird.y = 200;
  bird.velocity = 0;
  pipes.length = 0;
  pipeTimer = 0;
  score = 0;
  gameRunning = true;
  gameOver = false;
}

// ================= CONTROLS =================
canvas.addEventListener("click", () => {
  if (gameOver) {
    restart();
  } else {
    bird.velocity = bird.flap;
  }
});

document.addEventListener("keydown", e => {
  if (e.code === "Space") {
    e.preventDefault();
    if (gameOver) restart();
    else bird.velocity = bird.flap;
  }
});

// Display initial high score
        document.getElementById('highScore').textContent = highScore;
        
// ================= START =================
loop();
