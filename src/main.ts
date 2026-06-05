import Controller from "./controller/controller.js";

export const size = 600;    // work area
export const margin = 0;    // margin

new Controller();

// показує розмір простору
document.getElementById("params")!.innerHTML = `${size}/${margin}`