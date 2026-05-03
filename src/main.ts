import Space from "./models/space.js";
import { show } from "./view/view.js";

const n = 1000;      // total area
const n_vis = 500;   // visible middle area
// const mid = n / 2 | 0, beg = ( n - n_vis) / 2 | 0, end = beg + n_vis;

let k: number;
let m: number;
let l: number;
let period: number;
let space: Space;
let timer: ReturnType<typeof setInterval> | 0;


space = createSpace();
show(space, n_vis);

// show params
document.getElementById("params")!.innerHTML = `${n}/${n_vis}`


// =========================== handlers ===============================

document.getElementById("resetButton")!.addEventListener("click", () => {
    space = createSpace();
    show(space, n_vis);
});

document.getElementById("runButton")!.addEventListener("click", () => {
    if (timer) stop(); 
    else run();
});

document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key == "1") {
        stop();
        step();
    }
});

// -----------------------------------------------------------------------

function createSpace() {
    k = +(document.getElementById("k") as HTMLInputElement)!.value;
    m = +(document.getElementById("m") as HTMLInputElement)!.value;
    l = +(document.getElementById("l") as HTMLInputElement)!.value;
    period = +(document.getElementById("p") as HTMLInputElement)!.value;
    stop();
    return new Space(n, k, m, l);
}

function step() {

    space.step();  
      
    show(space, n_vis);

    // stop when limit
    if (space.nodes[1][1].z > 0.01) stop(); 
}

function stop() {
    if (timer) {
        clearInterval(timer);
        timer = 0;
    }
}

function run() {
    if (timer) return;
    timer = setInterval(() => { 
        step();
    }, period);
}