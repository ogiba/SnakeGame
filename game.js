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
let moveCounter = 0;

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
    let gameSpeed = 20;
    isMobile = window.innerWidth <= 800;

    registerKeyEventsListener();
    registerTapEventListener();
    gameThread(gameSpeed);

    function gameThread(speed) {
        let gameLoop = setInterval(() => {
            drawBackground(ctx);

            if (gameState == GameState.NEW_GAME) {
                drawNewGame(
                    ctx,
                    gameViewSize.width / 2,
                    gameViewSize.height / 2
                );
            } else if (gameState == GameState.RUNNING) {
                let tailX = snake.tail.first().x;
                let tailY = snake.tail.first().y;
                let a = 0;
                let b = 0;

                switch (direction) {
                    case MoveDirection.RIGHT:
                        a = 1;
                        break;
                    case MoveDirection.DOWN:
                        b = 1;
                        break;
                    case MoveDirection.UP:
                        b = -1;
                        break;
                    case MoveDirection.LEFT:
                        a = -1;
                        break;
                }

                if (
                    tailX <= -1 ||
                    tailX >= gameViewSize.width - snakeSize ||
                    tailY <= -1 ||
                    tailY >= gameViewSize.height - snakeSize
                    // ||
                    // snake.checkCollision(new Point(tailX, tailY))
                ) {
                    resetGameState();
                    return;
                }

                if (food.collide(new Point(tailX, tailY))) {
                    snake.grow(tailX, tailY);
                    score += food.value;

                    food = FoodGenerator.generateFood(ctx);
                    food.locate();

                    increaseGameDifficultyLevel(gameLoop, score, gameSpeed);
                } else {
                    snake.move(a, b);
                    food.locate();
                }

                drawScore(ctx, score);
            } else if (gameState == GameState.GAME_OVER) {
                drawGameOverState(ctx, highscore);
            }
        }, speed);
    }

    function increaseGameDifficultyLevel(gameLoop, score, gameSpeed) {
        if (score >= 10 && score < 20 && gameSpeed > 90) {
            clearInterval(gameLoop);
            gameThread(90);
        } else if (score >= 20 && score < 30 && gameSpeed > 80) {
            clearInterval(gameLoop);
            gameThread(80);
        } else if (score >= 30 && score < 50 && gameSpeed > 60) {
            clearInterval(gameLoop);
            gameThread(60);
        } else if (score >= 50 && score < 100 && gameSpeed > 50) {
            clearInterval(gameLoop);
            gameThread(50);
        } else if (score >= 100 && score < 150 && gameSpeed > 40) {
            clearInterval(gameLoop);
            gameThread(40);
        } else if (score >= 150 && score < 300 && gameSpeed > 30) {
            clearInterval(gameLoop);
            gameThread(30);
        } else if (score >= 300 && gameSpeed > 20) {
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

    function registerKeyEventsListener() {
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

function registerTapEventListener() {
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

function drawBackground(context) {
    context.save();
    context.fillStyle = "lightgrey";
    context.fillRect(0, 0, gameViewSize.width, gameViewSize.height);
    context.strokeStyle = "black";
    context.strokeRect(0, 0, gameViewSize.width, gameViewSize.height);
    context.restore();
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
        CookieManager.setCookie(new Cookie("highscore", score));
    }
}

function getHighscore() {
    return CookieManager.getCookie("highscore");
}

function tryRollDoubled() {
    let firstDiceRoll = Dice.roll();
    let secondDiceRoll = Dice.roll();
    return firstDiceRoll === secondDiceRoll;
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

        ctx.save();
        ctx.translate(position.x, position.y);
        ctx.fillStyle = this.color;
        ctx.fillRect(size, size, size, size);
        // This is the border of the square
        ctx.strokeStyle = "darkgreen";
        ctx.strokeRect(size, size, size, size);
        ctx.restore();
    }

    relocate() {
        let availableSpace = (gameViewSize.height - this.size) / this.size;

        // let x = Math.round(Math.random() * availableSpace);
        // let y = Math.round(Math.random() * availableSpace);
        let x = this.rand_10(0, gameViewSize.height - this.size);
        let y = this.rand_10(0, gameViewSize.height - this.size);

        this.position = new Point(x, y);

        this.draw(this.position);
    }

    rand_10(min, max) {
        return Math.round((Math.random() * (max - min) + min) / 10) * 10;
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

    collide(point) {
        return Optional.of(this.position).getOrDefault(
            (position) => position.x === point.x && position.y === point.y,
            false
        );
    }
}

class Snake {
    constructor(ctx, size = 0) {
        this.ctx = ctx;
        this._length = size;
        this._tail = [];
        this.speed = 1;

        // Using a for loop we push the elements inside the array(squares).
        // Every element will have y = 0 and the x will take the value of the index.
        for (let i = this._length * snakeSize; i >= 0; i -= snakeSize) {
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

        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = "green";
        ctx.fillRect(snakeSize, snakeSize, snakeSize, snakeSize);
        // This is the border of the square
        ctx.strokeStyle = "darkgreen";
        ctx.strokeRect(snakeSize, snakeSize, snakeSize, snakeSize);
        ctx.restore();
    }

    move(x, y) {
        let length = this._length;
        let firstElem = this._tail[0];
        let secElem = this._tail[1];

        // if (firstElem.y % 10 != 0) {
        //     firstElem.y += y;
        //     // this._tail.splice(0, 0, firstElem);
        // } else {
        //     let tailPeak = this._tail.pop(); //pops out the last cell
        //     tailPeak.x = this._tail[0].x;
        //     tailPeak.y = this._tail[0].y + y;
        //     this._tail.unshift(tailPeak);
        // }
        // let tailPeak = this._tail.pop();

        // for (let i = 0; i < this._tail.length; i++) {
        //     let elem = this._tail[i];
        //     if (x != 0) {
        //         elem.x = tailPeak.x - snakeSize * (i + 1);
        //     } else {
        //         elem.x = tailPeak.x
        //     }
        //     // elem.y = tailPeak.y - snakeSize * (i + 1);
        // }

        // this._tail.unshift(tailPeak);
        moveCounter += 1;

        if (moveCounter >= 10) {
            let tailPeak = this._tail.pop(); //pops out the last cell
            tailPeak.x = this._tail[0].x + x * 10;
            tailPeak.y = this._tail[0].y + y * 10;
            this._tail.unshift(tailPeak);
            moveCounter = 0;
        }

        let tail = this._tail;

        for (let i = 0; i < length; i++) {
            // tail[i].x += x;
            // tail[i].y += y;
            this.draw(tail[i].x, tail[i].y);
        }
    }

    checkCollision(point) {
        let collisionDetected = false;

        this._tail.forEach((itemPoint) => {
            if (itemPoint.x === point.x && itemPoint.y === point.y) {
                collisionDetected = true;
            }
        });

        return collisionDetected;
    }
}

class Dice {
    static roll() {
        return Math.floor(Math.random() * (6 - 1 + 1) + 1);
    }
}

class Cookie {
    constructor(key, value) {
        this._key = key;
        this._value = value;
    }
}

Cookie.prototype.toString = function () {
    return `${this._key}=${this._value}`;
};

class CookieManager {
    static setCookie(cookie) {
        let expires = new Date();
        expires.setDate(expires.getTime() + 100 * 60 * 60 * 24 * 100);
        document.cookie = `${cookie.toString()};expires=${expires.toGMTString()}`;
    }

    static getCookie(key) {
        let cookies = document.cookie.split(";").map((cookie) => {
            let parts = cookie.split("=");
            return new Cookie(parts[0], parts[1]);
        });

        return Optional.of(
            cookies.find((cookie) => cookie._key == key)
        ).getOrNull((cookie) => cookie._value);
    }
}

class FoodGenerator {
    static generateFood(ctx) {
        let firstDiceRoll = Dice.roll();
        let secondDiceRoll = Dice.roll();
        return firstDiceRoll == secondDiceRoll
            ? this.generateApple(ctx)
            : this.generateOrange(ctx);
    }

    static generateOrange(ctx) {
        return new Food(ctx, "orange");
    }

    static generateApple(ctx) {
        let apple = new Food(ctx, "red");
        apple.setValue(2);
        return apple;
    }
}

class Optional {
    constructor(value) {
        this._value = value;
    }

    getOrNull(presentCallback = (value) => null) {
        return this.getOrDefault(presentCallback, null);
    }

    getOrDefault(presentCallback, defaultValue) {
        if (this.checkIfValueExists()) {
            return presentCallback(this._value);
        } else {
            return defaultValue;
        }
    }

    checkIfValueExists() {
        return this._value != null && this._value != undefined;
    }

    static of(value) {
        return new Optional(value);
    }
}

Array.prototype.first = function () {
    return this[0];
};
