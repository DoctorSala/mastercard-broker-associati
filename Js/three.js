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
renderer.toneMappingExposure = 1.3;

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

let modelGroup = null;

let targetRotationY = 0;
let isRotating = false;

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
  if (modelGroup) fitCameraToObject(camera, modelGroup, 1.7);
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

    const pivot = new THREE.Group();
    pivot.add(object);

    scene.add(pivot);
    modelGroup = pivot;

    const BASE_ROT_Y = -Math.PI / 2;   
    const OFFSET_ROT_Y = 0  ; 

    modelGroup.rotation.y = BASE_ROT_Y + OFFSET_ROT_Y;
    targetRotationY = modelGroup.rotation.y;

    targetRotationY = modelGroup.rotation.y;

    fitCameraToObject(camera, modelGroup, 1.7);
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

  renderer.render(scene, camera);
}

animate();
