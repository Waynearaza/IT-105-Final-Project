const ROWS = 6;
const COLS = 7;
const P1 = 1;      // Player 1 ID (Red)
const P2 = 2;      // Player 2 ID (Yellow - Human or CPU)

//GAME STATE VARIABLES

let grid = [];           // 2D Array representing the board data
let current = P1;        // Tracks whose turn it is
let locked = false;      // Locks input during animations
let mode = 'pvp';        // Game mode: 'pvp' or 'cpu'
let difficulty = 'medium'; // AI Difficulty level
let scores = { p1: 0, p2: 0, cpu: 0 }; 
let gameActive = false;  // Prevents moves when on the start screen

//DOM ELEMENTS
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const boardEl = document.getElementById('board');
const hoverRowEl = document.getElementById('hoverRow');
const turnTextEl = document.getElementById('turnText');
const winBannerEl = document.getElementById('winBanner');
const messageEl = document.getElementById('message');

const scoreP1El = document.getElementById('scoreP1');
const scoreP2El = document.getElementById('scoreP2');
const scoreCPUEl = document.getElementById('scoreCPU');
const scoreP2Wrap = document.getElementById('scoreP2Wrap');
const scoreCPUWrap = document.getElementById('scoreCPUWrap');

//INITIALIZATION
init();

function init() {
  attachEvents();
}

function attachEvents() {
  // Navigation Buttons
  document.getElementById('startPvpBtn').addEventListener('click', () => startGame('pvp'));
  document.getElementById('startCpuBtn').addEventListener('click', () => startGame('cpu'));
  document.getElementById('backToMenuBtn').addEventListener('click', showMenu);
  
  // Rematch Button
  document.getElementById('rematchBtn').addEventListener('click', () => {
    resetBoard();
    messageEl.textContent = 'Rematch started!';
    setTimeout(() => messageEl.textContent = '', 1500);
  });

  // Difficulty Select
  document.getElementById('difficulty').addEventListener('change', (e) => {
    difficulty = e.target.value;
  });
}

function showMenu() {
  gameActive = false;
  gameScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  scores = { p1: 0, p2: 0, cpu: 0 }; 
}

function startGame(selectedMode) {
  mode = selectedMode;
  scores = { p1: 0, p2: 0, cpu: 0 }; 
  
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  
  // Toggle UI for CPU vs PvP
  if (mode === 'cpu') {
    document.getElementById('difficultyWrap').classList.remove('hidden');
    scoreP2Wrap.classList.add('hidden');
    scoreCPUWrap.classList.remove('hidden');
  } else {
    document.getElementById('difficultyWrap').classList.add('hidden');
    scoreP2Wrap.classList.remove('hidden');
    scoreCPUWrap.classList.add('hidden');
  }

  updateScores();
  resetBoard();
}

function resetBoard() {
  grid = createGrid();
  current = P1;
  locked = false;
  gameActive = true;
  winBannerEl.textContent = ''; 
  messageEl.textContent = '';
  renderBoard();
  updateUI();
}

function createGrid() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

//RENDERING

function renderHoverRow() {
  hoverRowEl.innerHTML = '';
  if (!gameActive) return;

  for (let c = 0; c < COLS; c++) {
    const slot = document.createElement('div');
    slot.className = 'hover-slot';
    const disc = document.createElement('div');
    disc.className = `hover-disc ${current === P1 ? 'red' : 'yellow'}`;
    slot.appendChild(disc);
    
    slot.addEventListener('click', () => tryMove(c));
    hoverRowEl.appendChild(slot);
  }
}

function renderBoard() {
  boardEl.innerHTML = '';
  renderHoverRow();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      
      // LAYER 1: Dark Hole Background
      const holeBg = document.createElement('div');
      holeBg.className = 'hole-bg';
      cell.appendChild(holeBg);

      // LAYER 2: The Disc (if present)
      if (grid[r][c] !== 0) {
        const disc = document.createElement('div');
        disc.className = `disc ${grid[r][c] === P1 ? 'red' : 'yellow'}`;
        cell.appendChild(disc);
      }
      
      // LAYER 3: The Cell itself acts as the mask (Blue with transparent center)
      
      cell.addEventListener('click', () => tryMove(c));
      boardEl.appendChild(cell);
    }
  }
}

function updateUI() {
  const pName = getPlayerName(current);
  turnTextEl.textContent = `Turn: ${pName}`;
  
  // Handle text glow
  turnTextEl.classList.remove('red-glow', 'yellow-glow');
  if (current === P1) turnTextEl.classList.add('red-glow');
  else turnTextEl.classList.add('yellow-glow');

  renderHoverRow(); 
}

function updateScores() {
  scoreP1El.textContent = scores.p1;
  scoreP2El.textContent = scores.p2;
  scoreCPUEl.textContent = scores.cpu;
}

//GAMEPLAY LOGICS
function tryMove(col) {
  if (locked || !gameActive) return;
  
  const row = getDropRow(grid, col);
  if (row === -1) return; // Column full

  locked = true; 
  
  // Trigger Smooth Animation
  animateDrop(row, col, current, () => {
    grid[row][col] = current;
    
    const winCells = checkWin(grid, current);
    if (winCells) {
      handleWin(current, winCells);
      return;
    }

    if (isBoardFull(grid)) {
      handleDraw();
      return;
    }

    current = current === P1 ? P2 : P1;
    updateUI();
    locked = false;

    if (mode === 'cpu' && current === P2) {
      cpuTurn();
    }
  });
}

// --- SMOOTH ANIMATION FUNCTION ---
function animateDrop(row, col, player, onComplete) {
  const idx = row * COLS + col;
  const cell = boardEl.children[idx];
  
  const disc = document.createElement('div');
  disc.className = `disc ${player === P1 ? 'red' : 'yellow'}`;
  
  // Calculate Start Position: Above the board
  // (row + 1) * 115% ensures it clears the top regardless of which row it is
  const startY = -(row + 1) * 115; 
  
  // Web Animations API
  const animation = disc.animate([
    { transform: `translateY(${startY}%)` },
    { transform: 'translateY(0)' }
  ], {
    duration: 650, // Slower duration for weight
    easing: 'cubic-bezier(0.5, 0, 0.25, 1)', // "Ease Out" (Fast start, slow stop)
    fill: 'forwards'
  });

  cell.appendChild(disc);
  animation.onfinish = onComplete;
}

function handleWin(player, cells) {
  gameActive = false;
  highlightWin(cells);
  
  const name = getPlayerName(player);
  winBannerEl.textContent = `${name} WINS!`; 
  
  if (player === P1) scores.p1++;
  else if (mode === 'cpu') scores.cpu++;
  else scores.p2++;
  
  updateScores();
  locked = false; 
}

function handleDraw() {
  gameActive = false;
  winBannerEl.textContent = "IT'S A DRAW!";
  locked = false;
}

function highlightWin(cells) {
  cells.forEach(([r, c]) => {
    const idx = r * COLS + c;
    const cell = boardEl.children[idx];
    
    // Add glowing ring
    const ring = document.createElement('div');
    ring.className = 'win-ring';
    cell.appendChild(ring);
  });
}

//HELPER & AI FUNCTIONS

function getPlayerName(p) {
  if (p === P1) return 'Player 1';
  if (mode === 'cpu') return 'CPU';
  return 'Player 2';
}

function getDropRow(state, col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (state[r][col] === 0) return r;
  }
  return -1;
}

function isBoardFull(state) {
  return state[0].every(val => val !== 0);
}

function checkWin(state, player) {
  // Horizontal, Vertical, and Diagonals...
  // (Logic remains same as previous versions for brevity)
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (state[r][c] === player && state[r][c+1] === player && state[r][c+2] === player && state[r][c+3] === player) 
        return [[r,c],[r,c+1],[r,c+2],[r,c+3]];
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r <= ROWS - 4; r++) {
      if (state[r][c] === player && state[r+1][c] === player && state[r+2][c] === player && state[r+3][c] === player)
        return [[r,c],[r+1,c],[r+2,c],[r+3,c]];
    }
  }
  for (let r = 0; r <= ROWS - 4; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (state[r][c] === player && state[r+1][c+1] === player && state[r+2][c+2] === player && state[r+3][c+3] === player)
        return [[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]];
    }
  }
  for (let r = 3; r < ROWS; r++) {
    for (let c = 0; c <= COLS - 4; c++) {
      if (state[r][c] === player && state[r-1][c+1] === player && state[r-2][c+2] === player && state[r-3][c+3] === player)
        return [[r,c],[r-1,c+1],[r-2,c+2],[r-3,c+3]];
    }
  }
  return null;
}

// AI Logic (Minimax + Heuristics)
async function cpuTurn() {
  locked = true;
  turnTextEl.textContent = 'CPU thinking...';
  turnTextEl.classList.remove('red-glow', 'yellow-glow');
  
  await new Promise(r => setTimeout(r, 600));

  let col = selectCpuColumn(grid, difficulty);
  
  if (getDropRow(grid, col) === -1) {
    for(let c=0; c<COLS; c++) {
      if (getDropRow(grid, c) !== -1) {
        col = c; 
        break;
      }
    }
  }
  const row = getDropRow(grid, col);
  animateDrop(row, col, P2, () => {
    grid[row][col] = P2;
    const winCells = checkWin(grid, P2);
    if (winCells) { handleWin(P2, winCells); return; }
    if (isBoardFull(grid)) { handleDraw(); return; }
    current = P1;
    updateUI();
    locked = false;
  });
}

function selectCpuColumn(state, diff) {
  if (diff === 'hard') return minimaxRoot(state, 4);
  if (diff === 'medium') {
    const winCol = findImmediateMove(state, P2); 
    if (winCol !== -1) return winCol;
    const blockCol = findImmediateMove(state, P1); 
    if (blockCol !== -1) return blockCol;
    const order = [3,2,4,1,5,0,6];
    for (let c of order) if (getDropRow(state, c) !== -1) return c;
  }
  const valid = [];
  for(let c=0; c<COLS; c++) if (getDropRow(state, c) !== -1) valid.push(c);
  return valid[Math.floor(Math.random() * valid.length)];
}

function findImmediateMove(state, player) {
  for (let c = 0; c < COLS; c++) {
    const r = getDropRow(state, c);
    if (r !== -1) {
      state[r][c] = player;
      const win = checkWin(state, player);
      state[r][c] = 0;
      if (win) return c;
    }
  }
  return -1;
}

function minimaxRoot(state, depth) {
  let bestScore = -Infinity;
  let bestCol = -1;
  const order = [3,2,4,1,5,0,6]; 
  for (let c of order) {
    const r = getDropRow(state, c);
    if (r === -1) continue;
    state[r][c] = P2;
    let score = minimax(state, depth - 1, -Infinity, Infinity, false);
    state[r][c] = 0;
    if (score > bestScore) { bestScore = score; bestCol = c; }
  }
  return bestCol !== -1 ? bestCol : order.find(c => getDropRow(state, c) !== -1);
}

function minimax(state, depth, alpha, beta, maximizing) {
  if (checkWin(state, P2)) return 10000;
  if (checkWin(state, P1)) return -10000;
  if (depth === 0 || isBoardFull(state)) return 0; 
  if (maximizing) {
    let maxEval = -Infinity;
    for (let c = 0; c < COLS; c++) {
      const r = getDropRow(state, c);
      if (r === -1) continue;
      state[r][c] = P2;
      let score = minimax(state, depth - 1, alpha, beta, false);
      state[r][c] = 0;
      maxEval = Math.max(maxEval, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let c = 0; c < COLS; c++) {
      const r = getDropRow(state, c);
      if (r === -1) continue;
      state[r][c] = P1;
      let score = minimax(state, depth - 1, alpha, beta, true);
      state[r][c] = 0;
      minEval = Math.min(minEval, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}