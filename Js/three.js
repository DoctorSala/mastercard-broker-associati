import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.getElementById("three-canvas");

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
scene.add(camera);

scene.add(new THREE.AmbientLight(0xffffff, 0.2));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(1.8, 1.5, 2.2);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xdfe8ff, 0.65);
fillLight.position.set(-2, 1.2, -1.5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x99ccff, 1.4);
rimLight.position.set(-1.3, 2.2, 3);
scene.add(rimLight);

const bounceLight = new THREE.PointLight(0xbfd6ff, 0.45, 4);
bounceLight.position.set(0, -0.6, 1.2);
scene.add(bounceLight);

const accentLight = new THREE.PointLight(0xffe3b3, 0.4, 3);
accentLight.position.set(1.5, 0.5, -1);
scene.add(accentLight);

scene.add(new THREE.AmbientLight(0xffffff, 0.15));

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
  "Assets/3DObject/credit_card.glb",
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
