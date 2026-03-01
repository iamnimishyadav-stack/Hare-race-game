const socket = io();

// ===============================
// ROOM PROTECTION
// ===============================
const params = new URLSearchParams(window.location.search);
const room = params.get("room");

if (!room) {
    document.body.innerHTML =
        "<h2>🔒 Private Game</h2><p>Use invite link to join race.</p>";
    throw new Error("No Room");
}

socket.emit("joinRoom", room);

// ===============================
// VARIABLES
// ===============================
let role;
let harePos = 0;
let tortoisePos = 0;
let stamina = 100;
let gameStarted = false;
let playersReady = 0;

// ===============================
// WAITING MESSAGE
// ===============================
const statusText = document.createElement("h3");
statusText.innerText = "Waiting for opponent...";
document.body.insertBefore(statusText, document.body.firstChild);

// ===============================
// ROLE ASSIGNMENT
// ===============================
socket.on("role", r => {
    role = r;
    document.getElementById("role").innerText = "You are: " + role;
});

// ===============================
// START GAME WHEN 2 PLAYERS JOIN
// ===============================
socket.on("start", () => {
    playersReady++;

    if (playersReady === 1) return;

    startCountdown();
});

// ===============================
// COUNTDOWN
// ===============================
function startCountdown() {
    let count = 3;
    statusText.innerText = "Race starts in " + count;

    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            statusText.innerText = "Race starts in " + count;
        } else {
            clearInterval(countdownInterval);
            statusText.innerText = "GO 🏁";
            gameStarted = true;

            setTimeout(() => {
                statusText.style.display = "none";
            }, 1000);
        }
    }, 1000);
}

// ===============================
// ENERGY SYSTEM
// ===============================
function updateEnergy() {
    const energyBar = document.getElementById("energy");
    if (energyBar) {
        energyBar.style.width = stamina + "%";
        if (stamina < 30) {
            energyBar.style.background = "red";
        } else {
            energyBar.style.background = "green";
        }
    }
}

// Auto stamina recovery
setInterval(() => {
    if (role === "hare" && stamina < 100 && gameStarted) {
        stamina += 2;
        updateEnergy();
    }
}, 1000);

// ===============================
// MOVEMENT FUNCTIONS
// ===============================
document.getElementById("moveBtn").onclick = () => {
    if (!gameStarted) return;

    let move = role === "hare" ? 10 : 6;

    update(move);
    socket.emit("move", { move, role });
};

document.getElementById("boostBtn").onclick = () => {
    if (!gameStarted) return;

    if (role === "hare" && stamina > 15) {
        stamina -= 15;
        updateEnergy();
        update(25);
        socket.emit("move", { move: 25, role });
    }
};

function update(move) {
    if (role === "hare") {
        harePos += move;
        document.getElementById("hare").style.left = harePos + "px";
    } else {
        tortoisePos += move;
        document.getElementById("tortoise").style.left = tortoisePos + "px";
    }
    checkWin();
}

// ===============================
// SYNC OPPONENT MOVEMENT
// ===============================
socket.on("opponentMove", data => {
    if (data.role === "hare") {
        harePos += data.move;
        document.getElementById("hare").style.left = harePos + "px";
    } else {
        tortoisePos += data.move;
        document.getElementById("tortoise").style.left = tortoisePos + "px";
    }
    checkWin();
});

// ===============================
// WIN CONDITION
// ===============================
function checkWin() {
    if (harePos >= 900) {
        endGame("🐰 Hare Wins!");
    }
    if (tortoisePos >= 900) {
        endGame("🐢 Tortoise Wins!");
    }
}

function endGame(message) {
