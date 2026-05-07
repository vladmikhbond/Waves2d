import * as THREE from "three";
import Space from "../models/space.js";
import { zScale } from "../controller/controller.js";

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const time = document.getElementById("time") as HTMLSpanElement;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(canvas.width, canvas.height, false);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101020);


const camera = new THREE.PerspectiveCamera(28, canvas.width / canvas.height, 0.1, 5000);
camera.position.set(0, 1000, 0);
camera.lookAt(0, 0, 0);

const ambientLight = new THREE.AmbientLight(0x808080, 1.0);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(1, -2, 2);
scene.add(ambientLight, directionalLight);

let mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | null = null;
let positions: Float32Array | null = null;
let nVisCurrent = 0;

const oscGroup = new THREE.Group();
scene.add(oscGroup);

function createGrid(n_vis: number) {
    const geometry = new THREE.PlaneGeometry(n_vis, n_vis, n_vis - 1, n_vis - 1);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
        color: 0x4682b4,
        wireframe: false,
        side: THREE.DoubleSide,
        metalness: 0.2,
        roughness: 0.8,
        flatShading: false,
    });

    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    scene.add(mesh);

    positions = geometry.attributes.position.array as Float32Array;
    nVisCurrent = n_vis;
}

function updateSurface(space: Space, n_vis: number) {
    const n = space.nodes.length;
    const beg = (n - n_vis) / 2 | 0;
    const scaleY = Math.max(0.001, zScale);

    if (!mesh || nVisCurrent !== n_vis) {
        if (mesh) scene.remove(mesh);
        createGrid(n_vis);
    }

    if (!positions || !mesh) return;

    const rowSize = n_vis;
    for (let r = 0; r < n_vis; r++) {
        for (let c = 0; c < n_vis; c++) {
            const node = space.nodes[beg + r][beg + c];
            const idx = 3 * (r * rowSize + c);
            positions[idx + 1] = node.z * scaleY;
        }
    }

    const geometry = mesh.geometry as THREE.BufferGeometry;
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
}

function updateOscillators(space: Space, n_vis: number) {
    const n = space.nodes.length;
    const beg = (n - n_vis) / 2 | 0;
    oscGroup.clear();

    const sphereGeom = new THREE.SphereGeometry(Math.max(0.5, n_vis * 0.002), 10, 10);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0x330000 });

    for (const o of space.oscillators) {
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        sphere.position.set(o.c - beg - n_vis / 2 + 0.5, 0, o.r - beg - n_vis / 2 + 0.5);
        oscGroup.add(sphere);
    }
}


export function show(space: Space, n_vis: number) {
    updateSurface(space, n_vis);
    // updateOscillators(space, n_vis);
    renderer.render(scene, camera);
    time.textContent = space.time.toString();
}

// in canvas coords
export function grayLine(_x1: number, _y1: number, _x2: number, _y2: number) {
    // 3D renderer uses the same canvas, so 2D overlay drawing is disabled.
}