import {Oscillator} from "../models/oscillator.js";
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
    margin: number

    k = 0         
    time = 0      // такти часу

    nodes: Node[][] = []
    oscillators: Oscillator[]
    bars: Bar[];

    get n() {
        return this.size + 2 * this.margin;
    }

    constructor(size: number, k_m: number, loss: number) {
        
        this.size = size;
        this.margin = 0; 
        this.oscillators = [];
        this.bars = [];

        this.k = k_m;
        // вузли з втратою
        this.nodes = new Array(this.n);
        for (let i = 0; i < this.n; i++) {
            this.nodes[i] = new Array(this.n);
            for (let j = 0; j < this.n; j++) {
                this.nodes[i][j] = new Node(loss);
            }
        }
        // поглиначі
        const len = this.margin, d = 0.1/len/len;
        for (let i = 0; i < len; i++) {
            frame(this, i, d * i * i )             
        }

        function frame(me: Space, no: number, loss: number) {
            for (let i = no; i < me.n - no; i++) {
                me.nodes[no][i].l = loss;
                me.nodes[me.n - no - 1][i].l = loss;
                me.nodes[i][no].l = loss;
                me.nodes[i][me.n - no - 1].l = loss;   
            }
        }

    }

    addOscillator(osc: Oscillator) {
        this.oscillators.push(osc);
    }

    removeOscillator(r: number, c: number) {
        const eps = 4;
        for (let i = 0; i < this.oscillators.length; i++) {
            let o = this.oscillators[i];
            if (Math.hypot(o.c - c, o.r - r) <= eps) {
                this.oscillators.splice(i, 1);
            }
        }
    }

    addBar(bar: Bar) {
        this.bars.push(bar);
        this.throwStones();
    }

    removeBar(r1: number, c1: number, r2: number, c2: number) {
        const eps = 4;
        for (let i = 0; i < this.bars.length; i++) {
            const bar = this.bars[i];
            if (Math.hypot(bar.c2 - c1, bar.r2 - r1) <= eps && Math.hypot(bar.c1 - c2, bar.r1 - r2) <= eps || 
                Math.hypot(bar.c2 - c2, bar.r2 - r2) <= eps && Math.hypot(bar.c1 - c1, bar.r1 - r1) <= eps ) {
                this.bars.splice(i, 1);
                this.throwStones();
                break;
            }
        }   
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
        const n = this.n;
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
        let cL = this.margin + 1;
        let cR = this.size + this.margin - 2;
        for (let r = 1; r < n - 1; r++) {
            this.nodes[r][cL].v = -vPhase * (this.nodes[r][cL].z - this.nodes[r][cL + 1].z);
            this.nodes[r][cR].v = -vPhase * (this.nodes[r][cR].z - this.nodes[r][cR - 1].z);
        }        
        // верхній і нижній рядки
        let rU = this.margin + 1;
        let rL = this.size + this.margin - 2;
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
        for (let o of this.oscillators) {
            this.nodes[o.r][o.c].z = o.next_s();
        }
    
        // час 
        this.time++;


        // if (this.time % 5 == 0) {
        //     for (let o of this.oscillators) {
        //         o.c++;
        //     }
        // }
    }

    set loss(l: number) {
        const beg = this.margin, end = beg + this.size;
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

    calm() {
        const n = this.n;
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
    }
}