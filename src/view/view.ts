import Space from "../models/space.js";

const canvas = (document.getElementById("canvas") as HTMLCanvasElement)!;
const time = (document.getElementById("time") as HTMLSpanElement)!;




export function show(space: Space, n_vis: number ) {
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
