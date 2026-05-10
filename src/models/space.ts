import Oscillator from "../models/oscillator.js";
import Bar from "../models/bar.js";

export class Node {
    z = 0
    v = 0
    l = 0
    stone = false;

    constructor(loss: number) {
        this.l = loss;
    }
}

export default class Space 
{
    k_m = 50/100    // жорсткість / маса
    time = 0        // такти часу

    nodes: Node[][] = []
    oscillators: Oscillator[] = []
    bars: Bar[] = []


    constructor(n: number, n_vis:number, k_m: number, loss: number) {
        this.k_m = k_m;
        // вузли 
        this.nodes = new Array(n);
        for (let i = 0; i < n; i++) {
            this.nodes[i] = new Array(n);
            for (let j = 0; j < n; j++) {
                this.nodes[i][j] = new Node(loss);
            }
        }
        // поглиначі
        const len = (n - n_vis) / 2, d = 0.1/len;
        for (let i = 0; i < len; i++) {
            frame(this, i, 0.1 * i / len)             
        }

        function frame(me: Space, no: number, loss: number) {
            for (let i = no; i < n - no; i++) {
                me.nodes[no][i].l = loss;
                me.nodes[n - no - 1][i].l = loss;
                me.nodes[i][no].l = loss;
                me.nodes[i][n - no - 1].l = loss;   
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

    throwStones() {
        let n = this.nodes.length;

        for (let r = 0; r < n - 1; r++) {
            for (let c = 0; c < n - 1; c++) {
                this.nodes[r][c].stone = false
            }
        }

        for (let bar of this.bars) {
            let c1 = bar.c1, c0 = bar.c2, r1 = bar.r1, r0 = bar.r2;
            if (Math.abs(c1 - c0) < Math.abs(r1 - r0)) {
                if (r1 < r0)
                    [r0, r1, c0, c1] = [r1, r0, c1, c0];
                for (let r = r0; r <= r1; r++) {
                    let c = (r - r0) * (c1 - c0) / (r1 - r0) + c0 | 0;
                    this.nodes[r][c].stone = true;
                }
            } else {
                if (c1 < c0)
                    [r0, r1, c0, c1] = [r1, r0, c1, c0];
                for (let c = c0; c <= c1; c++) {
                    let r = (c - c0) * (r1 - r0) / (c1 - c0) + r0 | 0;
                    this.nodes[r][c].stone = true;
                }
            }
        }
    }

    step() {
        let n = this.nodes.length;
        // швидкості
        for (let r = 1; r < n - 1; r++) {
            for (let c = 1; c < n - 1; c++) {
                let dz = this.nodes[r-1][c].z + this.nodes[r+1][c].z +
                         this.nodes[r][c-1].z + this.nodes[r][c+1].z -
                         4 * this.nodes[r][c].z;
                let a = this.k_m * dz;
                this.nodes[r][c].v += a;
                // втрати
                this.nodes[r][c].v *= (1 - this.nodes[r][c].l);
            }
        }
        // вузли
        for (let r = 1; r < n - 1; r++) {
            for (let c = 1; c < n - 1; c++) {
                this.nodes[r][c].z += this.nodes[r][c].v;
                if (this.nodes[r][c].stone) 
                    this.nodes[r][c].z = 0;
            }
        }
        // осцилятори
        for (let o of this.oscillators) {
            this.nodes[o.r][o.c].z = o.next_z();
        }
    
        // час 
        this.time++;
    }

}