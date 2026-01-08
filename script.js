const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetButton = document.getElementById("reset");
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let isGameActive = true;
let gameMode = "pvp"; // "pvp" | "ai"

const winningConditions = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
];

/* ===== Event Listeners ===== */
cells.forEach(cell => cell.addEventListener("click", handleCellClick));
resetButton.addEventListener("click", resetGame);
themeToggle.addEventListener("click", toggleTheme);

/* ===== Game Logic ===== */
function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (board[index] !== "" || !isGameActive) return;

    makeMove(index, currentPlayer);
    if (checkGameOver()) return;

    if (gameMode === "ai") {
        currentPlayer = "O";
        statusText.textContent = "Computer's Turn 🤖";
        setTimeout(aiMove, 300);
    } else {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.textContent = `Player ${currentPlayer}'s Turn`;
    }
}

function makeMove(index, player) {
    board[index] = player;
    cells[index].textContent = player;
}

/* ===== AI Move ===== */
function aiMove() {
    if (!isGameActive) return;

    const bestMove = minimax([...board], "O").index;
    makeMove(bestMove, "O");

    if (checkGameOver()) return;

    currentPlayer = "X";
    statusText.textContent = "Player X's Turn";
}

/* ===== Game Over Check ===== */
function checkGameOver() {
    if (checkWinner(currentPlayer)) {
        statusText.textContent =
            currentPlayer === "O" && gameMode === "ai"
                ? "Computer Wins 🤖"
                : `Player ${currentPlayer} Wins 🎉`;
        isGameActive = false;
        return true;
    }

    if (!board.includes("")) {
        statusText.textContent = "It's a Draw 🤝";
        isGameActive = false;

        setTimeout(resetGame, 1200);
        return true;
    }
    return false;
}

function checkWinner(player) {
    return winningConditions.some(combo => {
        if (combo.every(i => board[i] === player)) {
            combo.forEach(i => cells[i].classList.add("win"));
            return true;
        }
        return false;
    });
}

/* ===== Reset Game ===== */
function resetGame() {
    cells.forEach(cell => cell.classList.add("fade-out"));

    setTimeout(() => {
        board.fill("");
        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove("win", "fade-out");
        });

        currentPlayer = "X";
        isGameActive = true;
        statusText.textContent =
            gameMode === "ai"
                ? "Player X's Turn"
                : "Player X's Turn";
    }, 600);
}

/* ===== Theme Toggle ===== */
function toggleTheme() {
    body.classList.toggle("dark-mode");
    themeToggle.textContent =
        body.classList.contains("dark-mode")
            ? "☀️ Light Mode"
            : "🌙 Dark Mode";
}

/* ===== Unbeatable AI (Minimax) ===== */
function minimax(newBoard, player) {
    const available = newBoard
        .map((v, i) => v === "" ? i : null)
        .filter(v => v !== null);

    if (isWinner(newBoard, "X")) return { score: -10 };
    if (isWinner(newBoard, "O")) return { score: 10 };
    if (available.length === 0) return { score: 0 };

    let moves = [];

    for (let i of available) {
        let move = {};
        move.index = i;
        newBoard[i] = player;

        move.score = minimax(newBoard, player === "O" ? "X" : "O").score;
        newBoard[i] = "";
        moves.push(move);
    }

    let bestMove;
    if (player === "O") {
        let bestScore = -Infinity;
        moves.forEach((m, i) => {
            if (m.score > bestScore) {
                bestScore = m.score;
                bestMove = i;
            }
        });
    } else {
        let bestScore = Infinity;
        moves.forEach((m, i) => {
            if (m.score < bestScore) {
                bestScore = m.score;
                bestMove = i;
            }
        });
    }
    return moves[bestMove];
}

function isWinner(b, player) {
    return winningConditions.some(combo =>
        combo.every(i => b[i] === player)
    );
}

/* ===== Game Mode Toggle Buttons ===== */
document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {

        document.querySelectorAll(".mode-btn")
            .forEach(b => b.classList.remove("active"));

        btn.classList.add("active");

        gameMode = btn.dataset.mode; // "pvp" | "ai"
        resetGame();
    });
});
