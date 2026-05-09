import * as THREE from "three";
import Space from "../models/space.js";
import { zScale } from "../controller/controller.js";

let canvas3d: HTMLCanvasElement;
let time: HTMLSpanElement;
let renderer: THREE.WebGLRenderer;
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let ambientLight: THREE.AmbientLight;
let directionalLight: THREE.DirectionalLight; 
let mesh: THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> | null = null;
let positions: Float32Array | null = null;
let nVisCurrent = 0;
let oscGroup: THREE.Group;
let barsGroup: THREE.Group;
const barGeometry = new THREE.CylinderGeometry(3, 3, 1, 16);
const barMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.7 });

export function init3d() {
    canvas3d = document.getElementById("canvas3d") as HTMLCanvasElement;
    time = document.getElementById("time") as HTMLSpanElement;
    renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvas3d.width, canvas3d.height, false);
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    camera = new THREE.PerspectiveCamera(28, canvas3d.width / canvas3d.height, 0.1, 5000);
    camera.position.set(0, -1000, 0);
    camera.lookAt(0, 0, 0);

    ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1, -2, 2);
    
    scene.add(ambientLight, directionalLight);

    mesh = null;
    positions = null;
    nVisCurrent = 0;

    oscGroup = new THREE.Group();
    barsGroup = new THREE.Group();
    scene.add(oscGroup);
    scene.add(barsGroup);
}


function createBarMesh(start: THREE.Vector3, end: THREE.Vector3) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const bar = new THREE.Mesh(barGeometry, barMaterial);
    if (length > 0) {
        bar.scale.set(1, length, 1);
        bar.position.copy(start).add(end).multiplyScalar(0.5);
        bar.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    } else {
        bar.position.copy(start);
    }
    return bar;
}

function createGrid(n_vis: number) {
    const geometry = new THREE.PlaneGeometry(n_vis, n_vis, n_vis - 1, n_vis - 1);
    geometry.rotateX(Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
        color: 0x00BFFF,
        wireframe: false,
        side: THREE.DoubleSide,
        metalness: 0.3,
        roughness: 0.5,
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
    const scaleY = zScale;

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

function updateBars(space: Space, n_vis: number) {
    const n = space.nodes.length;
    const beg = (n - n_vis) / 2 | 0;
    barsGroup.clear();

    for (const b of space.bars) {
        const x1 = b.c1 - beg - n_vis / 2 + 0.5;
        const z1 = -(b.r1 - beg - n_vis / 2 + 0.5);
        const x2 = b.c2 - beg - n_vis / 2 + 0.5;
        const z2 = -(b.r2 - beg - n_vis / 2 + 0.5);

        const start = new THREE.Vector3(x1, 0, z1);
        const end = new THREE.Vector3(x2, 0, z2);
        barsGroup.add(createBarMesh(start, end));
    }
}

function updateOscillators(space: Space, n_vis: number) {
    const n = space.nodes.length;
    const beg = (n - n_vis) / 2 | 0;
    oscGroup.clear();

    const sphereGeom = new THREE.SphereGeometry(3, 10, 10);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0x330000 });

    for (const o of space.oscillators) {
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        let x = o.c - beg - n_vis / 2 + 0.5;
        let z = -(o.r - beg - n_vis / 2 + 0.5);
        sphere.position.set(x, o.a * 3, z);

        oscGroup.add(sphere);
    }
}


export function show3d(space: Space, n_vis: number) {
    updateSurface(space, n_vis);
    updateBars(space, n_vis);
    updateOscillators(space, n_vis);
    renderer.render(scene, camera);
    time.textContent = space.time.toString();
}

// in canvas coords
export function grayLine3d(_x1: number, _y1: number, _x2: number, _y2: number) {
    // 3D renderer uses the same canvas, so 2D overlay drawing is disabled.
}