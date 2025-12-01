// Config
const ROWS = 6;
const COLS = 7;
const P1 = 1;      // Red
const P2 = 2;      // Yellow / Player 2 or CPU

// State
let grid = createGrid();
let current = P1;
let locked = false; // prevent input during animations/CPU thinking
let mode = 'pvp';   // 'pvp' or 'cpu'
let difficulty = 'medium';
let scores = { p1: 0, p2: 0, cpu: 0 };

// DOM
const boardEl = document.getElementById('board');
const hoverRowEl = document.getElementById('hoverRow');
const turnTextEl = document.getElementById('turnText');
const messageEl = document.getElementById('message');
const scoreP1El = document.getElementById('scoreP1');
const scoreP2El = document.getElementById('scoreP2');
const scoreCPUEl = document.getElementById('scoreCPU');
const scoreP2WrapEl = document.getElementById('scoreP2Wrap');
const scoreCPUWrapEl = document.getElementById('scoreCPUWrap');
const newGameBtn = document.getElementById('newGameBtn');
const resetBtn = document.getElementById('resetBtn');
const modeSel = document.getElementById('mode');
const diffSel = document.getElementById('difficulty');
const diffWrap = document.getElementById('difficultyWrap');

init();

function init() {
  renderHoverRow();
  renderBoard();
  attachEvents();
  updateUI();
}

function createGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function attachEvents() {
  newGameBtn.addEventListener('click', () => {
    grid = createGrid();
    current = P1;
    locked = false;
    messageEl.textContent = '';
    renderBoard();
    updateUI();
  });

  resetBtn.addEventListener('click', () => {
    scores = { p1: 0, p2: 0, cpu: 0 };
    updateScores();
  });

  modeSel.addEventListener('change', () => {
    mode = modeSel.value;
    grid = createGrid();
    current = P1;
    messageEl.textContent = '';
    diffWrap.classList.toggle('hidden', mode !== 'cpu');
    scoreP2WrapEl.classList.toggle('hidden', mode === 'cpu');
    scoreCPUWrapEl.classList.toggle('hidden', mode !== 'cpu');
    renderBoard();
    updateUI();
  });

  diffSel.addEventListener('change', () => {
    difficulty = diffSel.value;
    messageEl.textContent = `Difficulty set to ${capitalize(difficulty)}.`;
    setTimeout(() => (messageEl.textContent = ''), 1200);
  });
}

function renderHoverRow() {
  hoverRowEl.innerHTML = '';
  for (let c = 0; c < COLS; c++) {
    const slot = document.createElement('div');
    slot.className = 'hover-slot';
    const disc = document.createElement('div');
    disc.className = `hover-disc ${current === P1 ? 'red' : 'yellow'}`;
    slot.appendChild(disc);
    slot.dataset.col = c;
    slot.addEventListener('mouseenter', () => {
      slot.classList.add('active');
    });
    slot.addEventListener('mouseleave', () => {
      slot.classList.remove('active');
    });
    slot.addEventListener('click', () => tryMove(c));
    hoverRowEl.appendChild(slot);
  }
}

function renderBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;

      const hole = document.createElement('div');
      hole.className = 'hole';
      cell.appendChild(hole);

      // disc rendering
      const val = grid[r][c];
      if (val !== 0) {
        const disc = document.createElement('div');
        disc.className = `disc ${val === P1 ? 'red' : 'yellow'}`;
        disc.style.bottom = '6px';
        cell.appendChild(disc);
      }

      cell.addEventListener('click', () => tryMove(c));
      boardEl.appendChild(cell);
    }
  }
  // update hover discs color
  [...hoverRowEl.children].forEach(slot => {
    const disc = slot.querySelector('.hover-disc');
    disc.className = `hover-disc ${current === P1 ? 'red' : 'yellow'}`;
  });
}

function tryMove(col) {
  if (locked) return;
  const row = getDropRow(grid, col);
  if (row === -1) return; // column full

  locked = true;
  animateDrop(row, col, current, () => {
    grid[row][col] = current;

    const winCells = checkWin(grid, current);
    if (winCells) {
      highlightWin(winCells);
      const winnerName = getPlayerName(current);
      messageEl.textContent = `${winnerName} wins!`;
      addScore(current);
      locked = true;
      return;
    }
    if (isBoardFull(grid)) {
      messageEl.textContent = 'Draw!';
      locked = true;
      return;
    }

    // switch turn
    current = current === P1 ? P2 : P1;
    updateUI();
    locked = false;

    // CPU move if applicable
    if (mode === 'cpu' && current === P2) {
      cpuTurn();
    }
  });
}

function animateDrop(row, col, player, onDone) {
  // find target cell element
  const idx = row * COLS + col;
  const cell = boardEl.children[idx];
  const disc = document.createElement('div');
  disc.className = `disc ${player === P1 ? 'red' : 'yellow'}`;
  disc.style.animation = 'drop 280ms ease-out';
  disc.style.bottom = '6px';
  cell.appendChild(disc);
  setTimeout(() => {
    onDone();
    renderBoard(); // ensure static render after animation
  }, 280);
}

function getDropRow(state, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (state[r][col] === 0) return r;
  }
  return -1;
}

function isBoardFull(state) {
  return state[0].every(v => v !== 0);
}

function updateUI() {
  const name = getPlayerName(current);
  turnTextEl.textContent = `Turn: ${name} (${current === P1 ? 'Red' : mode === 'cpu' ? 'CPU' : 'Yellow'})`;
  updateScores();
  renderHoverRow();
}

function updateScores() {
  scoreP1El.textContent = String(scores.p1);
  scoreP2El.textContent = String(scores.p2);
  scoreCPUEl.textContent = String(scores.cpu);
}

function addScore(winner) {
  if (winner === P1) scores.p1++;
  else if (mode === 'cpu') scores.cpu++;
  else scores.p2++;
  updateScores();
}

function getPlayerName(player) {
  if (player === P1) return 'Player 1';
  if (mode === 'cpu') return 'CPU';
  return 'Player 2';
}

function highlightWin(cells) {
  cells.forEach(([r, c]) => {
    const idx = r * COLS + c;
    const cell = boardEl.children[idx];
    cell.classList.add('win');
  });
}

// Win detection
function checkWin(state, player) {
  // horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (state[r][c] === player && state[r][c+1] === player && state[r][c+2] === player && state[r][c+3] === player) {
        return [[r,c],[r,c+1],[r,c+2],[r,c+3]];
      }
    }
  }
  // vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      if (state[r][c] === player && state[r+1][c] === player && state[r+2][c] === player && state[r+3][c] === player) {
        return [[r,c],[r+1,c],[r+2,c],[r+3,c]];
      }
    }
  }
  // diag down-right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (state[r][c] === player && state[r+1][c+1] === player && state[r+2][c+2] === player && state[r+3][c+3] === player) {
        return [[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]];
      }
    }
  }
  // diag up-right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (state[r][c] === player && state[r-1][c+1] === player && state[r-2][c+2] === player && state[r-3][c+3] === player) {
        return [[r,c],[r-1,c+1],[r-2,c+2],[r-3,c+3]];
      }
    }
  }
  return null;
}

// CPU logic
async function cpuTurn() {
  locked = true;
  turnTextEl.textContent = 'CPU thinking...';
  await sleep(250);

  const col = selectCpuColumn(grid, difficulty);
  const row = getDropRow(grid, col);

  if (row === -1) {
    // fallback to first available
    for (let c = 0; c < COLS; c++) {
      const r = getDropRow(grid, c);
      if (r !== -1) { cpuMove(r, c); return; }
    }
    locked = false; // should not happen
    return;
  }
  cpuMove(row, col);
}

function cpuMove(row, col) {
  animateDrop(row, col, P2, () => {
    grid[row][col] = P2;
    const winCells = checkWin(grid, P2);
    if (winCells) {
      highlightWin(winCells);
      messageEl.textContent = 'CPU wins!';
      addScore(P2);
      locked = true;
      return;
    }
    if (isBoardFull(grid)) {
      messageEl.textContent = 'Draw!';
      locked = true;
      return;
    }
    current = P1;
    updateUI();
    locked = false;
  });
}

// CPU selection by difficulty
function selectCpuColumn(state, diff) {
  // Hard: minimax with depth
  if (diff === 'hard') {
    const { col } = minimaxRoot(state, 4, true); // depth 4
    if (col !== null) return col;
  }
  // Medium: 1) immediate win 2) block opponent 3) center preference 4) random weighted
  if (diff === 'medium') {
    const winCol = findImmediateWin(state, P2);
    if (winCol !== null) return winCol;
    const blockCol = findImmediateWin(state, P1);
    if (blockCol !== null) return blockCol;
    const preferred = [3,2,4,1,5,0,6]; // favor center
    for (const c of preferred) {
      if (getDropRow(state, c) !== -1) return c;
    }
  }
  // Easy: random legal
  const legal = [];
  for (let c = 0; c < COLS; c++) {
    if (getDropRow(state, c) !== -1) legal.push(c);
  }
  if (diff === 'easy') {
    return legal[Math.floor(Math.random() * legal.length)];
  }
  // Medium fallback: random from preferred legal
  return legal.length ? legal[Math.floor(Math.random() * legal.length)] : 0;
}

function findImmediateWin(state, player) {
  for (let c = 0; c < COLS; c++) {
    const r = getDropRow(state, c);
    if (r === -1) continue;
    state[r][c] = player;
    const win = checkWin(state, player);
    state[r][c] = 0;
    if (win) return c;
  }
  return null;
}

// Minimax with evaluation
function minimaxRoot(state, depth, maximizing) {
  let bestScore = -Infinity;
  let bestCol = null;
  const order = [3,2,4,1,5,0,6]; // center-first ordering
  for (const c of order) {
    const r = getDropRow(state, c);
    if (r === -1) continue;
    state[r][c] = P2;
    const score = minimax(state, depth - 1, -Infinity, Infinity, false);
    state[r][c] = 0;
    if (score > bestScore) {
      bestScore = score;
      bestCol = c;
    }
  }
  return { col: bestCol, score: bestScore };
}

function minimax(state, depth, alpha, beta, maximizing) {
  if (checkWin(state, P2)) return 1000000;
  if (checkWin(state, P1)) return -1000000;
  if (depth === 0 || isBoardFull(state)) return evaluateBoard(state);

  if (maximizing) {
    let value = -Infinity;
    for (let c of [3,2,4,1,5,0,6]) {
      const r = getDropRow(state, c);
      if (r === -1) continue;
      state[r][c] = P2;
      value = Math.max(value, minimax(state, depth - 1, alpha, beta, false));
      state[r][c] = 0;
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  } else {
    let value = Infinity;
    for (let c of [3,2,4,1,5,0,6]) {
      const r = getDropRow(state, c);
      if (r === -1) continue;
      state[r][c] = P1;
      value = Math.min(value, minimax(state, depth - 1, alpha, beta, true));
      state[r][c] = 0;
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return value;
  }
}

// Heuristic evaluation
function evaluateBoard(state) {
  const scoreFor = (player) => {
    let score = 0;
    const opp = player === P1 ? P2 : P1;

    // center column bias
    let centerCount = 0;
    for (let r = 0; r < ROWS; r++) if (state[r][3] === player) centerCount++;
    score += centerCount * 6;

    // evaluate all windows of length 4
    const windows = getWindows(state);
    for (const window of windows) {
      const pCount = window.filter(v => v === player).length;
      const oCount = window.filter(v => v === opp).length;
      const empty = window.filter(v => v === 0).length;

      if (pCount === 4) score += 100000;
      else if (pCount === 3 && empty === 1) score += 180;
      else if (pCount === 2 && empty === 2) score += 30;

      if (oCount === 3 && empty === 1) score -= 160;
      if (oCount === 2 && empty === 2) score -= 20;
    }
    return score;
  };
  return scoreFor(P2) - scoreFor(P1);
}

function getWindows(state) {
  const windows = [];
  // horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      windows.push([state[r][c], state[r][c+1], state[r][c+2], state[r][c+3]]);
    }
  }
  // vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      windows.push([state[r][c], state[r+1][c], state[r+2][c], state[r+3][c]]);
    }
  }
  // diag down-right
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      windows.push([state[r][c], state[r+1][c+1], state[r+2][c+2], state[r+3][c+3]]);
    }
  }
  // diag up-right
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      windows.push([state[r][c], state[r-1][c+1], state[r-2][c+2], state[r-3][c+3]]);
    }
  }
  return windows;
}

// Utils
function sleep(ms) { return new Promise(res => setTimeout(res, ms)); }
function capitalize(s) { return s[0].toUpperCase() + s.slice(1); }