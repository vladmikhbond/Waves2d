import Space from "../models/space.js";
import { zScale } from "../controller/controller.js";   

let canvas2d: HTMLCanvasElement;
let time: HTMLSpanElement;

let ctx: CanvasRenderingContext2D;
let iData: ImageData;
let data: ImageDataArray;

export function init2d(n: number) {
    canvas2d = (document.getElementById("canvas2d") as HTMLCanvasElement)!;
    canvas2d.width = canvas2d.height = n;
    canvas2d.style.width = canvas2d.style.height = `${2*n}px`;

    time = (document.getElementById("time") as HTMLSpanElement)!;

    ctx = canvas2d.getContext("2d")!;
    iData = ctx.getImageData(0, 0, canvas2d.width, canvas2d.height);
    data = iData.data 

    // fill the blue channel
    for (let y = 0; y < canvas2d.height; y++) {
        for (let x = 0; x < canvas2d.width; x++) {
            color(x, y, 255, 2); // b
        }
    }
    ctx.putImageData(iData, 0, 0);
}




// 
function color(x: number, y: number, depth: number, channel: number) {
    let i1 = (y * canvas2d.width + x) * 4 + channel;
    let i2 = i1 + 4;
    let i3 = i1 + canvas2d.width * 4;
    let i4 = i3 + 4;
    data[i1] = data[i2] = data[i3] = data[i4] = depth;
}


export function show2d(space: Space) 
{
    // Draw nodes as ImageData
    for (let r = 0; r < space.n; r++) {
        for (let c = 0; c < space.n; c++) {
            let x = c;
            let y = r;
            let level = 127 + 127 * zScale * space.nodes[r][c].z | 0;
            if (level > 255) 
                level = 255;
            if (level < 0) 
                level = 0;
            color(x, y, level, 3);

            if (space.nodes[r][c].is_stone) {
                color(x, y, 0, 3);
                color(x+1, y, 0, 3);
                color(x, y+1, 0, 3);
                color(x+1, y+1, 0, 3);
            }
        }
    }
    ctx.putImageData(iData, 0, 0);
    
    // draw oscillators
    for (let o of space.oscillators) {
        let x = o.c;
        let y = o.r;
        ctx.fillStyle = "red";
        ctx.fillRect(x-1.5, y-1.5, 3, 3);
    }
    // draw receivers
    for (let o of space.receivers) {
        let x = o.c;
        let y = o.r;
        ctx.fillStyle = "black";
        ctx.fillRect(x-1.5, y-1.5, 3, 3);
    }

    //
    time.innerHTML = space.time.toString()
}

// in canvas coords
export function grayLine2d(x1: number, y1: number, x2: number, y2: number) {
    ctx.strokeStyle = "lightgray";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}


export function grayRect2d(x1: number, y1: number, x2: number, y2: number) {
    ctx.strokeStyle = "lightgray";
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
}



export function clearCanvas2d() {
    ctx.clearRect(0, 0, canvas2d.width, canvas2d.height);
}

