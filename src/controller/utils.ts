import { Mono, Oscillator } from "../models/oscillator";
import Receiver from "../models/receiver";
import Space from "../models/space";
import { Node } from "../models/space";
import Bar from "../models/bar";
 
export function takeFocusOff() {
    (<HTMLCanvasElement>document.getElementById("canvas")).focus();
}



interface SceneOscillator {
    r: number;
    c: number;
    amp: number;
    ph: number;
    dph: number;
    vx: number;
    type: "Oscillator" | "Mono";
}

interface SceneReceiver {
    r: number;
    c: number;
    loss: number;
    energy: number;
}

interface SceneBar {
    r1: number;
    c1: number;
    r2: number;
    c2: number;
}

interface SceneState {
    size: number;
    k: number;
    time: number;

    oscillators: SceneOscillator[];
    receivers: SceneReceiver[];
    bars: SceneBar[];
}

// Зберігає поточний стан об'єкта space в форматі JSON.
export function sceneToJson(space: Space): string {
    const scene: SceneState = {
        size: space.size,
        k: space.k,
        time: space.time,
        oscillators: space.oscillators.map(osc => ({
            r: osc.r,
            c: osc.c,
            amp: osc.amp,
            ph: osc.ph,
            dph: osc.dph,
            vx: osc.vx,
            type: osc instanceof Mono ? "Mono" : "Oscillator"
        })),
        receivers: space.receivers.map(rec => ({
            r: rec.r,
            c: rec.c,
            loss: rec.loss,
            energy: rec.energy
        })),
        bars: space.bars.map(bar => ({
            r1: bar.r1,
            c1: bar.c1,
            r2: bar.r2,
            c2: bar.c2
        }))
    };

    return JSON.stringify(scene, null, 2);
}

function isSceneState(value: any): value is SceneState {
    return value
        && typeof value.size === "number"
        && typeof value.k === "number"
        && typeof value.time === "number"
        && Array.isArray(value.nodes)
        && Array.isArray(value.oscillators)
        && Array.isArray(value.receivers)
        && Array.isArray(value.bars);
}

// Відновлює стан об'єкта space з рядка json.
export function restoreSceneFromJson(json: string, space: Space): void {
    if (!json) {
        return;
    }

    let scene: SceneState;
    try {
        scene = JSON.parse(json);
    } catch {
        return;
    }

    if (!isSceneState(scene)) {
        return;
    }

    space.size = scene.size;
    space.k = scene.k;
    space.time = scene.time;


    // вузли з втратою
    space.nodes = new Array(space.size);
    for (let i = 0; i < space.size; i++) {
        space.nodes[i] = new Array(space.size);
        for (let j = 0; j < space.size; j++) {
            space.nodes[i][j] = new Node(0);         ///////////////
        }
    }

    space.bars = scene.bars.map(bar => new Bar(bar.r1, bar.c1, bar.r2, bar.c2));
    space.throwStones();

    space.oscillators = [];
    for (const oscData of scene.oscillators) {
        const oscillator = oscData.type === "Mono"
            ? new Mono(oscData.r, oscData.c, oscData.amp, 0, 0, space)
            : new Oscillator(oscData.r, oscData.c, oscData.amp, 0, 0, oscData.vx, space);
        oscillator.ph = oscData.ph;
        oscillator.dph = oscData.dph;
        space.oscillators.push(oscillator);
    }

    space.receivers = [];
    for (const receiverData of scene.receivers) {
        const receiver = new Receiver(receiverData.r, receiverData.c, receiverData.loss, space);
        receiver.energy = receiverData.energy;
        space.receivers.push(receiver);
    }
}
