import {Oscillator, Mono} from "../models/oscillator.js";
import Space from "../models/space.js";

import { init3d, show3d} from "../view/view3d.js";
import { init2d, show2d, grayLine2d, clearCanvas2d, grayRect2d} from "../view/view2d.js";
import Bar from "../models/bar.js";
import {size, margin} from "../main.js"

const beg = size + margin;
export let zScale = 50;

const canvas2d = (document.getElementById("canvas2d") as HTMLCanvasElement)!;
const canvas3d = (document.getElementById("canvas3d") as HTMLCanvasElement)!;

let show = show2d;

enum State {
    Inf, Osc, Mon, Sto, Del
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
        init2d();
        init3d();
        show(this.space);
    }

    get state(): State 
    {
        const stateElem = document.getElementById("state") as HTMLInputElement;
        
        switch(stateElem.value) {
            case "Osc": return State.Osc;
            case "Sto": return State.Sto;
            case "Mon": return State.Mon;            
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
            show(this.space);
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
            show(this.space);
        });
            

        document.getElementById("zScale")!.addEventListener("change", (e) => {
            zScale = +(e.target as HTMLInputElement).value;
            show(this.space);
        });

        document.getElementById("state")!.addEventListener("change", (e) => {
            let b = this.state == State.Osc || this.state == State.Mon;
            (document.getElementById("oscill_ampl") as HTMLSelectElement).disabled = !b;
            (document.getElementById("oscill_q") as HTMLSelectElement).disabled = !b;
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
        show(this.space);
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
        
        let x0 = 0, y0 = 0, mousedown = false;

        canvas.addEventListener("mousedown", (e) => {
            x0 = e.offsetX;
            y0 = e.offsetY;
            mousedown = true;
        });


        canvas.addEventListener("mousemove", (e) => {
            if (mousedown) {
                show(this.space);
                if (this.viewMode == ViewMode.Three) {
                    clearCanvas2d();
                } 
                if (this.state == State.Del) {
                    grayRect2d(x0, y0, e.offsetX, e.offsetY);
                } else {
                    grayLine2d(x0, y0, e.offsetX, e.offsetY); 
                }
            }
            // show mouse position
            const c = e.offsetX;
            const r = e.offsetY;
            document.getElementById("info")!.innerHTML = 
                    `x:${e.offsetX}, y:${e.offsetY}, z:${this.space.nodes[r][c].z}`;
        });


        canvas.addEventListener("mouseup", (e: MouseEvent) => {
            let c0 = x0, r0 = y0;
            mousedown = false;
            const c1 = e.offsetX;
            const r1 = e.offsetY;
            if (this.state == State.Osc || this.state == State.Mon) {
                this.addOscillators(r0, c0, r1, c1);                                
            } else if (this.state == State.Sto) {
                this.addBars(r0, c0, r1, c1);                                
            } else if (this.state == State.Del) {
                this.space.DeleteInRect(r0, c0, r1, c1);                                
            } 
            // show
            show(this.space);
            if (this.viewMode == ViewMode.Three) {
                clearCanvas2d();
            } 
        });
    }

    addOscillators(r0:number, c0:number, r1:number, c1: number) 
    {
        let ampl = +(document.getElementById("oscill_ampl")! as HTMLInputElement).value;
        let q = +(document.getElementById("oscill_q")! as HTMLInputElement).value;

        if (c0 == c1 && r0 == r1) {
            let osc = this.state == State.Osc ? 
                    new Oscillator(r0, c0, ampl, q, this.space) : 
                    new Mono(r0, c0, ampl, q, this.space)
            this.space.addOscillator(osc);
            return;
        }

        if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
            if (r1 < r0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0]; 
            for (let r = r0; r <= r1; r += 2) {
                let c = (r - r0)*(c1 - c0)/(r1 - r0) + c0 | 0;
                let osc = this.state == State.Osc ? 
                    new Oscillator(r, c, ampl/2, q, this.space) : 
                    new Mono(r, c, ampl/2, q, this.space)
                this.space.addOscillator(osc);
            }
        } else {
            if (c1 < c0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0];             
            for (let c = c0; c <= c1; c += 2) {
                let r = (c - c0)*(r1 - r0)/(c1 - c0) + r0 | 0;
                let osc = this.state == State.Osc ? 
                    new Oscillator(r, c, ampl/2, q, this.space) : 
                    new Mono(r, c, ampl/2, q, this.space)
                this.space.addOscillator(osc);             
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
    return new Space(size, margin, k_m, l);
}


