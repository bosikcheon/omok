const BOARD_SIZE = 15;
const board = document.getElementById("board");
const gameStatus = document.getElementById("gameStatus");
const turnText = document.getElementById("turnText");
const blackCard = document.getElementById("blackCard");
const whiteCard = document.getElementById("whiteCard");
const blackRate = document.getElementById("blackRate");
const whiteRate = document.getElementById("whiteRate");
const blackWins = document.getElementById("blackWins");
const whiteWins = document.getElementById("whiteWins");
const blackLosses = document.getElementById("blackLosses");
const whiteLosses = document.getElementById("whiteLosses");
const startBtn = document.getElementById("startBtn");
const endBtn = document.getElementById("endBtn");
const restartBtn = document.getElementById("restartBtn");
const resultModal = document.getElementById("resultModal");
const resultStone = document.getElementById("resultStone");
const resultTitle = document.getElementById("resultTitle");
const resultMessage = document.getElementById("resultMessage");
const modalRestartBtn = document.getElementById("modalRestartBtn");

let boardState = [];
let currentPlayer = "black";
let gameRunning = false;
let gameFinished = false;
let wins = { black: 0, white: 0 };
let games = { black: 0, white: 0 };

function createBoard() {
  board.innerHTML = "";
  boardState = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.addEventListener("click", handleCellClick);
      board.appendChild(cell);
    }
  }
}

function startGame() {
  createBoard();
  currentPlayer = "black";
  gameRunning = true;
  gameFinished = false;
  board.classList.add("game-active");
  resultModal.classList.add("hidden");
  updateStatus();
  updateButtons();
}

function restartGame() {
  startGame();
}

function endGame() {
  if (!gameRunning || gameFinished) return;
  gameRunning = false;
  gameFinished = true;
  board.classList.remove("game-active");
  gameStatus.textContent = "종료됨";
  turnText.textContent = "-";
  blackCard.classList.remove("active");
  whiteCard.classList.remove("active");
  updateButtons();
}

function handleCellClick(event) {
  if (!gameRunning || gameFinished) return;
  const cell = event.currentTarget;
  const row = Number(cell.dataset.row);
  const col = Number(cell.dataset.col);
  if (boardState[row][col]) return;

  boardState[row][col] = currentPlayer;
  const stone = document.createElement("span");
  stone.className = `stone-piece ${currentPlayer}`;
  cell.appendChild(stone);

  const winningLine = getWinningLine(row, col, currentPlayer);
  if (winningLine.length >= 5) {
    finishGame(currentPlayer, winningLine);
    return;
  }

  if (isBoardFull()) {
    finishDraw();
    return;
  }

  currentPlayer = currentPlayer === "black" ? "white" : "black";
  updateStatus();
}

function getWinningLine(row, col, player) {
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1]
  ];

  for (const [dr, dc] of directions) {
    const line = [[row, col]];
    line.push(...collect(row, col, dr, dc, player));
    line.push(...collect(row, col, -dr, -dc, player));
    if (line.length >= 5) return line;
  }
  return [];
}

function collect(row, col, dr, dc, player) {
  const result = [];
  let r = row + dr;
  let c = col + dc;
  while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && boardState[r][c] === player) {
    result.push([r, c]);
    r += dr;
    c += dc;
  }
  return result;
}

function finishGame(winner, winningLine) {
  gameRunning = false;
  gameFinished = true;
  board.classList.remove("game-active");
  wins[winner]++;
  games.black++;
  games.white++;
  winningLine.forEach(([row, col]) => {
    const index = row * BOARD_SIZE + col;
    board.children[index].classList.add("winning");
  });
  updateRates();
  updateRecord();
  const winnerName = winner === "black" ? "흑" : "백";
  gameStatus.textContent = `${winnerName} 승리`;
  turnText.textContent = winnerName;
  blackCard.classList.toggle("active", winner === "black");
  whiteCard.classList.toggle("active", winner === "white");
  showResult(winner, winnerName);
  updateButtons();
}

function finishDraw() {
  gameRunning = false;
  gameFinished = true;
  board.classList.remove("game-active");
  games.black++;
  games.white++;
  updateRates();
  updateRecord();
  gameStatus.textContent = "무승부";
  turnText.textContent = "-";
  blackCard.classList.remove("active");
  whiteCard.classList.remove("active");
  resultStone.className = "result-stone";
  resultTitle.textContent = "무승부!";
  resultMessage.textContent = "더 이상 놓을 자리가 없습니다.";
  resultModal.classList.remove("hidden");
  updateButtons();
}

function showResult(winner, winnerName) {
  resultStone.className = `result-stone ${winner}`;
  resultTitle.textContent = `${winnerName} 승리!`;
  resultMessage.textContent = `${winnerName}이(가) 먼저 5목을 완성했습니다.`;
  resultModal.classList.remove("hidden");
}

function isBoardFull() {
  return boardState.every(row => row.every(cell => cell !== null));
}

function updateStatus() {
  const name = currentPlayer === "black" ? "흑" : "백";
  gameStatus.textContent = "진행 중";
  turnText.textContent = name;
  blackCard.classList.toggle("active", currentPlayer === "black");
  whiteCard.classList.toggle("active", currentPlayer === "white");
  updateRates();
  updateRecord();
}

function updateRates() {
  const total = wins.black + wins.white;
  if (total === 0) {
    blackRate.textContent = "50%";
    whiteRate.textContent = "50%";
    return;
  }
  blackRate.textContent = `${Math.round((wins.black / total) * 100)}%`;
  whiteRate.textContent = `${Math.round((wins.white / total) * 100)}%`;
}

function updateRecord() {
  blackWins.textContent = wins.black;
  whiteWins.textContent = wins.white;
  blackLosses.textContent = wins.white;
  whiteLosses.textContent = wins.black;
}

function updateButtons() {
  startBtn.disabled = gameRunning;
  endBtn.disabled = !gameRunning;
}

startBtn.addEventListener("click", startGame);
endBtn.addEventListener("click", endGame);
restartBtn.addEventListener("click", restartGame);
modalRestartBtn.addEventListener("click", restartGame);

createBoard();
updateRates();
updateRecord();
updateButtons();
