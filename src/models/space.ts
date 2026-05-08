import Oscillator from "../models/oscillator.js";
import Bar from "../models/bar.js";

export class Node {
    z = 0
    v = 0
    stone = false;
}

export default class Space 
{
    k_m = 50/100    // жорсткість / маса
    time = 0        // такти часу
    loss = 0.99     // коеф. втрат
    nodes: Node[][] = []
    oscillators: Oscillator[] = []
    bars: Bar[] = []

    zMax: number = 0;


    constructor(n: number, k_m: number, loss: number) {
        this.k_m = k_m;
        this.loss = loss;
        this.nodes = new Array(n);
        for (let i = 0; i < n; i++) {
            this.nodes[i] = new Array(n);
            for (let j = 0; j < n; j++) {
                this.nodes[i][j] = new Node();
            }
        }
    }

    addOscillator(osc: Oscillator) {
        this.oscillators.push(osc);
        if (this.zMax < osc.a) this.zMax = osc.a;
    }

    removeOscillatorAt(r: number, c: number) {
        for (let i = 0; i < this.oscillators.length; i++) {
            let o = this.oscillators[i];
            if (Math.hypot(o.c - c, o.r - r) <= 4) {
                this.oscillators.splice(i, 1);
            }
        }
    }

    removeBar(r0: number, c0: number, r1: number, c1: number) {
        for (let i = 0; i < this.bars.length; i++) {
            const b = this.bars[i];
            const sameDirect = b.r1 === r0 && b.c1 === c0 && b.r2 === r1 && b.c2 === c1;
            const sameReverse = b.r1 === r1 && b.c1 === c1 && b.r2 === r0 && b.c2 === c0;
            if (sameDirect || sameReverse) {
                this.bars.splice(i, 1);
                break;
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
                this.nodes[r][c].v *= this.loss;
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