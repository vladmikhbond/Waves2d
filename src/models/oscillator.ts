import Space from "./space.js"

export class Oscillator {
      
    r = 0
    c = 0
    amp = 0
    ph = 0
    dph = 0
    space: Space
    vx = 0

    constructor(r: number, c: number, a: number, q: number, space: Space, vx = 0) {
        this.r = r;
        this.c = c;
        this.amp = a;
        this.space = space; 
        let v = Math.sqrt(space.k);
        this.dph = q * v;
        this.ph = -this.dph;
        this.vx = vx ? 1/vx | 0 : 0;
    }
    
    next_s() {
        this.ph += this.dph;
        return Math.sin(this.ph) * this.amp;
    }
}

export class Mono extends Oscillator {
    
    constructor(r: number, c: number, a: number, q: number, space: Space) {
        super(r, c, a, q, space);
        this.ph = -Math.PI/2 -this.dph;
    }

     
    next_s() {
        if (this.ph > 1.5 * Math.PI) {
            this.killself()
        }
        this.ph += this.dph;
        return -(Math.sin(this.ph) + 1) * this.amp / 2;
    }

    killself() {
        let idx = this.space.oscillators.indexOf(this);
        if (idx != -1) {
            this.space.oscillators.splice(idx, 1);
        }
    }
}

