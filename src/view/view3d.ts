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
let recGroup: THREE.Group;
let barsGroup: THREE.Group;
const barGeometry = new THREE.CylinderGeometry(2, 2, 1, 16);
const barMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.2, roughness: 0.7 });

export function init3d(n: number) {
    canvas3d = document.getElementById("canvas3d") as HTMLCanvasElement;
    canvas3d.width = canvas3d.height = n;
    canvas3d.style.width = canvas3d.style.height = `${2*n}px`;
    
    time = document.getElementById("time") as HTMLSpanElement;
    renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true });
    renderer.setPixelRatio(1);
    renderer.setSize(canvas3d.width, canvas3d.height, false);
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    let camera_angle = 30;
    let camera_dist = canvas3d.width / (2 * Math.tan(Math.PI/180 * (camera_angle/2)));
    
    camera = new THREE.PerspectiveCamera(camera_angle, canvas3d.width / canvas3d.height, 0.1, 5000);
    camera.position.set(0, -camera_dist, 0);
    camera.lookAt(0, 0, 0);

    ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(1, -2, 2);
    
    scene.add(ambientLight, directionalLight);

    mesh = null;
    positions = null;
    nVisCurrent = 0;

    oscGroup = new THREE.Group();
    recGroup = new THREE.Group();
    barsGroup = new THREE.Group();
    scene.add(oscGroup);
    scene.add(recGroup);
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

function createGrid(n: number) {
    const geometry = new THREE.PlaneGeometry(n, n, n - 1, n - 1);
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
    nVisCurrent = n;
}

function updateSurface(space: Space) {
    const n = space.n;

    if (!mesh || nVisCurrent !== n) {
        if (mesh) scene.remove(mesh);
        createGrid(n);
    }

    if (!positions || !mesh) return;

    const rowSize = n;
    for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
            const node = space.nodes[r][c];
            const idx = 3 * (r * rowSize + c);
            positions[idx + 1] = node.z * zScale;
        }
    }

    const geometry = mesh.geometry as THREE.BufferGeometry;
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
}

function updateBars(space: Space) {
    barsGroup.clear();
    const n2 = space.n / 2;

    for (const b of space.bars) {
        const x1 = b.c1 - n2 + 0.5;
        const z1 = -(b.r1 - n2 + 0.5);
        const x2 = b.c2 - n2 + 0.5;
        const z2 = -(b.r2 - n2 + 0.5);

        const start = new THREE.Vector3(x1, 0, z1);
        const end = new THREE.Vector3(x2, 0, z2);
        barsGroup.add(createBarMesh(start, end));
    }
}

function updateOscillators(space: Space) {
    oscGroup.clear();
    const n2 = space.n / 2;
    const sphereGeom = new THREE.SphereGeometry(2, 10, 10);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xff3333, emissive: 0x330000 });

    for (const o of space.oscillators) {
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        let x = o.c - n2 + 0.5;
        let z = -(o.r - n2 + 0.5);
        sphere.position.set(x, o.amp * 3, z);

        oscGroup.add(sphere);
    }
}

function updateReceivers(space: Space) {
    recGroup.clear();
    const n2 = space.n / 2;
    const sphereGeom = new THREE.SphereGeometry(2, 10, 10);
    const sphereMat = new THREE.MeshStandardMaterial({ color: 0xFFFF00, emissive: 0x330000 });

    for (const rec of space.receivers) {
        const sphere = new THREE.Mesh(sphereGeom, sphereMat);
        let x = rec.c - n2 + 0.5;
        let z = -(rec.r - n2 + 0.5);
        sphere.position.set(x, 0, z);   // 0, ???

        oscGroup.add(sphere);
    }
}



export function show3d(space: Space) {
    updateSurface(space);
    updateBars(space);
    updateOscillators(space);
    updateReceivers(space);
    renderer.render(scene, camera);
    time.textContent = space.time.toString();
}

// in canvas coords
export function grayLine3d(_x1: number, _y1: number, _x2: number, _y2: number) {
    // 3D renderer uses the same canvas, so 2D overlay drawing is disabled.
}