import Oscillator from "../models/oscillator.js";

class Node {
    z = 0
    v = 0
    stone = false;
}

export default class Space {
    k = 50     // жорсткість
    m = 100    // маса
    time = 0   // такти часу
    loss = 0.99  // коеф. втрат
    nodes: Node[][] = []
    oscillators: Oscillator[] = []

    zMax: number = 0;


    constructor(n: number, k: number, m: number, l: number) {
        this.k = k;
        this.m = m;
        this.loss = l;

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

    step() {
        let n = this.nodes.length;
        // швидкості
        for (let r = 1; r < n - 1; r++) {
            for (let c = 1; c < n - 1; c++) {
                let dz = this.nodes[r-1][c-1].z + this.nodes[r-1][c+1].z +
                         this.nodes[r+1][c-1].z + this.nodes[r+1][c+1].z -
                         4 * this.nodes[r][c].z;
                let a = (this.k / this.m) * dz;
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