export default class Oscillator {
      
    r = 0
    c = 0
    a = 0
    omega = 0 
    phase = 0
    dPhase = 0

    
    
    constructor(r: number, c: number, a: number, omega: number) {
        this.r = r;
        this.c = c;
        this.a = a;
        this.dPhase = 2 * Math.PI * omega;
    }
    
    next_z() {
        this.phase += this.dPhase;
        return Math.sin(this.phase) * this.a;
    }
}
