const ROWS = 6;
const COLS = 7;
const PLAYER_HUMAN = 1; // Red
const PLAYER_AI = 2;    // Yellow
let currentPlayer = PLAYER_HUMAN;
let board;
let gameOver = false;

// DOM elements
const gameBoardEl = document.getElementById('game-board');
const statusEl = document.getElementById('status');
const currentPlayerEl = document.getElementById('current-player');
const resetButton = document.getElementById('reset-button');
const difficultyEl = document.getElementById('difficulty'); // NEW

// --- Initialization and Reset ---

function initBoard() {
    // Create a 2D array of zeros
    board = Array(ROWS).fill(0).map(() => Array(COLS).fill(0));
    gameBoardEl.innerHTML = '';
    gameOver = false;
    currentPlayer = PLAYER_HUMAN;
    updateStatus('Red');

    // Create the visual grid elements
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.col = c;
            cell.addEventListener('click', handleMove);
            gameBoardEl.appendChild(cell);
        }
    }
}

// Attach event listeners
resetButton.addEventListener('click', initBoard);
// NEW: Reset game when difficulty changes
difficultyEl.addEventListener('change', initBoard); 

// --- Game Flow and Move Handling ---

function handleMove(event) {
    // Disable moves if game is over or it's the AI's turn
    if (gameOver || currentPlayer !== PLAYER_HUMAN) return; 

    const col = parseInt(event.currentTarget.dataset.col);
    const row = getNextAvailableRow(col);

    if (row !== -1) {
        dropPiece(row, col, PLAYER_HUMAN);
        checkGameStatus(row, col);

        if (!gameOver) {
            switchPlayer();
            // AI makes a move after a short delay
            setTimeout(aiMove, 500);
        }
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === PLAYER_HUMAN ? PLAYER_AI : PLAYER_HUMAN;
    const playerColor = currentPlayer === PLAYER_HUMAN ? 'Red' : 'Yellow';
    updateStatus(playerColor);
}

function updateStatus(playerColor) {
    currentPlayerEl.textContent = playerColor;
    currentPlayerEl.className = playerColor.toLowerCase();

    if (gameOver) {
        currentPlayerEl.textContent = '';
        if (playerColor === 'Tie') {
            statusEl.textContent = "It's a Tie!";
        } else {
            statusEl.textContent = `Winner: ${playerColor}!`;
        }
    } else {
        statusEl.textContent = `Player: `;
    }
}

function getNextAvailableRow(col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][col] === 0) {
            return r;
        }
    }
    return -1; // Column is full
}

function dropPiece(row, col, player) {
    board[row][col] = player;
    
    // Calculate the index in the flat grid
    const cellIndex = row * COLS + col;
    const cell = gameBoardEl.children[cellIndex];
    
    const piece = document.createElement('div');
    piece.classList.add('piece', player === PLAYER_HUMAN ? 'red' : 'yellow');
    cell.appendChild(piece);

    requestAnimationFrame(() => {
        piece.classList.add('dropped');
    });
}

// --- Win Checking Logic (Unchanged) ---

function checkWin(r, c, player) {
    return checkDirection(r, c, player, 0, 1) || 
           checkDirection(r, c, player, 1, 0) || 
           checkDirection(r, c, player, 1, 1) || 
           checkDirection(r, c, player, 1, -1);
}

function checkDirection(r, c, player, dr, dc) {
    let count = 0;
    
    for (let i = -3; i <= 3; i++) {
        const nr = r + i * dr;
        const nc = c + i * dc;

        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === player) {
            count++;
            if (count === 4) return true;
        } else {
            count = 0;
        }
    }
    return false;
}

function isBoardFull() {
    return board[0].every(cell => cell !== 0);
}

function checkGameStatus(r, c) {
    if (checkWin(r, c, currentPlayer)) {
        gameOver = true;
        const winnerColor = currentPlayer === PLAYER_HUMAN ? 'Red' : 'Yellow';
        updateStatus(winnerColor);
    } else if (isBoardFull()) {
        gameOver = true;
        updateStatus('Tie');
    }
}

// --- AI Opponent (Minimax with Difficulty) ---

function aiMove() {
    if (gameOver) return;

    // Get the selected search depth from the difficulty selector (NEW)
    const searchDepth = parseInt(difficultyEl.value);

    let bestScore = -Infinity;
    let bestCol = -1;

    // Iterate through all possible columns to find the best move
    for (let c = 0; c < COLS; c++) {
        const r = getNextAvailableRow(c);
        if (r !== -1) {
            // 1. Make the move (Simulate)
            board[r][c] = PLAYER_AI;

            // 2. Evaluate the move using Minimax with the selected depth
            let score = minimax(board, searchDepth, -Infinity, Infinity, false); 

            // 3. Undo the move (Backtrack)
            board[r][c] = 0; 

            // 4. Update best score
            if (score > bestScore) {
                bestScore = score;
                bestCol = c;
            }
        }
    }

    if (bestCol !== -1) {
        const r = getNextAvailableRow(bestCol);
        dropPiece(r, bestCol, PLAYER_AI);
        checkGameStatus(r, bestCol);
        if (!gameOver) {
            switchPlayer();
        }
    } else if (!gameOver) {
        // Fallback for an unlikely scenario (e.g., tie detected, but not flagged)
        checkGameStatus(-1, -1);
    }
}

// --- Minimax Helper Functions (Unchanged, but included for completeness) ---

function evaluateBoard(currentBoard) {
    if (checkForWinningPlayer(currentBoard, PLAYER_AI)) return 100000; 
    if (checkForWinningPlayer(currentBoard, PLAYER_HUMAN)) return -100000;
    if (isBoardFull()) return 0; 
    return 0; // Simplified scoring for deeper search
}

function checkForWinningPlayer(tempBoard, player) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (tempBoard[r][c] === player) {
                if (checkDirectionTemp(tempBoard, r, c, player, 0, 1) || 
                    checkDirectionTemp(tempBoard, r, c, player, 1, 0) || 
                    checkDirectionTemp(tempBoard, r, c, player, 1, 1) || 
                    checkDirectionTemp(tempBoard, r, c, player, 1, -1)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function checkDirectionTemp(tempBoard, r, c, player, dr, dc) {
    let count = 0;
    for (let i = -3; i <= 3; i++) {
        const nr = r + i * dr;
        const nc = c + i * dc;

        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && tempBoard[nr][nc] === player) {
            count++;
            if (count === 4) return true;
        } else {
            count = 0;
        }
    }
    return false;
}

function minimax(tempBoard, depth, alpha, beta, isMaximizingPlayer) {
    let score = evaluateBoard(tempBoard);
    if (depth === 0 || Math.abs(score) === 100000 || isBoardFull()) {
        return score;
    }

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let c = 0; c < COLS; c++) {
            const r = getNextAvailableRowForTempBoard(tempBoard, c);
            if (r !== -1) {
                tempBoard[r][c] = PLAYER_AI;
                let evaluation = minimax(tempBoard, depth - 1, alpha, beta, false);
                tempBoard[r][c] = 0;
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let c = 0; c < COLS; c++) {
            const r = getNextAvailableRowForTempBoard(tempBoard, c);
            if (r !== -1) {
                tempBoard[r][c] = PLAYER_HUMAN;
                let evaluation = minimax(tempBoard, depth - 1, alpha, beta, true);
                tempBoard[r][c] = 0;
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break;
            }
        }
        return minEval;
    }
}

function getNextAvailableRowForTempBoard(tempBoard, col) {
    for (let r = ROWS - 1; r >= 0; r--) {
        if (tempBoard[r][col] === 0) {
            return r;
        }
    }
    return -1;
}

// --- Start the Game ---
initBoard();