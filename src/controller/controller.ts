
import Oscillator from "../models/oscillator.js";
import Space from "../models/space.js";

import { init3d, show3d} from "../view/view3d.js";
import { init2d, show2d, grayLine2d, clearCanvas2d, grayRect2d} from "../view/view2d.js";
import Bar from "../models/bar.js";

const n = 900;      // total area
const n_vis = 500;   // visible middle area 
const beg = (n - n_vis) / 2 | 0;
const scale = 2;
export let zScale = 50;

const canvas2d = (document.getElementById("canvas2d") as HTMLCanvasElement)!;
const canvas3d = (document.getElementById("canvas3d") as HTMLCanvasElement)!;

let show = show2d;

// показує розмір простору
document.getElementById("params")!.innerHTML = `${n_vis}/${n}`

enum State {
    Inf, Osc, Sto, Del
}

enum ViewMode {
    Two, Three
}

export default class Controller {
    space: Space;
    timer: ReturnType<typeof setInterval> | 0 = 0;
    viewMode: ViewMode = ViewMode.Two;

    constructor() {
        this.space = createSpace();
        this.addOtherListeners();
        this.addMouseListeners(canvas2d);
        // this.addMouseListeners(canvas3d);
        init2d();
        init3d();
        show(this.space, n_vis);
    }

    get state(): State 
    {
        const stateElem = document.getElementById("state") as HTMLInputElement;
        
        switch(stateElem.value) {
            case "Osc": return State.Osc;
            case "Sto": return State.Sto;
            case "Del": return State.Del;
            default: return State.Inf;           
        }       
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

        document.getElementById("dButton")!.addEventListener("click", (e) => {
            if (this.viewMode == ViewMode.Two) {
                // switch to 3d
                this.viewMode = ViewMode.Three;  
                show = show3d;
                clearCanvas2d();
                canvas3d.style.display = "block";
                (e.target as HTMLButtonElement)!.innerHTML = "2d";
            } else {
                // switch to 2d
                this.viewMode = ViewMode.Two;
                show = show2d;
                canvas3d.style.display = "none";
                (e.target as HTMLButtonElement)!.innerHTML = "3d";  
            }
            show(this.space, n_vis);
        });
            

        document.getElementById("zScale")!.addEventListener("change", (e) => {
            zScale = +(e.target as HTMLInputElement).value;
            show(this.space, n_vis);
        });

        document.getElementById("state")!.addEventListener("change", (e) => {
            document.getElementById("lambda")!.style.display = 
               this.state == State.Osc ? "inline" : "none";
        });
        
        document.getElementById("k_m")!.addEventListener("change", (e) => {
            this.space.k_m = +(e.target as HTMLInputElement).value;
        });
        
        document.getElementById("loss")!.addEventListener("change", (e) => {
            this.space.loss = +(e.target as HTMLInputElement).value
        });
        
        document.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key == "s") {
                this.stop();
                this.step();
            }
        });    
        
    }

    step() {
        this.space.step();  
        show(this.space, n_vis);
        // stop when limit
        if (this.space.nodes[1][1].z > 1e-4) {
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
        if (this.timer) return;
        this.timer = setInterval(() => { 
            this.step();
        }, 1);
    }
//#endregion
    

//#region mouse listeners
    addMouseListeners(canvas: HTMLElement) {
        
        let c0 = 0, r0 = 0, x0 = 0, y0 = 0, mousedown = false;

        canvas.addEventListener("mousedown", (e) => {
            x0 = e.offsetX;
            y0 = e.offsetY;
            c0 = (e.offsetX / scale + beg) | 0;
            r0 = (e.offsetY / scale  + beg) | 0;
            //
            if (this.state == State.Inf) {
                let node = this.space.nodes[r0][c0];
                document.getElementById("info")!.innerHTML = 
                    `v:${node.v.toFixed(5)} z:${node.z.toFixed(5)} x: ${x0} y:${y0}`;
            }
            mousedown = true;
        });


        canvas.addEventListener("mousemove", (e) => {
            if (mousedown) {
                show(this.space, n_vis);
                if (this.viewMode == ViewMode.Three) {
                    clearCanvas2d();
                } 
                if (this.state == State.Del) {
                    grayRect2d(x0 / scale, y0 / scale, e.offsetX / scale, e.offsetY / scale);
                } else {
                    grayLine2d(x0 / scale, y0 / scale, e.offsetX / scale, e.offsetY / scale); 
                }
            }
            // show mouse position
            document.getElementById("info")!.innerHTML = `${e.offsetX}, ${e.offsetY}`;
        });


        canvas.addEventListener("mouseup", (e: MouseEvent) => {
            mousedown = false;
            const c1 = (e.offsetX / scale + beg) | 0;
            const r1 = (e.offsetY / scale  + beg) | 0;
            if (this.state == State.Osc) {
                this.addOscillators(r0, c0, r1, c1);                                
            } else if (this.state == State.Sto) {
                this.addBars(r0, c0, r1, c1);                                
            } else if (this.state == State.Del) {
                this.space.DeleteInRect(r0, c0, r1, c1);                                
            } 
            // show
            show(this.space, n_vis);
            if (this.viewMode == ViewMode.Three) {
                clearCanvas2d();
            } 
        });
    }

    addOscillators(r0:number, c0:number, r1:number, c1: number) 
    {
        let lambda = 1 / +(document.getElementById("lambda") as HTMLInputElement).value;
        let ampl = 1;

        if (c0 == c1 && r0 == r1) {
            this.space.addOscillator(new Oscillator(r0, c0, ampl, lambda));
            return;
        }

        if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
            if (r1 < r0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0]; 
            for (let r = r0; r <= r1; r += 2) {
                let c = (r - r0)*(c1 - c0)/(r1 - r0) + c0 | 0;
                this.space.addOscillator(new Oscillator(r, c, ampl/2, lambda));
            }
        } else {
            if (c1 < c0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0];             
            for (let c = c0; c <= c1; c += 2) {
                let r = (c - c0)*(r1 - r0)/(c1 - c0) + r0 | 0;
                this.space.addOscillator(new Oscillator(r, c, ampl/2, lambda));             
            }
        }
    }

    addBars(r0:number, c0:number, r1:number, c1: number) 
    {
        this.space.addBar(new Bar(r0, c0, r1, c1));
    }

//#endregion


}

// ------------------------- free func ------------------------------

function parseRatio(value: string) {
    const parts = value.split("/").map((v) => v.trim());
    if (parts.length === 2) {
        const numerator = parseFloat(parts[0]);
        const denominator = parseFloat(parts[1]);
        if (!Number.isNaN(numerator) && !Number.isNaN(denominator) && denominator !== 0) {
            return numerator / denominator;
        }
    }
    const result = parseFloat(value);
    return Number.isFinite(result) ? result : 0;
}

export function createSpace() {
    const k_m = +(document.getElementById("k_m") as HTMLInputElement)!.value;
    const l = +(document.getElementById("loss") as HTMLInputElement)!.value;
    stop();
    return new Space(n, n_vis, k_m, l);
}


