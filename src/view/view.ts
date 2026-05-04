import Space from "../models/space.js";

const canvas = (document.getElementById("canvas") as HTMLCanvasElement)!;
const time = (document.getElementById("time") as HTMLSpanElement)!;

const ctx = canvas.getContext("2d")!;
const iData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = iData.data 
let kz = 50;

for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
        col(x, y, 255, 2); // b
    }
}
ctx.putImageData(iData, 0, 0);

function col(x: number, y: number, level: number, shift: number) {
    let ir1 = (y * canvas.width + x) * 4 + shift;
    let ir2 = ir1 + 4;
    let ir3 = ir1 + canvas.width * 4;
    let ir4 = ir3 + 4;
    data[ir1] = data[ir2] = data[ir3] = data[ir4] = level;
}


export function show(space: Space, n_vis: number ) {
    const n = space.nodes.length;
    let beg = (n - n_vis) / 2, end = (n + n_vis) / 2;

    for (let r = beg; r < end; r++) {
        for (let c = beg; c < end; c++) {
            let x = c - beg;
            let y = r - beg;
            let level =  127 + 127 * kz * space.nodes[r][c].z | 0;
            if (level > 255) level = 255;
            if (level < 0) level = 0;
            col(x, y, level, 3);
        }
    }
    ctx.putImageData(iData, 0, 0);
    //
    time.innerHTML = space.time.toString()
}


