const board = document.getElementById('board');
const message = document.getElementById('message');
const resetButton = document.getElementById('reset');
const difficultySelect = document.getElementById('difficulty');
const redScoreEl = document.getElementById('redScore');
const yellowScoreEl = document.getElementById('yellowScore');

let currentPlayer = 'red';
const columns = [[], [], [], [], [], [], []];
let redScore = 0;
let yellowScore = 0;

function createBoard() {
  board.innerHTML = '';
  for (let i = 0; i < 42; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.addEventListener('click', () => handleCellClick(i % 7));
    board.appendChild(cell);
  }
  message.textContent = '';
  currentPlayer = 'red';
  columns.forEach(col => col.length = 0);
  board.style.pointerEvents = 'auto';
}

function handleCellClick(col) {
  if (columns[col].length < 6) {
    const row = 5 - columns[col].length;
    const index = row * 7 + col;
    const cell = board.children[index];
    cell.classList.add(currentPlayer);
    columns[col].push(currentPlayer);

    if (checkWin(col, row)) {
      endGame(`${capitalize(currentPlayer)} wins!`);
      updateScore(currentPlayer);
      return;
    }

    currentPlayer = currentPlayer === 'red' ? 'yellow' : 'red';

    if (currentPlayer === 'yellow') {
      setTimeout(computerMove, 500);
    }
  }
}

function computerMove() {
  let col;
  const difficulty = difficultySelect.value;

  if (difficulty === 'easy') {
    // random move
    const available = columns.map((c, i) => c.length < 6 ? i : null).filter(i => i !== null);
    col = available[Math.floor(Math.random() * available.length)];
  } else if (difficulty === 'medium') {
    // random but avoids full columns
    col = getSafeMove();
  } else {
    // hard: try to win or block
    col = getSmartMove();
  }

  handleCellClick(col);
}

function getSafeMove() {
  const available = columns.map((c, i) => c.length < 6 ? i : null).filter(i => i !== null);
  return available[Math.floor(Math.random() * available.length)];
}

function getSmartMove() {
  // simple strategy: try winning move, else block red
  for (let c = 0; c < 7; c++) {
    if (columns[c].length < 6) {
      const r = 5 - columns[c].length;
      columns[c].push('yellow');
      if (checkWin(c, r)) {
        columns[c].pop();
        return c;
      }
      columns[c].pop();
    }
  }
  for (let c = 0; c < 7; c++) {
    if (columns[c].length < 6) {
      const r = 5 - columns[c].length;
      columns[c].push('red');
      if (checkWin(c, r)) {
        columns[c].pop();
        return c;
      }
      columns[c].pop();
    }
  }
  return getSafeMove();
}

function checkWin(col, row) {
  return checkDirection(col, row, 1, 0) || // Horizontal
         checkDirection(col, row, 0, 1) || // Vertical
         checkDirection(col, row, 1, 1) || // Diagonal /
         checkDirection(col, row, 1, -1);  // Diagonal \
}

function checkDirection(col, row, colInc, rowInc) {
  let count = 1;
  count += countDirection(col, row, colInc, rowInc);
  count += countDirection(col, row, -colInc, -rowInc);
  return count >= 4;
}

function countDirection(col, row, colInc, rowInc) {
  let count = 0;
  let newCol = col + colInc;
  let newRow = row + rowInc;
  while (
    newCol >= 0 && newCol < 7 &&
    newRow >= 0 && newRow < 6 &&
    columns[newCol][5 - newRow] === currentPlayer
  ) {
    count++;
    newCol += colInc;
    newRow += rowInc;
  }
  return count;
}

function endGame(msg) {
  message.textContent = msg;
  board.style.pointerEvents = 'none';
}

function updateScore(player) {
  if (player === 'red') {
    redScore++;
    redScoreEl.textContent = `Red: ${redScore}`;
  } else {
    yellowScore++;
    yellowScoreEl.textContent = `Yellow: ${yellowScore}`;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

resetButton.addEventListener('click', createBoard);
createBoard();