import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.getElementById("three-canvas");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
scene.add(camera);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
keyLight.position.set(2.5, 1.8, 3.5);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xe6eefc, 0.75);
fillLight.position.set(-2.8, 1.2, 2.2);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xd9e8ff, 0.85);
rimLight.position.set(-1.5, 2.0, -2.5);
scene.add(rimLight);

const bottomLight = new THREE.DirectionalLight(0xfff3df, 0.35);
bottomLight.position.set(0, -2.0, 1.8);
scene.add(bottomLight);

// gruppo esterno = follow del cursore
let followGroup = null;

// gruppo interno = flip carta
let modelGroup = null;

let targetRotationY = 0;
let isRotating = false;

// stato cursore
let pointerInside = false;
let pointerX = 0;
let pointerY = 0;

// target follow
let targetFollowRotX = 0;
let targetFollowRotY = 0;
let targetFollowPosX = 0;
let targetFollowPosY = 0;

// current follow
let currentFollowRotX = 0;
let currentFollowRotY = 0;
let currentFollowPosX = 0;
let currentFollowPosY = 0;

// intensità, più professionali e meno "effetto giocattolo"
const MAX_ROT_X = 0.18;
const MAX_ROT_Y = 0.24;
const MAX_POS_X = 0.12;
const MAX_POS_Y = 0.08;
const FOLLOW_SMOOTH = 0.075;

function resize() {
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (!w || !h) return;

  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

window.addEventListener("resize", () => {
  resize();
  if (followGroup) fitCameraToObject(camera, followGroup, 1.7);
});

resize();

function fitCameraToObject(camera, object, offset = 1.25) {
  const box = new THREE.Box3().setFromObject(object);
  const size = box.getSize(new THREE.Vector3());

  const maxDim = Math.max(size.x, size.y, size.z);
  const fov = THREE.MathUtils.degToRad(camera.fov);

  let distance = (maxDim / 2) / Math.tan(fov / 2);
  distance *= offset;

  camera.position.set(0, 0, distance);
  camera.lookAt(0, 0, 0);

  camera.near = distance / 100;
  camera.far = distance * 100;
  camera.updateProjectionMatrix();
}

const loader = new GLTFLoader();
loader.load(
  "Assets/3DObject/cartafinal.glb",
  (gltf) => {
    const object = gltf.scene;

    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    object.position.sub(center);

    followGroup = new THREE.Group();
    const pivot = new THREE.Group();

    pivot.add(object);
    followGroup.add(pivot);
    scene.add(followGroup);

    modelGroup = pivot;

    const BASE_ROT_Y = -Math.PI / 2;
    const OFFSET_ROT_Y = 0;

    modelGroup.rotation.y = BASE_ROT_Y + OFFSET_ROT_Y;
    targetRotationY = modelGroup.rotation.y;

    fitCameraToObject(camera, followGroup, 1.7);
  },
  undefined,
  () => {}
);

document.addEventListener("click", (e) => {
  const btn = e.target.closest(".material-symbols-outlined");
  if (!btn) return;
  if (!modelGroup || isRotating) return;

  targetRotationY = modelGroup.rotation.y + Math.PI;
  isRotating = true;
});

// rilevamento mouse su tutta la finestra
window.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();

  const inside =
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;

  pointerInside = inside;

  if (!inside) return;

  const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;

  pointerX = THREE.MathUtils.clamp(x, -1, 1);
  pointerY = THREE.MathUtils.clamp(y, -1, 1);
});

window.addEventListener("pointerleave", () => {
  pointerInside = false;
});

function animate() {
  requestAnimationFrame(animate);

  if (modelGroup && isRotating) {
    const step = 0.12;
    const diff = targetRotationY - modelGroup.rotation.y;
    const dir = Math.sign(diff);

    modelGroup.rotation.y += dir * Math.min(Math.abs(diff), step);

    if (Math.abs(diff) < 0.001) {
      modelGroup.rotation.y = targetRotationY;
      isRotating = false;
    }
  }

  if (followGroup) {
    if (pointerInside) {
      // la carta segue il cursore con il fronte, non con l'angolo
      targetFollowRotX = -pointerY * MAX_ROT_X;
      targetFollowRotY = pointerX * MAX_ROT_Y;

      // micro parallasse elegante
      targetFollowPosX = pointerX * MAX_POS_X;
      targetFollowPosY = -pointerY * MAX_POS_Y;
    } else {
      targetFollowRotX = 0;
      targetFollowRotY = 0;
      targetFollowPosX = 0;
      targetFollowPosY = 0;
    }

    currentFollowRotX += (targetFollowRotX - currentFollowRotX) * FOLLOW_SMOOTH;
    currentFollowRotY += (targetFollowRotY - currentFollowRotY) * FOLLOW_SMOOTH;
    currentFollowPosX += (targetFollowPosX - currentFollowPosX) * FOLLOW_SMOOTH;
    currentFollowPosY += (targetFollowPosY - currentFollowPosY) * FOLLOW_SMOOTH;

    followGroup.rotation.x = currentFollowRotX;
    followGroup.rotation.y = currentFollowRotY;
    followGroup.position.x = currentFollowPosX;
    followGroup.position.y = currentFollowPosY;
  }

  renderer.render(scene, camera);
}

animate();