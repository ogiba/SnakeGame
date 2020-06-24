const MoveDirection = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
};

const GameState = {
    NEW_GAME: "newGame",
    RUNNING: "running",
    GAME_OVER: "gameOver",
};

const KeyCode = {
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    SPACEBAR: 32,
};

class Size {
    constructor(width, height) {
        this.width = width;
        this.height = height;
    }
}

let snakeSize = 10;
let direction = MoveDirection.RIGHT;
let gameViewSize = new Size(0, 0);
let gameState = GameState.NEW_GAME;
let isMobile = false;

window.addEventListener("DOMContentLoaded", () => {
    let canvas = document.getElementById("gameBox");
    let ctx = canvas.getContext("2d");
    let calculatedSize =
        2 *
        Math.round(
            (canvas.width > window.innerWidth
                ? window.innerWidth - 20
                : canvas.width) / 2
        );
    ctx.canvas.width = calculatedSize;
    ctx.canvas.height = calculatedSize;

    gameViewSize = new Size(canvas.width, canvas.height);
    let score = 0;
    let highscore = 0;
    let snake = new Snake(ctx, 4);
    let food = FoodGenerator.generateOrange(ctx);
    let gameSpeed = 100;
    isMobile = window.innerWidth <= 800;

    handleKeyEvents();
    handleTapEvents();
    gameThread(gameSpeed);

    function gameThread(speed) {
        let gameLoop = setInterval(() => {
            ctx.fillStyle = "lightgrey";
            ctx.fillRect(0, 0, gameViewSize.width, gameViewSize.height);
            ctx.strokeStyle = "black";
            ctx.strokeRect(0, 0, gameViewSize.width, gameViewSize.height);

            if (gameState == GameState.NEW_GAME) {
                drawNewGame(
                    ctx,
                    gameViewSize.width / 2,
                    gameViewSize.height / 2
                );
            } else if (gameState == GameState.RUNNING) {
                let tailX = snake.tail[0].x;
                let tailY = snake.tail[0].y;

                switch (direction) {
                    case MoveDirection.RIGHT:
                        tailX++;
                        break;
                    case MoveDirection.DOWN:
                        tailY++;
                        break;
                    case MoveDirection.UP:
                        tailY--;
                        break;
                    case MoveDirection.LEFT:
                        tailX--;
                        break;
                }

                if (
                    tailX === -1 ||
                    tailX >= gameViewSize.width / snakeSize ||
                    tailY === -1 ||
                    tailY >= gameViewSize.height / snakeSize ||
                    checkCollision(snake, new Point(tailX, tailY))
                ) {
                    resetGameState();
                    return;
                }

                if (
                    food.position !== undefined &&
                    food.position.x === tailX &&
                    food.position.y === tailY
                ) {
                    snake.grow(tailX, tailY);
                    score += food.value;

                    if (tryRollDoubled()) {
                        food = FoodGenerator.generateApple(ctx);
                        food.locate();
                    } else {
                        food = FoodGenerator.generateOrange(ctx);
                        food.locate();
                    }
                } else {
                    snake.move(tailX, tailY);
                    food.locate();
                }

                drawScore(ctx, score);

                increaseGameDifficultyLevel(gameLoop, score, gameSpeed);
            } else if (gameState == GameState.GAME_OVER) {
                drawGameOverState(ctx, highscore);
            }
        }, speed);
    }

    function increaseGameDifficultyLevel(gameLoop, score, gameSpeed) {
        if (score === 10 && gameSpeed > 50) {
            clearInterval(gameLoop);
            gameThread(90);
        } else if (score == 20 && gameSpeed > 50) {
            clearInterval(gameLoop);
            gameThread(80);
        } else if (score == 30 && gameSpeed > 50) {
            clearInterval(gameLoop);
            gameThread(60);
        } else if (score == 50 && gameSpeed > 10) {
            clearInterval(gameLoop);
            gameThread(50);
        } else if (score == 100 && gameSpeed > 10) {
            clearInterval(gameLoop);
            gameThread(40);
        } else if (score == 150 && gameSpeed > 10) {
            clearInterval(gameLoop);
            gameThread(30);
        } else if (score == 300 && gameSpeed > 10) {
            clearInterval(gameLoop);
            gameThread(20);
        }
    }

    function drawGameOverState(ctx, reachedScore) {
        drawGameOver(
            ctx,
            reachedScore,
            new Point(gameViewSize.width / 2, gameViewSize.height / 2)
        );
    }

    function resetGameState() {
        setHighscore(score);
        snake = new Snake(ctx, 4);
        highscore = score;
        score = 0;
        food.relocate();
        direction = MoveDirection.RIGHT;
        gameState = GameState.GAME_OVER;
    }

    function handleKeyEvents() {
        document.onkeydown = (event) => {
            switch (event.keyCode) {
                case KeyCode.LEFT_ARROW:
                    if (direction !== MoveDirection.RIGHT) {
                        direction = MoveDirection.LEFT;
                    }
                    console.log(direction);
                    break;
                case KeyCode.RIGHT_ARROW:
                    if (direction !== MoveDirection.LEFT) {
                        direction = MoveDirection.RIGHT;
                        console.log(direction);
                    }
                    break;
                case KeyCode.UP_ARROW:
                    if (direction !== MoveDirection.DOWN) {
                        direction = MoveDirection.UP;
                        console.log(direction);
                    }
                    break;
                case KeyCode.DOWN_ARROW:
                    if (direction !== MoveDirection.UP) {
                        direction = MoveDirection.DOWN;
                        console.log(direction);
                    }
                    break;
                case KeyCode.SPACEBAR:
                    startGame();
                    break;
            }
        };
    }
});

function handleTapEvents() {
    document.addEventListener("touchend", () => startGame(), false);
}

function startGame() {
    if (gameState == GameState.NEW_GAME || gameState == GameState.GAME_OVER) {
        gameState = GameState.RUNNING;
    }
}

function goDown() {
    if (direction !== MoveDirection.UP) {
        direction = MoveDirection.DOWN;
        console.log(direction);
    }
}

function goUp() {
    if (direction !== MoveDirection.DOWN) {
        direction = MoveDirection.UP;
        console.log(direction);
    }
}

function goLeft() {
    if (direction !== MoveDirection.RIGHT) {
        direction = MoveDirection.LEFT;
    }
    console.log(direction);
}

function goRight() {
    if (direction !== MoveDirection.LEFT) {
        direction = MoveDirection.RIGHT;
        console.log(direction);
    }
}

function checkCollision(snake, point) {
    let collisionDetected = false;

    snake.tail.forEach((itemPoint) => {
        if (itemPoint.x === point.x && itemPoint.y === point.y) {
            collisionDetected = true;
        }
    });

    return collisionDetected;
}

function drawText(
    ctx,
    text,
    positionProvider = (textSize = 0) => new Point(0, 0),
    fontSize = 16
) {
    ctx.save();
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";
    let a = ctx.measureText(text);
    let position = positionProvider(a.width);
    ctx.fillText(text, position.x, position.y);
    ctx.restore();
}

function drawScore(ctx, score) {
    drawText(ctx, `Your score is ${score}`, () => new Point(10, 20));
}

function drawNewGame(ctx, xPos, yPos) {
    let newGameMessage = isMobile ? "Tap to play" : "Press spacebar to play";

    drawText(
        ctx,
        newGameMessage,
        (textSize) => new Point(xPos - Math.round(textSize / 2), yPos)
    );
}

function drawGameOver(ctx, reachedScore, position) {
    let labelPosition = -25;
    let savedHighscore = getHighscore();
    let isHighscoreBeaten = reachedScore > savedHighscore;
    let highscoreMessage = isHighscoreBeaten
        ? `Reached new highscore: ${reachedScore}!!`
        : `Your highscore is ${savedHighscore != null ? savedHighscore : 0}`;
    let scoreMessage = isHighscoreBeaten
        ? null
        : `Reached score: ${reachedScore}`;

    drawText(
        ctx,
        highscoreMessage,
        (textSize) =>
            new Point(
                position.x - Math.round(textSize / 2),
                position.y + labelPosition
            )
    );

    if (scoreMessage != null) {
        labelPosition += 25;
        drawText(
            ctx,
            scoreMessage,
            (textSize) =>
                new Point(
                    position.x - Math.round(textSize / 2),
                    position.y + labelPosition
                )
        );
    }

    labelPosition += 50;
    let gameOverMessage = isMobile
        ? "Tap to play again"
        : "Press spacebar to play again";

    drawText(
        ctx,
        gameOverMessage,
        (textSize) =>
            new Point(
                position.x - Math.round(textSize / 2),
                position.y + labelPosition
            )
    );
}

function setHighscore(score) {
    let savedHighscore = getHighscore();
    if (
        savedHighscore == null ||
        savedHighscore == "" ||
        savedHighscore < score
    ) {
        setCookie("highscore", score);
    }
}

function getHighscore() {
    return getCookie("highscore");
}

function setCookie(key, value) {
    let expires = new Date();
    expires.setDate(expires.getTime() + 100 * 60 * 60 * 24 * 100);
    document.cookie = `${key}=${value};expires=${expires.toGMTString()}`;
}

function getCookie(key) {
    let cookies = document.cookie.split(";");
    for (const index in cookies) {
        let cookie = cookies[index];
        if (cookie.includes(key)) {
            return cookie.split("=")[1];
        }
    }
    return null;
}

function tryRollDoubled() {
    let firstDiceRoll = diceRoll()
    let secondDiceRoll = diceRoll()
    return firstDiceRoll === secondDiceRoll
}

function diceRoll() {
    return Math.floor(Math.random() * (6 - 1 + 1) + 1);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Food {
    constructor(context, color = "red", size = 10) {
        this.ctx = context;
        this.size = size;
        this.color = color;
        this.value = 1;
    }

    draw(position) {
        this.position = position;

        let ctx = this.ctx;
        let size = this.size;

        ctx.fillStyle = this.color;
        ctx.fillRect(position.x * size, position.y * size, size, size);
        // This is the border of the square
        ctx.strokeStyle = "darkgreen";
        ctx.strokeRect(position.x * size, position.y * size, size, size);
    }

    relocate() {
        let availableSpace = (gameViewSize.height - this.size) / this.size;

        let x = Math.round(Math.random() * availableSpace);
        let y = Math.round(Math.random() * availableSpace);

        this.position = new Point(x, y);

        this.draw(this.position);
    }

    locate() {
        let position = this.position;
        if (position !== undefined) {
            this.draw(position);
        } else {
            this.relocate();
        }
    }

    setValue(value = 1) {
        this.value = value;
    }
}

class Snake {
    constructor(ctx, size = 0) {
        this.ctx = ctx;
        this._length = size;
        this._tail = [];

        // Using a for loop we push the elements inside the array(squares).
        // Every element will have y = 0 and the x will take the value of the index.
        for (let i = this._length; i >= 0; i--) {
            this._tail.push(new Point(i, 0));
        }
    }

    set length(value) {
        this._length = value;

        this._tail = [];

        for (let i = this._length; i >= 0; i--) {
            this._tail.push(new Point(i, 0));
        }
    }

    get length() {
        return this._length;
    }

    get tail() {
        return this._tail;
    }

    turn(point, direction) {
        this._turnPoint = point;
        this._direction = direction;
    }

    grow(x, y) {
        let tailPeak = new Point(x, y);

        this._tail.unshift(tailPeak);

        let tail = this._tail;
        this._length = tail.length;

        for (let i = 0; i < tail.length; i++) {
            this.draw(tail[i].x, tail[i].y);
        }
    }

    draw(x, y) {
        let ctx = this.ctx;

        ctx.fillStyle = "green";
        ctx.fillRect(x * snakeSize, y * snakeSize, snakeSize, snakeSize);
        // This is the border of the square
        ctx.strokeStyle = "darkgreen";
        ctx.strokeRect(x * snakeSize, y * snakeSize, snakeSize, snakeSize);
    }

    move(x, y) {
        let length = this._length;

        let tailPeak = this._tail.pop(); //pops out the last cell
        tailPeak.x = x;
        tailPeak.y = y;

        this._tail.unshift(tailPeak);

        let tail = this._tail;

        for (let i = 0; i < length; i++) {
            this.draw(tail[i].x, tail[i].y);
        }
    }
}

class FoodGenerator {
    
    static generateOrange(ctx) {
        return new Food(ctx, "orange");
    }

    static generateApple(ctx) {
        let apple = new Food(ctx, "red");
        apple.setValue(2);
        return apple;
    }
}
