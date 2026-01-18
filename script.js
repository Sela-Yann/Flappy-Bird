  const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // Responsive canvas sizing
        function resizeCanvas() {
            const container = canvas.parentElement;
            const maxWidth = Math.min(window.innerWidth - 20, 500);
            const aspectRatio = 400 / 600;
            
            canvas.style.width = maxWidth + 'px';
            canvas.style.height = (maxWidth / aspectRatio) + 'px';
        }
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('orientationchange', () => {
            setTimeout(resizeCanvas, 100);
        });
        
        // Game variables
        let gameRunning = true;
        let score = 0;
        let highScore = localStorage.getItem('flappyBirdHighScore') || 0;
        let touchStartX = 0;
        let touchStartY = 0;
        
        // Bird object
        const bird = {
            x: 50,
            y: 150,
            width: 40,
            height: 40,
            velocity: 0,
            gravity: 0.25,
            flapPower: -6,
            draw: function() {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
                
                // Eye
                ctx.fillStyle = 'black';
                ctx.beginPath();
                ctx.arc(this.x + 8, this.y - 5, 4, 0, Math.PI * 2);
                ctx.fill();
            },
            update: function() {
                this.velocity += this.gravity;
                this.y += this.velocity;
            }
        };
        
        // Pipe object
        function createPipe() {
            const minPipeHeight = 100;
            const maxPipeHeight = 300;
            const pipeGap = 150;
            const randomHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
            
            return {
                x: canvas.width,
                topHeight: randomHeight,
                bottomY: randomHeight + pipeGap,
                width: 50,
                scored: false
            };
        }
        
        let pipes = [];
        let pipeTimer = 0;
        
        // Draw function
        function draw() {
            // Background
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw ground
            ctx.fillStyle = '#228B22';
            ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
            
            // Draw bird
            bird.draw();
            
            // Draw pipes
            ctx.fillStyle = '#228B22';
            pipes.forEach(pipe => {
                // Top pipe
                ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
                // Bottom pipe
                ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY - 40);
            });
            
            // Draw score
            ctx.fillStyle = 'black';
            ctx.font = 'bold 24px Arial';
            ctx.fillText('Score: ' + score, 20, 40);
        }
        
        // Update function
        function update() {
            bird.update();
            
            // Remove off-screen pipes and add new ones
            pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
            
            pipeTimer++;
            if (pipeTimer > 100) {
                pipes.push(createPipe());
                pipeTimer = 0;
            }
            
            // Move pipes
            pipes.forEach(pipe => {
                pipe.x -= 5;
                
                // Check if bird scored
                if (!pipe.scored && pipe.x + pipe.width < bird.x && pipe.x + pipe.width > bird.x - 5) {
                    score++;
                    pipe.scored = true;
                    document.getElementById('score').textContent = score;
                }
            });
            
            // Collision detection with pipes
            pipes.forEach(pipe => {
                if (bird.x + bird.width / 2 > pipe.x && bird.x - bird.width / 2 < pipe.x + pipe.width) {
                    if (bird.y - bird.width / 2 < pipe.topHeight || bird.y + bird.height / 2 > pipe.bottomY) {
                        endGame();
                    }
                }
            });
            
            // Collision detection with ground
            if (bird.y + bird.height / 2 > canvas.height - 40) {
                endGame();
            }
            
            // Collision detection with ceiling
            if (bird.y - bird.height / 2 < 0) {
                bird.y = bird.height / 2;
                bird.velocity = 0;
            }
        }
        
        // Game loop
        function gameLoop() {
            if (gameRunning) {
                update();
            }
            draw();
            requestAnimationFrame(gameLoop);
        }
        
        // End game function
        function endGame() {
            gameRunning = false;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('flappyBirdHighScore', highScore);
                document.getElementById('highScore').textContent = highScore;
            }
            alert('Game Over! Score: ' + score + '\\nHigh Score: ' + highScore + '\\nPress R to restart');
        }
        
        // Restart game
        function restart() {
            bird.y = 150;
            bird.velocity = 0;
            score = 0;
            pipes = [];
            pipeTimer = 0;
            gameRunning = true;
            document.getElementById('score').textContent = 0;
        }
        
        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (gameRunning) {
                    bird.velocity = bird.flapPower;
                }
            }
            if (e.code === 'KeyR') {
                restart();
            }
        });
        
        canvas.addEventListener('click', () => {
            if (gameRunning) {
                bird.velocity = bird.flapPower;
            }
        });
        
        // Touch controls for mobile
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            if (!gameRunning) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffY = touchEndY - touchStartY;
            const diffX = touchEndX - touchStartX;
            
            // If touched on canvas or near it, make bird flap
            if (Math.abs(diffX) < 50 && Math.abs(diffY) < 100) {
                bird.velocity = bird.flapPower;
            }
            // Swipe down to restart
            else if (diffY > 100 && !gameRunning) {
                restart();
            }
        }, false);
        
        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target === canvas) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Display initial high score
        document.getElementById('highScore').textContent = highScore;
        
        // Start game loop
        gameLoop();