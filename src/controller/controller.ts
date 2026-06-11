import {Oscillator, Mono} from "../models/oscillator.js";
import Receiver from "../models/receiver.js";
import Space from "../models/space.js";

import { init3d, show3d} from "../view/view3d.js";
import { init2d, show2d, grayLine2d, clearCanvas2d, grayRect2d} from "../view/view2d.js";
import Bar from "../models/bar.js";

const canvas2d = (document.getElementById("canvas2d") as HTMLCanvasElement)!;
const canvas3d = (document.getElementById("canvas3d") as HTMLCanvasElement)!;
const modeElement = (document.getElementById("mode") as HTMLInputElement)!;
const infoElement = (document.getElementById("info") as HTMLInputElement)!;

export let zScale = 50;

let show = show2d;


enum Mode {
    Inf, Osc, Mon, Rec, Sto, Del
}

enum ViewMode {
    Two, Three
}

export default class Controller 
{
    space: Space;
    timer: ReturnType<typeof setInterval> | 0 = 0;
    viewMode: ViewMode = ViewMode.Two;

    constructor() {
        this.space = createSpace();
        this.addOtherListeners();
        this.addMouseListeners(canvas2d);
        init2d(this.space.n);
        init3d(this.space.n);
        show(this.space);
    }

    get mode(): Mode 
    {
        switch(modeElement.value) {
            case "Osc": return Mode.Osc;
            case "Sto": return Mode.Sto;
            case "Mon": return Mode.Mon;            
            case "Rec": return Mode.Rec;            
            case "Del": return Mode.Del;
            default: return Mode.Inf;           
        }       
    }


//#region other listeners

    addOtherListeners() 
    {
        // runButton
        document.getElementById("runButton")!.addEventListener("click", () => {
            if (this.timer) this.stop(); 
            else this.run();
        });
        
        // dimension Button
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
            
        // helpButton
        document.getElementById("helpButton")!.addEventListener("click", () => {
            window.open("help.html", "_blank")?.focus();
        });

        // z-scale range
        document.getElementById("zScale")!.addEventListener("change", (e) => {
            zScale = +(e.target as HTMLInputElement).value;
            show(this.space);
            document.getElementById("zScaleValue")!.innerHTML = "x" + zScale; 
        });

        // change visibility             
        document.getElementById("mode")!.addEventListener("change", (e) => {
            document.getElementById("oscilParams")!.style.display = 
                    this.mode == Mode.Osc || this.mode == Mode.Mon ? "inline" : "none";
            document.getElementById("recieverParams")!.style.display = 
                    this.mode == Mode.Rec ? "inline" : "none";
        });



        // params changed 
        document.getElementById("params")!.addEventListener("keydown", (e: KeyboardEvent) => {

            if (e.key == "Enter") {
                document.getElementById("zScale")!.focus();
                this.stop();
                const [size,  k,  loss] = getParams();
                
                if (this.space.size != size ) {
                    // new space
                    this.space = new Space(size, k, loss);
                    init2d(this.space.n);
                    init3d(this.space.n);
                    show(this.space);
                    return;
                }                                            
                if (this.space.k != k || this.space.loss != loss) {
                    // new params
                    this.space.k = k;
                    this.space.loss = loss;
                } else {
                    // just calm
                    this.space.calm();
                } 
                show(this.space);
            }
        });             

        // do one step
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
        if (this.mode == Mode.Inf) {
            infoElement.innerHTML = `E = ${this.space.energy()}`
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
        const scale = 2;
        let x0 = 0, y0 = 0, mousedown = false;

        canvas.addEventListener("mousedown", (e) => {
            x0 = e.offsetX;
            y0 = e.offsetY;
            mousedown = true;
        });


        canvas.addEventListener("mousemove", (e) => {
            const c0 = x0 / scale | 0;
            const r0 = y0 / scale | 0;            
            const c = e.offsetX / scale | 0;
            const r = e.offsetY / scale | 0;
            if (mousedown) {
                show(this.space);
                if (this.viewMode == ViewMode.Three) {
                    clearCanvas2d();
                } 
                if (this.mode == Mode.Del) {
                    grayRect2d(c0, r0, c, r);
                } else {
                    grayLine2d(c0, r0, c, r); 
                }
            }

            // show mouse position
            if (this.space.nodes[r][c]) {
                infoElement.innerHTML = `r:${r}, c:${c}, z:${this.space.nodes[r][c].z.toFixed(3)}`;                
            }

        });


        canvas.addEventListener("mouseup", (e: MouseEvent) => {
            const c0 = x0 / scale | 0;
            const r0 = y0 / scale | 0;
            const c1 = e.offsetX / scale | 0;
            const r1 = e.offsetY / scale | 0;
            mousedown = false;

            switch(this.mode) {
                case Mode.Osc: case Mode.Mon:
                    this.addOscillators(r0, c0, r1, c1); 
                    break;
                case Mode.Sto:
                    this.addBars(r0, c0, r1, c1);
                    break;
                case Mode.Rec:
                    const loss = getReceiverParams(); 
                    this.addReceivers(r0, c0, r1, c1, loss);
                    break;
                case Mode.Del:
                    this.space.DeleteInRect(r0, c0, r1, c1);
                    break;
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
        let [amp, q, vx] = getOscilParams();    //todo
        // просто точка
        if (c0 == c1 && r0 == r1) {
            let osc = this.mode == Mode.Osc ? 
                    new Oscillator(r0, c0, amp, q, this.space, vx) : 
                    new Mono(r0, c0, amp, q, this.space)
            this.space.addOscillator(osc);
            return;
        }
        // цикл по рядках
        if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
            if (r1 < r0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0]; 
            for (let r = r0; r <= r1; r += 2) {
                let c = (r - r0)*(c1 - c0)/(r1 - r0) + c0 | 0;
                let osc = this.mode == Mode.Osc ? 
                    new Oscillator(r, c, amp/2, q, this.space, vx) : 
                    new Mono(r, c, amp/2, q, this.space)
                this.space.addOscillator(osc);
            }
        // цикл по стовбцях
        } else {
            if (c1 < c0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0];             
            for (let c = c0; c <= c1; c += 2) {
                let r = (c - c0) * (r1 - r0) / (c1 - c0) + r0 | 0;
                let osc = this.mode == Mode.Osc ? 
                    new Oscillator(r, c, amp/2, q, this.space, vx) : 
                    new Mono(r, c, amp/2, q, this.space)
                this.space.addOscillator(osc);             
            }
        }
    }

    addReceivers(r0:number, c0:number, r1:number, c1: number, loss: number) 
    {
        // просто точка
        if (c0 == c1 && r0 == r1) {
            this.space.addReceiver(new Receiver(r0, c0, loss, this.space));
            return;
        }
        // цикл по рядках
        if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
            if (r1 < r0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0]; 
            for (let r = r0; r <= r1; r += 2) {
                let c = (r - r0) * (c1 - c0) / (r1 - r0) + c0 | 0;
                this.space.addReceiver(new Receiver(r, c, loss, this.space));
            }
        // цикл по стовбцях
        } else {
            if (c1 < c0)  
                [r0, r1, c0, c1] = [r1, r0, c1, c0];             
            for (let c = c0; c <= c1; c += 2) {
                let r = (c - c0) * (r1 - r0) / (c1 - c0) + r0 | 0;
                this.space.addReceiver(new Receiver(r, c, loss, this.space));
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

function getParams() {
    const el = (document.getElementById("params") as HTMLInputElement)!;
    let f;
    try {
        f = new Function("", 
            "let size, k, loss;" + 
            el.value + 
            "; return [size,  k,  loss]" 
        );
    } catch {
        el.style.backgroundColor = "pink";
        return [500, 0.49, 0]
    }

    const [size,  k,  loss] = f!();
    // params are OK  
    if (size != undefined &&  k != undefined && loss != undefined) {
        el.style.backgroundColor = "white";
        return [size,  k,  loss];
    }
    // params are wrong
    el.style.backgroundColor = "pink";
    return [500, 0.49, 0]
        
}

function getOscilParams() {
    const f = new Function("", 
        "let amp = 1,  q = 0.25, vx=1/2 ;" + 
        (document.getElementById("oscilParams") as HTMLInputElement)!.value +
        "; return [amp, q, vx]" );
    return f();
}

function getReceiverParams() {
    const f = new Function("", 
        "let loss = 0.5;" + 
        (document.getElementById("recieverParams") as HTMLInputElement)!.value +
        "; return loss" );
    return f();   
}


export function createSpace() {
    const [size,  k,  loss] = getParams();
    return new Space(size,  k,  loss);
}

