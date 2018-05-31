const MoveDirection = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right"
};

let snakeSize = 10;

window.addEventListener("DOMContentLoaded", () => {
    let direction = MoveDirection.RIGHT;
    let canvas = document.getElementById("myCanvas");
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    let ctx = canvas.getContext("2d");
    let score = 0;
    let snake = new Snake(ctx, 4);
    let food = new Food(ctx);

    let gameLoop = setInterval(() => {
        ctx.fillStyle = 'lightgrey';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

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

        if (tailX === -1
            || tailX === canvasWidth / snakeSize
            || tailY === -1
            || tailY === canvasHeight / snakeSize) {
            clearInterval(gameLoop);
            return;
        }

        if (food.position !== undefined && food.position.x === tailX && food.position.y === tailY) {
            snake.grow(tailX, tailY);
            food.relocate();
            score++;
        } else {
            snake.move(tailX, tailY);
            food.locate();
        }

        drawText(ctx, score);
    }, 50);

    document.onkeydown = (event) => {
        switch (event.keyCode) {

            case 37:
                if (direction !== MoveDirection.RIGHT) {
                    direction = MoveDirection.LEFT;
                }
                console.log(direction);
                break;

            case 39:
                if (direction !== MoveDirection.LEFT) {
                    direction = MoveDirection.RIGHT;
                    console.log(direction);
                }
                break;

            case 38:
                if (direction !== MoveDirection.DOWN) {
                    direction = MoveDirection.UP;
                    console.log(direction);
                }
                break;

            case 40:
                if (direction !== MoveDirection.UP) {
                    direction = MoveDirection.DOWN;
                    console.log(direction);
                }
                break;
        }
    };
});

function drawText(ctx, value) {
    ctx.font = "16px Arial";
    ctx.fillText(`Your score is ${value}`, 10, 2§0);
}

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

class Food {
    constructor(context, size = 10) {
        this.ctx = context;
        this.size = size;
    }

    draw(position) {
        this.position = position;

        let ctx = this.ctx;
        let size = this.size;

        ctx.fillStyle = 'orange';
        ctx.fillRect(position.x * size, position.y * size, size, size);
        // This is the border of the square
        ctx.strokeStyle = 'darkgreen';
        ctx.strokeRect(position.x * size, position.y * size, size, size);
    }

    relocate() {
        let availableSpace = (500 - this.size) / this.size;

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

        ctx.fillStyle = 'green';
        ctx.fillRect(x * snakeSize, y * snakeSize, snakeSize, snakeSize);
        // This is the border of the square
        ctx.strokeStyle = 'darkgreen';
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

