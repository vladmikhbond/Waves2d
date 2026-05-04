export default class Oscillator {
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
