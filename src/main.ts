import Controller from "./controller/controller.js";

export const size = 500;      // work area
export const margin = 200;    // margin

const canvas2d = (document.getElementById("canvas2d") as HTMLCanvasElement)!;
const canvas3d = (document.getElementById("canvas3d") as HTMLCanvasElement)!;
canvas2d.width = canvas3d.width =  size + 2 * margin;
canvas2d.height = canvas3d.height = size + 2 * margin;

new Controller();
