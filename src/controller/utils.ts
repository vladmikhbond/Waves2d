import { Mono, Oscillator} from "../models/oscillator";
import Receiver from "../models/receiver";
import Space from "../models/space";
import { Node } from "../models/space";
 
export function takeFocusOff() {
    (<HTMLCanvasElement>document.getElementById("canvas")).focus();
}

// Зберігає поточний стан об'єкта space в форматі JSON.
export function sceneToJson(space: Space): string {
    const data = {
        size: space.size,
        k: space.k,
        loss: space.loss,
        oscillators: space.oscillators.map((osc) => ({
            type: osc instanceof Mono ? "Mono" : "Oscillator",
            amp: osc.amp,
            ph: osc.ph,
            dph: osc.dph,
            vx: osc.vx,
            c: osc.c,
            r: osc.r
        })),
        receivers: space.receivers.map((rec) => ({
            c: rec.c,
            r: rec.r,
            loss: rec.loss,
            energy: rec.energy,
        })),
    };

    return JSON.stringify(data, null, 2);
}

function restoreOscillator(data: any, space: Space): Oscillator | null {
    if (!data || typeof data !== "object") {
        return null;
    }

    const amp = Number(data.amp) || 0;
    const vx = Number(data.vx) || 0;
    const r = Number(data.r) || 0;
    const c = Number(data.c) || 0;
    let osc: Oscillator;

if (data.type === "Mono") {
        osc = new Mono(amp, 0, 0, r, c, space);
    } else {
        osc = new Oscillator(amp, 0, 0, vx, r, c, space);
    }

    if (typeof data.dph === "number") {
        osc.dph = data.dph;
    }
    if (typeof data.ph === "number") {
        osc.ph = data.ph;
    }
    osc.vx = vx;
    osc.r = r;
    osc.c = c;

    return osc;
}

// Відновлює стан об'єкта space з рядка json.
export function restoreSceneFromJson(json: string, space: Space): void {
    if (!json) {
        return;
    }

    let data: any;
    try {
        data = JSON.parse(json);
    } catch (error) {
        console.error("restoreSceneFromJson: invalid JSON", error);
        return;
    }

    if (!data || typeof data !== "object") {
        return;
    }

    if (typeof data.size === "number") {
        space.size = data.size;
    }

    if (typeof data.k === "number") {
        space.k = data.k;
    }
    space.time = 0;
    
    const N = space.size;

    

    // вузли з втратою
    space.nodes = new Array(N);
    for (let i = 0; i < N; i++) {
        space.nodes[i] = new Array(N);
        for (let j = 0; j < N; j++) {
            space.nodes[i][j] = new Node(data.loss);
        }
    }



    space.oscillators = [];
    if (Array.isArray(data.oscillators)) {
        for (const oscData of data.oscillators) {
            const osc = restoreOscillator(oscData, space);
            if (osc) {
                space.addOscillator(osc);
            }
        }
    }

    space.receivers = [];
    if (Array.isArray(data.receivers)) {
        for (const recData of data.receivers) {
            if (!recData || typeof recData !== "object") {
                continue;
            }
            const r = Number(recData.r) || 0;
            const c = Number(recData.c) || 0;
            const loss = Number(recData.loss) || 0;
            const receiver = new Receiver(r, c, loss, space);
            receiver.energy = Number(recData.energy) || 0;
            space.addReceiver(receiver);
        }
    }
}
