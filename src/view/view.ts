import Space from "../models/space.js";
import { zScale } from "../controller/controller.js";   

const canvas = (document.getElementById("canvas") as HTMLCanvasElement)!;
const time = (document.getElementById("time") as HTMLSpanElement)!;

const ctx = canvas.getContext("2d")!;
const iData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = iData.data 



// fill the blue channel
for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
        color(x, y, 255, 2); // b
    }
}
ctx.putImageData(iData, 0, 0);

// 
function color(x: number, y: number, depth: number, channel: number) {
    let i1 = (y * canvas.width + x) * 4 + channel;
    let i2 = i1 + 4;
    let i3 = i1 + canvas.width * 4;
    let i4 = i3 + 4;
    data[i1] = data[i2] = data[i3] = data[i4] = depth;
}


export function show(space: Space, n_vis: number ) {
    // draw nodes as ImageData
    const n = space.nodes.length;
    let beg = (n - n_vis) / 2, end = (n + n_vis) / 2;

    for (let r = beg; r < end; r++) {
        for (let c = beg; c < end; c++) {
            let x = c - beg;
            let y = r - beg;
            let level =  127 + 127 * zScale * space.nodes[r][c].z | 0;
            if (level > 255) level = 255;
            if (level < 0) level = 0;
            color(x, y, level, 3);

            if (space.nodes[r][c].stone) {
                color(x, y, 0, 3);
            }
        }
    }
    ctx.putImageData(iData, 0, 0);
    
    // draw oscillators
    for (let o of space.oscillators) {
        let x = o.c - beg;
        let y = o.r - beg;
        ctx.fillStyle = "red";
        ctx.fillRect(x-1, y-1, 3, 3);
    }
    //
    time.innerHTML = space.time.toString()
}

// in canvas coords
export function grayLine(x1: number, y1: number, x2: number, y2: number) {
    ctx.strokeStyle = "lightgray";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
