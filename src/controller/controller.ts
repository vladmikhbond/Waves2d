
import Oscillator from "../models/oscillator.js";
import Space from "../models/space.js";
import { show } from "../view/view.js";

const n = 900;      // total area
const n_vis = 500;   // visible middle area 
const beg = (n - n_vis) / 2 | 0;
const scale = 2;

// показує розмір простору
document.getElementById("params")!.innerHTML = `${n}/${n_vis}`

enum State {
    Osc, Bar
}

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
            // this.space.addOscillator(new Oscillator(300, 300, 1, 1/20));
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

        document.getElementById("canvas")!.addEventListener("mousedown", (e) => {
            const c = (e.offsetX / scale + beg) | 0;
            const r = (e.offsetY / scale  + beg) | 0;
            if (this.state == State.Osc) {
                this.space.addOscillator(new Oscillator(r, c, 1, 1/20));
            }
            
    
        });

        document.getElementById("canvas")!.addEventListener("mousemove", (e) => {
        
        });

        document.getElementById("canvas")!.addEventListener("mouseup", (e) => {
        
        });
    }

    get state(): State {
        const osc_selected = (document.getElementById("osc") as HTMLInputElement).checked;
        return osc_selected ? State.Osc : State.Bar;
    }



//#region step-stop-run

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

//#endregion

}

export function createSpace() {
    const k = +(document.getElementById("k") as HTMLInputElement)!.value;
    const m = +(document.getElementById("m") as HTMLInputElement)!.value;
    const l = +(document.getElementById("l") as HTMLInputElement)!.value;
    stop();
    return new Space(n, k, m, l);
}


