import {Oscillator} from "../models/oscillator.js";
import Receiver from "../models/receiver.js";
import Bar from "../models/bar.js";

export class Node {
    z = 0
    v = 0
    l = 0
    is_stone = false;

    constructor(loss: number) {
        this.l = loss;
    }
}

export default class Space 
{
    size: number 

    k = 0         
    time = 0      // такти часу

    nodes: Node[][] = []
    oscillators: Oscillator[] = []
    receivers: Receiver[] = []
    bars: Bar[] = []

    get n() {
        return this.size;
    }

    constructor(size: number, k_m: number, loss: number) {
        
        this.size = size; 

        this.k = k_m;
        // вузли з втратою
        this.nodes = new Array(this.n);
        for (let i = 0; i < this.n; i++) {
            this.nodes[i] = new Array(this.n);
            for (let j = 0; j < this.n; j++) {
                this.nodes[i][j] = new Node(loss);
            }
        }

    }

    getOscillatorAt(r: number, c: number): Oscillator | null
    {
        for (const osc of this.oscillators) {
            if (Math.abs(osc.r - r) < 3 && Math.abs(osc.c - c) < 3) {
                return osc;
            }
        }
        return null;
    }

    getReceiverAt(r: number, c: number): Receiver | null
    {
        for (const rec of this.receivers) {
            if (Math.abs(rec.r - r) < 3 && Math.abs(rec.c - c) < 3) {
                return rec;
            }
        }
        return null;
    }

    addOscillator(osc: Oscillator) {
        this.oscillators.push(osc);
    }

    addReceiver(rec: Receiver) {
        this.receivers.push(rec);
        // встановлює коеф втрат у вузлі
        this.nodes[rec.r][rec.c].l = rec.loss; 
    }

    remReceiver(rec: Receiver) {
        const idx = this.receivers.indexOf(rec);
        if (idx != -1) {
            this.receivers.splice(idx, 1);
            // повертає коеф втрат у вузлі
            this.nodes[rec.r][rec.c].l = this.loss; 
        }
    }


    addBar(bar: Bar) {
        this.bars.push(bar);
        this.throwStones();
    }

    DeleteInRect(r1: number, c1: number, r2: number, c2: number) {
        this.bars = this.bars.filter(b => !(
                r1 < b.r1 && b.r1 < r2 &&     
                c1 < b.c1 && b.c1 < c2 &&     
                r1 < b.r2 && b.r2 < r2 &&     
                c1 < b.c2 && b.c2 < c2 )); 

        this.oscillators = this.oscillators.filter(o => !(
                r1 < o.r && o.r < r2 &&     
                c1 < o.c && o.c < c2));  
        
        const receiversToRemove = this.receivers.filter(o => 
                r1 < o.r && o.r < r2 &&     
                c1 < o.c && o.c < c2); 
        for (const rec of receiversToRemove) {
            this.remReceiver(rec);
        }

        this.throwStones();
    } 

    throwStones() {
        for (let r = 0; r < this.n - 1; r++) {
            for (let c = 0; c < this.n - 1; c++) {
                this.nodes[r][c].is_stone = false
            }
        }

        for (let bar of this.bars) {
            let c1 = bar.c1, c0 = bar.c2, r1 = bar.r1, r0 = bar.r2;
            if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
                if (r1 < r0)
                    [r0, r1, c0, c1] = [r1, r0, c1, c0];
                for (let r = r0; r <= r1; r++) {
                    let c = (r - r0) * (c1 - c0) / (r1 - r0) + c0 | 0;
                    this.nodes[r][c].is_stone = true;
                }
            } else {
                if (c1 < c0)
                    [r0, r1, c0, c1] = [r1, r0, c1, c0];
                for (let c = c0; c <= c1; c++) {
                    let r = (c - c0) * (r1 - r0) / (c1 - c0) + r0 | 0;
                    this.nodes[r][c].is_stone = true;
                }
            }
        }
    }

    step() {
        const n = this.size;
        // швидкості
        for (let r = 1; r < n - 1; r++) {
            for (let c = 1; c < n - 1; c++) {
                let z = this.nodes[r-1][c].z + this.nodes[r+1][c].z +
                        this.nodes[r][c-1].z + this.nodes[r][c+1].z -
                        4 * this.nodes[r][c].z;
                let a = this.k * z;
                this.nodes[r][c].v += a;
                // втрати
                this.nodes[r][c].v *= (1 - this.nodes[r][c].l);
            }
        }

        // Випромінювачі
        let vPhase = Math.sqrt(this.k);        
        // лівий і правий стовбці
        let cL = 1;
        let cR = this.size - 2;
        for (let r = 1; r < n - 1; r++) {
            this.nodes[r][cL].v = -vPhase * (this.nodes[r][cL].z - this.nodes[r][cL + 1].z);
            this.nodes[r][cR].v = -vPhase * (this.nodes[r][cR].z - this.nodes[r][cR - 1].z);
        }        
        // верхній і нижній рядки
        let rU = 1;
        let rL = this.size - 2;
        for (let c = 1; c < n - 1; c++) {
            this.nodes[rU][c].v = -vPhase * (this.nodes[rU][c].z - this.nodes[rU + 1][c].z);
            this.nodes[rL][c].v = -vPhase * (this.nodes[rL][c].z - this.nodes[rL - 1][c].z);
        }
        
        // відхилення
        for (let r = 1; r < n - 1; r++) {
            for (let c = 1; c < n - 1; c++) {               
                if (!this.nodes[r][c].is_stone) 
                    this.nodes[r][c].z += this.nodes[r][c].v;
            }
        }
        // осцилятори
        for (let osc of this.oscillators) {
            this.nodes[osc.r][osc.c].z = osc.next_s();
        }

        // приймачі
        for (let rec of this.receivers) {
            rec.step();
        }

        // Рух осциляторів        
        for (let o of this.oscillators) {
            if (o.vx && this.time % o.vx == 0) {
                this.nodes[o.r][o.c].v = (
                    this.nodes[o.r][o.c-1].v + this.nodes[o.r][o.c + 1].v +
                    this.nodes[o.r - 1][o.c].v + this.nodes[o.r + 1][o.c].v) / 4;
                this.nodes[o.r][o.c].z = (
                    this.nodes[o.r][o.c-1].z + this.nodes[o.r][o.c + 1].z +
                    this.nodes[o.r - 1][o.c].z + this.nodes[o.r + 1][o.c].z) / 4;
                if (o.vx > 0) o.c++;
                if (o.vx < 0) o.c--;
            }
        }

        // час 
        this.time++;        
    }

    set loss(l: number) {
        const beg = 0, end = beg + this.size;
        for(let r = beg; r < end; r++) {
            for(let c = beg; c < end; c++) {
                 this.nodes[r][c].l = l; 
            }
        }

    }

    get loss() {
        let i = this.nodes.length / 2 | 0;
        return this.nodes[i][i].l;
    }

    // заспокоює хвилі
    calm() {
        const n = this.size;
        // швидкості
        for (let r = 1; r < this.n - 1; r++) {
            for (let c = 1; c < this.n - 1; c++) {
                this.nodes[r][c].z = 0;
                this.nodes[r][c].v = 0;
            }
        }
        // осцилятори
        for (let o of this.oscillators) {
            o.ph = -Math.PI/2 -o.dph;
        }
        // твймер
        this.time = 0;
    }

    energy() {
        const n = this.size;
        let e = 0;
        // швидкості
        for (let r = 1; r < n - 1; r++) {
            for (let c = 1; c < n - 1; c++) {
                e += this.nodes[r][c].v ** 2;
            }
        }
        for (let r = 1; r < n - 2; r++) {
            for (let c = 1; c < n - 2; c++) {
                e += (this.nodes[r][c+1].z - this.nodes[r][c].z)**2 + 
                     (this.nodes[r+1][c].z - this.nodes[r][c].z)**2;
            }
        }
        return e / 2;
    }
}