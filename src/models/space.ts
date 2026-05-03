class Node {
    z: number = 0
    v: number  = 0
}

class Oscillator {
    a = 0    
    t = 0
    r = 0
    c = 0
    dt = 2 * Math.PI * 0.1
    
    constructor(r: number, c: number, a: number) {
        this.r = r;
        this.c = c;
        this.a = a;
    }
    
    next_z() {
        this.t += this.dt ;
        return Math.sin(this.t) * this.a;
    }
}


export default class Space {
    k = 0  // жорсткість
    m = 0  // маса
    time = 0  // такти часу
    loss = 0.99  // коеф. втрат
    nodes: Node[][] = []
    oscillators: Oscillator[] = []
    zMin: number = 0;
    zMax: number = 0;
    zMid: number = 0;

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
        
        // осцилятори
        this.oscillators.push(new Oscillator(n/2, n/2, 1));
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
        // амплітуди
        this.zMax = this.zMin = this.nodes[0][0].z;
        this.zMid = 0;
        for (let r = 1; r < n - 1; r++) {
            for (let c = 1; c < n - 1; c++) {
                this.nodes[r][c].z += this.nodes[r][c].v;
                if (this.nodes[r][c].z > this.zMax) this.zMax = this.nodes[r][c].z;
                if (this.nodes[r][c].z < this.zMin) this.zMin = this.nodes[r][c].z;
                this.zMid += this.nodes[r][c].z;
            }
        }
        this.zMid /= n*n

        // осцилятори
        for (let o of this.oscillators) {
            this.nodes[o.r][o.c].z = o.next_z();
        }
    

        this.time++;
    }

}