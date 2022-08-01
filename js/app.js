var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GLUE_IMG = '<img src="img/candy.png" />';
var GAMER_IMG = '<img src="img/gamer.png" />';
var BALL_IMG = '<img src="img/ball.png" />';

var gBoard;
var gGamerPos;
var gBallInterval;
var gGlueInterval;
var gBallsCollected = 0;
var gIsGlue = false
var gBallsCreated = 2

function initGame() {
    var elBtn = document.querySelector('button')
    var elH2 = document.querySelector('.balls-collected')

    gGamerPos = { i: 2, j: 9 };
    gBallsCollected = 0
    gBallsCreated = 2
    gBoard = buildBoard();
    renderBoard(gBoard);
    getEmptyCells(gBoard)
    elH2.innerText = '0'
    elBtn.style.display = 'none'

}

function buildBoard() {
    // Create the Matrix
    var board = createMat(10, 12)


    // Put FLOOR everywhere and WALL at edges
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            // Put FLOOR in a regular cell
            var cell = { type: FLOOR, gameElement: null };

            // Place Walls at edges
            if (i === 0 || i === board.length - 1 || j === 0 || j === board[0].length - 1) {
                cell.type = WALL;
            }

            //Added passages
            board[4][0].type = 'FLOOR'
            board[4][11].type = 'FLOOR'
            board[0][7].type = 'FLOOR'
            board[9][7].type = 'FLOOR'

            // Add created cell to The game board
            board[i][j] = cell;
        }
    }

    // Place the gamer at selected position
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

    // Place the Balls (currently randomly chosen positions)
    board[3][8].gameElement = BALL;
    board[7][4].gameElement = BALL;

    gBallInterval = setInterval(createNewBall, 3000)
    gGlueInterval = setInterval(createGlue, 5000)
    return board;
}

// Render the board to an HTML table
function renderBoard(board) {

    var strHTML = '';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n';
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j];

            var cellClass = getClassName({ i: i, j: j })

            // TODO - change to short if statement
            if (currCell.type === FLOOR) cellClass += ' floor';
            else if (currCell.type === WALL) cellClass += ' wall';

            strHTML += `\t<td class="cell ${cellClass}"  onclick="moveTo(${i}, ${j})" >\n`;

            // TODO - change to switch case statement
            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG;
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG;
            }

            strHTML += '\t</td>\n';
        }
        strHTML += '</tr>\n';
    }

    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

//Creates new place to
function createNewBall() {
    var i = getRandomInt(1, 9);
    var j = getRandomInt(1, 11)
    if (gBoard[i][j].type === 'FLOOR' && gBoard[i][j].gameElement === null) {
        gBoard[i][j].gameElement = 'BALL'
        renderCell({ i, j }, BALL_IMG)
        gBallsCreated++
        console.log(gBallsCreated);
    }
}

// Move the player to a specific location
function moveTo(i, j) {

    if (gIsGlue) return

    if (j === 12) j = 0
    if (i === 10) i = 0
    if (j === -1) j = 11
    if (i === -1) i = 9


    var targetCell = gBoard[i][j];
    if (targetCell.type === WALL) return;


    // Calculate distance to make sure we are moving to a neighbor cell
    var iAbsDiff = Math.abs(i - gGamerPos.i);
    var jAbsDiff = Math.abs(j - gGamerPos.j);
    // If the clicked Cell is one of the four allowed
    if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0) || (iAbsDiff === gBoard.length - 1) || (jAbsDiff === gBoard[0].length - 1)) {
        if (targetCell.gameElement === BALL) {
            var elH2 = document.querySelector('.balls-collected')
            console.log('Collecting!');
            gBallsCollected++

            elH2.innerText = `${gBallsCollected}`
        }
        if (targetCell.gameElement === GLUE) {
            gIsGlue = true
            setTimeout(() => { gIsGlue = false }, 3000)

        }
        // MOVING from current position
        // Model:
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;

        // Dom:
        renderCell(gGamerPos, '');

        // MOVING to selected position
        // Model:
        gGamerPos.i = i;
        gGamerPos.j = j;
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
        // DOM:
        renderCell(gGamerPos, GAMER_IMG);

    } // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
    checkVictory(gBoard)
}


// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    var cellSelector = '.' + getClassName(location)
    var elCell = document.querySelector(cellSelector);
    elCell.innerHTML = value;
}


function createGlue() {
    var i = getRandomInt(1, 9);
    var j = getRandomInt(1, 11)
    if (gBoard[i][j].type === 'FLOOR' && gBoard[i][j].gameElement === null) {
        gBoard[i][j].gameElement = GLUE
        renderCell({ i, j }, GLUE_IMG)
        setTimeout(() => {
            if (gBoard[i][j].gameElement === GLUE) {
                gBoard[i][j].gameElement = null; renderCell({ i, j }, '')
            }
        }, 3000)
    }

}

// Move the player by keyboard arrows
function handleKey(event) {

    var i = gGamerPos.i;
    var j = gGamerPos.j;


    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1);
            break;
        case 'ArrowRight':
            moveTo(i, j + 1);
            break;
        case 'ArrowUp':
            moveTo(i - 1, j);
            break;
        case 'ArrowDown':
            moveTo(i + 1, j);
            break;

    }

}


function getEmptyCells() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[i].length; j++) {
            if (gBoard[i][j].gameElement === null) {
                emptyCells.push(gBoard[i][j])
            }
        }
    }
    return emptyCells
}


// Returns the class name for a specific cell
function getClassName(location) {
    var cellClass = `cell-${location.i}-${location.j}`;
    return cellClass;
}

function checkVictory() {
    // var emptySpots = getEmptyCells()
    if (gBallsCreated === gBallsCollected) {
        clearInterval(gBallInterval)
        clearInterval(gGlueInterval)
        var elBtn = document.querySelector('button')
        var elBoard = document.querySelector('.board')
        elBtn.style.display = 'block'
        elBoard.innerText = `You Won! Good Job!`

    }
}

