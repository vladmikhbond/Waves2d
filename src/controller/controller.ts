
import Oscillator from "../models/oscillator.js";
import Space from "../models/space.js";
import { show } from "../view/view.js";

const n = 900;      // total area
const n_vis = 500;   // visible middle area 

// показує розмір простору
document.getElementById("params")!.innerHTML = `${n}/${n_vis}`


export default class Controller {
    space: Space;
    timer: ReturnType<typeof setInterval> | 0 = 0;

    constructor() {
        this.space = createSpace();
        this.addListeners();
    }

    addListeners() {
        document.getElementById("resetButton")!.addEventListener("click", () => {
            this.space = createSpace();
            //this.space.addOscillator(new Oscillator(n/2, n/2, 1, 1/40));
            this.space.addOscillator(new Oscillator(300, 300, 1, 1/20));
            show(this.space, n_vis);
        });

        document.getElementById("runButton")!.addEventListener("click", () => {
            if (this.timer) this.stop(); 
            else this.run();
        });

        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key == "1") {
                this.stop();
                this.step();
            }
        });
    }

// -----------------------------------------------------------------------

    step() {
        this.space.step();  
        show(this.space, n_vis);
        // stop when limit
        if (this.space.nodes[1][1].z > 0.001) {
            this.stop(); 
            console.log(this.space.nodes[1][1].z)
        }
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = 0;
        }
    }

    run() {
        const period = +(document.getElementById("p") as HTMLInputElement)!.value;

        if (this.timer) return;
        this.timer = setInterval(() => { 
            this.step();
        }, period);
    }



}

export function createSpace() {
    const k = +(document.getElementById("k") as HTMLInputElement)!.value;
    const m = +(document.getElementById("m") as HTMLInputElement)!.value;
    const l = +(document.getElementById("l") as HTMLInputElement)!.value;
    stop();
    return new Space(n, k, m, l);
}


