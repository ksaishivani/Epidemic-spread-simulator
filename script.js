const GRID_SIZE = 20;
const TOTAL = GRID_SIZE * GRID_SIZE;

let grid = [];
let infectionAge = [];
let step = 0;
let running = false;
let intervalId = null;
let chart;

const RECOVERY_TIME = 6;   // steps an infected person stays infected

// ---------- GRID ----------
function createGrid() {
    const gridDiv = document.getElementById("grid");
    gridDiv.innerHTML = "";
    grid = [];
    infectionAge = [];

    for (let i = 0; i < TOTAL; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell", "susceptible");
        gridDiv.appendChild(cell);
        grid.push("S");
        infectionAge.push(0);
    }

    // Start with ONE infected person
    const startIndex = Math.floor(TOTAL / 2);
    grid[startIndex] = "I";
    infectionAge[startIndex] = 1;

    updateGrid();
}

function updateGrid() {
    const cells = document.querySelectorAll(".cell");
    grid.forEach((state, i) => {
        cells[i].className = "cell " +
            (state === "S" ? "susceptible" :
             state === "I" ? "infected" : "recovered");
    });
}

// ---------- NEIGHBORS ----------
function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;

    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1]
    ];

    directions.forEach(([dr, dc]) => {
        const r = row + dr;
        const c = col + dc;
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
            neighbors.push(r * GRID_SIZE + c);
        }
    });

    return neighbors;
}

// ---------- STEP ----------
function nextStep() {
    if (!running) return;

    const type = document.getElementById("populationType").value;
    const infectionRate = type === "urban" ? 0.4 : 0.2;

    let newGrid = [...grid];
    let newAge = [...infectionAge];

    for (let i = 0; i < TOTAL; i++) {
        if (grid[i] === "S") {
            const neighbors = getNeighbors(i);
            const infectedNearby = neighbors.some(n => grid[n] === "I");

            if (infectedNearby && Math.random() < infectionRate) {
                newGrid[i] = "I";
                newAge[i] = 1;
            }
        }

        if (grid[i] === "I") {
            newAge[i]++;
            if (newAge[i] >= RECOVERY_TIME) {
                newGrid[i] = "R";
            }
        }
    }

    grid = newGrid;
    infectionAge = newAge;

    updateGrid();
    updateChart();

    step++;

    // STOP when no infected left
    if (!grid.includes("I")) {
        running = false;
        clearInterval(intervalId);
    }
}

// ---------- CONTROLS ----------
function startSimulation() {
    if (running) return;
    running = true;

    intervalId = setInterval(nextStep, 800); // 👈 SLOW & CLEAR
}

function resetSimulation() {
    running = false;
    clearInterval(intervalId);
    step = 0;

    if (chart) chart.destroy();

    createGrid();
    createChart();
}

// ---------- GRAPH ----------
function sirCounts() {
    return {
        S: grid.filter(x => x === "S").length,
        I: grid.filter(x => x === "I").length,
        R: grid.filter(x => x === "R").length
    };
}

function createChart() {
    const ctx = document.getElementById("sirChart");
    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: [],
            datasets: [
                { label: "Susceptible", data: [], borderColor: "blue" },
                { label: "Infected", data: [], borderColor: "red" },
                { label: "Recovered", data: [], borderColor: "green" },
                { label: "AI Prediction", data: [], borderColor: "orange", borderDash: [6,6] }
            ]
        }
    });
}

function updateChart() {
    const { S, I, R } = sirCounts();
    chart.data.labels.push(step);
    chart.data.datasets[0].data.push(S);
    chart.data.datasets[1].data.push(I);
    chart.data.datasets[2].data.push(R);
    chart.data.datasets[3].data.push(I + 5); // simple AI trend
    chart.update();
}

// ---------- INIT ----------
createGrid();
createChart();



