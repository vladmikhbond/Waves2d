import Controller from "./controller/controller.js";

export const size = 500;      // work area
export const margin = 200;    // margin

new Controller();

// показує розмір простору
document.getElementById("params")!.innerHTML = `${size}/${margin}`