
import Oscillator from "../models/oscillator.js";
import Space from "../models/space.js";
import { show, grayLine} from "../view/view.js";

const n = 900;      // total area
const n_vis = 500;   // visible middle area 
const beg = (n - n_vis) / 2 | 0;
const scale = 2;
export let zScale = 50;

// показує розмір простору
document.getElementById("params")!.innerHTML = `${n_vis}/${n}`

enum State {
    Test, Osc, Stone
}

export default class Controller {
    space: Space;
    timer: ReturnType<typeof setInterval> | 0 = 0;

    constructor() {
        this.space = createSpace();
        this.addOtherListeners();
        this.addMouseListeners();
    }

    get state(): State {
        if ((document.getElementById("osc") as HTMLInputElement).checked)
            return State.Osc;
        if ((document.getElementById("stone") as HTMLInputElement).checked)
            return State.Stone;
        return State.Test;        
    }


//#region other listeners
    addOtherListeners() 
    {
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

        document.getElementById("zScale")!.addEventListener("change", (e) => {
            zScale = +(e.target as HTMLInputElement).value;
            show(this.space, n_vis);
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
        const tact = +(document.getElementById("tact") as HTMLInputElement)!.value;

        if (this.timer) return;
        this.timer = setInterval(() => { 
            this.step();
        }, tact);
    }
//#endregion
    

//#region mouse listeners
    addMouseListeners() {
        
        let c0 = 0, r0 = 0, x0 = 0, y0 = 0, mousedown = false;
        const canvas = document.getElementById("canvas")!

        canvas.addEventListener("mousedown", (e) => {
            x0 = e.offsetX;
            y0 = e.offsetY;
            c0 = (e.offsetX / scale + beg) | 0;
            r0 = (e.offsetY / scale  + beg) | 0;
            //
            if (this.state == State.Test) {
                let node = this.space.nodes[r0][c0];
                document.getElementById("info")!.innerHTML = `v:${node.v} z:${node.z} r: ${r0} c:${c0}`;
            }
            mousedown = true;
        });

        canvas.addEventListener("mousemove", (e) => {
            if (mousedown) {
                show(this.space, n_vis);
                grayLine(x0 / scale, y0 / scale, e.offsetX / scale, e.offsetY / scale); 
            }
        });

        canvas.addEventListener("mouseup", (e: MouseEvent) => {
            mousedown = false;
            const c1 = (e.offsetX / scale + beg) | 0;
            const r1 = (e.offsetY / scale  + beg) | 0;
            if (this.state == State.Osc) {
                this.addOscillators(r0, r1, c0, c1, e.altKey);                                
            } else if (this.state == State.Stone) {
                this.addStones(r0, r1, c0, c1, e.altKey);                                
            } 
            show(this.space, n_vis);
        });
    }

    addOscillators(r0:number, r1:number, c0:number, c1: number, altKey: boolean) 
    {
        let lambda = 1 / +(document.getElementById("lambda") as HTMLInputElement).value;
        
        if (c0 == c1 && r0 == r1) {
            if (altKey) {
                this.space.removeOscillatorAt(r1, c1);
            } else {
                this.space.addOscillator(new Oscillator(r0, c0, 1, lambda));
            }
            return;
        }

        if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
            if (r1 < r0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0]; 
            for (let r = r0; r <= r1; r += 2) {
                let c = (r - r0)*(c1 - c0)/(r1 - r0) + c0 | 0;
                if (altKey) {
                    this.space.removeOscillatorAt(r, c);
                } else {
                    this.space.addOscillator(new Oscillator(r, c, 4/(r1 - r0), lambda));
                }
            }
        } else {
            if (c1 < c0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0];             
            for (let c = c0; c <= c1; c += 2) {
                let r = (c - c0)*(r1 - r0)/(c1 - c0) + r0 | 0;
                if (altKey) {
                    this.space.removeOscillatorAt(r, c);
                } else {
                    this.space.addOscillator(new Oscillator(r, c, 4/(c1 - c0), lambda));
                }                
            }
        }
    }

    addStones(r0:number, r1:number, c0:number, c1: number, altKey: boolean) 
    {
        const newStoneValue = !altKey;
        if (c0 == c1 && r0 == r1) {
            this.space.nodes[r0][c0].stone = newStoneValue;
            return;
        }
        if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
            if (r1 < r0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0]; 
            for (let r = r0; r <= r1; r++) {
                let c = (r - r0)*(c1 - c0)/(r1 - r0) + c0 | 0;
                this.space.nodes[r][c-1].stone = newStoneValue;
                this.space.nodes[r][c].stone = newStoneValue;
                if (altKey) {
                   this.space.nodes[r][c-2].stone = false; 
                   this.space.nodes[r][c+1].stone = false; 
                }
            }
        } else {
            if (c1 < c0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0];             
            for (let c = c0; c <= c1; c++) {
                let r = (c - c0)*(r1 - r0)/(c1 - c0) + r0 | 0;
                this.space.nodes[r-1][c].stone = newStoneValue;
                this.space.nodes[r][c].stone = newStoneValue;
                if (altKey) {
                   this.space.nodes[r-2][c].stone = false; 
                   this.space.nodes[r+1][c].stone = false; 
                }
            }
        }
    }

//#endregion


}

// ------------------------- free func ------------------------------

export function createSpace() {
    const k_m = eval((document.getElementById("k_m") as HTMLInputElement)!.value);
    const l = +(document.getElementById("l") as HTMLInputElement)!.value;
    stop();
    return new Space(n, k_m, l);
}


