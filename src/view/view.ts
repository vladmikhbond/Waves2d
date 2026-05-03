import Space from "../models/space.js";

const canvas = (document.getElementById("canvas") as HTMLCanvasElement)!;
const time = (document.getElementById("time") as HTMLSpanElement)!;

const ctx = canvas.getContext("2d")!;
const iData = ctx.getImageData(0, 0, canvas.width, canvas.height);
const data = iData.data 
// data.fill(0);

for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
        col(x, y, 0, 0); // r
        col(x, y, 0, 1); // g
        col(x, y, 0, 2); // b
        col(x, y, 255, 3); // a
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
    const n = space.nodes.length


    let beg = (n - n_vis) / 2, end = (n + n_vis) / 2;

    for (let r = beg; r < end; r++) {
        for (let c = beg; c < end; c++) {
            let x = c - beg;
            let y = r - beg;
            let level =  127 + (500 * space.nodes[r][c].z) | 0;
            if (level > 255) level = 255;
            if (level < 0) level = 0;
            
            for (let c of [0, 1, 2]) {
                col(x, y, level, c);
            }

        }
    }
    ctx.putImageData(iData, 0, 0);
    //
    time.innerHTML = space.time.toString()
}


export function show_old(space: Space, n_vis: number ) {
    const ctx = canvas.getContext("2d")!;
    const n = space.nodes.length

    const krc = canvas.width / n_vis
    const kz = 300;
    const b = canvas.height / 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // coords
    ctx.beginPath();
    ctx.strokeStyle = "gray"
    ctx.moveTo(0, b); ctx.lineTo(canvas.width, b);    // Ox
    ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);  // Oy
    ctx.stroke();

    // vawes
    ctx.beginPath();
    ctx.strokeStyle = "red"
    for (let i = (n - n_vis) / 2 ; i < (n + n_vis) / 2; i++) {
        for (let j = (n - n_vis) / 2 ; j < (n + n_vis) / 2; j++) {
            let x = (i - (n - n_vis) / 2) * krc;
            let y = (j - (n - n_vis) / 2) * krc;
            if (space.nodes[i][j].z > 0) {
                ctx.strokeRect(x, y, 1, 1);
            }
        }
    }
    ctx.stroke();
    time.innerHTML = space.time.toString()
}
