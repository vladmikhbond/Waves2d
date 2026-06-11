import Space from "./space.js";

export default class Receiver {

        r = 0
        c = 0
        loss = 0
        space: Space
        energy = 0    
        
        constructor(r: number, c: number, loss: number, space: Space) {
            this.r = r;
            this.c = c;
            this.loss = loss;
            this.space = space;
        }

        step() {
            const v = this.space.nodes[this.r][this.c].v;
            this.energy += v**2 * this.loss * (2 - this.loss)/2
        }
    
}