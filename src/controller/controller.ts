
import Oscillator from "../models/oscillator.js";
import Space from "../models/space.js";
import { show, grayLine } from "../view/view.js";

const n = 900;      // total area
const n_vis = 500;   // visible middle area 
const beg = (n - n_vis) / 2 | 0;
const scale = 2;

// показує розмір простору
document.getElementById("params")!.innerHTML = `${n}/${n_vis}`

enum State {
    Osc, Stone
}

export default class Controller {
    space: Space;
    timer: ReturnType<typeof setInterval> | 0 = 0;

    constructor() {
        this.space = createSpace();
        this.addButtonListeners();
        this.addMouseListeners();
    }

//#region button listeners

    addButtonListeners() {
        document.getElementById("resetButton")!.addEventListener("click", () => {
            this.space = createSpace();
            this.stop();
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
    

//#region mouse listeners
    addMouseListeners() {
        
        let c0 = 0, r0 = 0, x0 = 0, y0 = 0, mdown = false;

        document.getElementById("canvas")!.addEventListener("mousedown", (e) => {
            x0 = e.offsetX;
            y0 = e.offsetY;
            c0 = (e.offsetX / scale + beg) | 0;
            r0 = (e.offsetY / scale  + beg) | 0;
            mdown = true;
        });

        document.getElementById("canvas")!.addEventListener("mousemove", (e) => {
            if (mdown) {
                show(this.space, n_vis);
                grayLine(x0 / scale, y0 / scale, e.offsetX / scale, e.offsetY / scale); 
            }
        });

        document.getElementById("canvas")!.addEventListener("mouseup", (e) => {
            mdown = false;

            const c1 = (e.offsetX / scale + beg) | 0;
            const r1 = (e.offsetY / scale  + beg) | 0;
            if (this.state == State.Osc) {
                this.addOscillators(r0, r1, c0, c1);                                
            } else if (this.state == State.Stone) {
                this.addStones(r0, r1, c0, c1);                                
            } 
            show(this.space, n_vis);
        });
    }

    addOscillators(r0:number, r1:number, c0:number, c1: number) {
        if (c0 == c1 && r0 == r1) {
            this.space.addOscillator(new Oscillator(r0, c0, 1, 1/20));
            return;
        }
        if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
            if (r1 < r0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0]; 
            for (let r = r0; r <= r1; r += 2) {
                let c = (r - r0)*(c1 - c0)/(r1 - r0) + c0 | 0;
                this.space.addOscillator(new Oscillator(r, c, 4/(r1 - r0), 1/20));
            }
        } else {
            if (c1 < c0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0];             
            for (let c = c0; c <= c1; c += 2) {
                let r = (c - c0)*(r1 - r0)/(c1 - c0) + r0 | 0;
                this.space.addOscillator(new Oscillator(r, c, 4/(c1 - c0), 1/20));
            }
        }
    }

    addStones(r0:number, r1:number, c0:number, c1: number) {
        if (c0 == c1 && r0 == r1) {
            this.space.nodes[r0][c0].stone = true;
            return;
        }
        if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
            if (r1 < r0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0]; 
            for (let r = r0; r <= r1; r++) {
                let c = (r - r0)*(c1 - c0)/(r1 - r0) + c0 | 0;
                this.space.nodes[r][c-1].stone = true;
                this.space.nodes[r][c].stone = true;
            }
        } else {
            if (c1 < c0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0];             
            for (let c = c0; c <= c1; c++) {
                let r = (c - c0)*(r1 - r0)/(c1 - c0) + r0 | 0;
                this.space.nodes[r-1][c].stone = true;
                this.space.nodes[r][c].stone = true;
            }
        }
    }

    get state(): State {
        const osc_selected = (document.getElementById("osc") as HTMLInputElement).checked;
        return osc_selected ? State.Osc : State.Stone;
    }
//#endregion



}

// ------------------------- free func ------------------------------

export function createSpace() {
    const k = +(document.getElementById("k") as HTMLInputElement)!.value;
    const m = +(document.getElementById("m") as HTMLInputElement)!.value;
    const l = +(document.getElementById("l") as HTMLInputElement)!.value;
    stop();
    return new Space(n, k, m, l);
}


