import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  canvas.clientWidth / canvas.clientHeight,
  0.1,
  100
);
camera.position.set(0, 0.2, 1.2);
scene.add(camera);

// Luci
const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(ambientLight);

const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
keyLight.position.set(1.8, 1.5, 2.2);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xdfe8ff, 0.65);
fillLight.position.set(-2, 1.2, -1.5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0x99ccff, 1.4);
rimLight.position.set(-1.3, 2.2, 3);
rimLight.castShadow = false;
scene.add(rimLight);

const bounceLight = new THREE.PointLight(0xbfd6ff, 0.45, 4);
bounceLight.position.set(0, -0.6, 1.2);
scene.add(bounceLight);

const accentLight = new THREE.PointLight(0xffe3b3, 0.4, 3);
accentLight.position.set(1.5, 0.5, -1);
scene.add(accentLight);

const envLight = new THREE.AmbientLight(0xffffff, 0.15);
scene.add(envLight);

// Variabili
let model = null;
const BASE_SCALE = 0.01;
const BASE_POSITION = new THREE.Vector3(0, 0.6, 0);

// Loader modello 
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

    pivot.scale.setScalar(BASE_SCALE);
    pivot.position.copy(BASE_POSITION);
    pivot.rotation.y = -Math.PI / 2;

    scene.add(pivot);
    model = pivot;
  },
  undefined,
  (error) => console.error("Errore nel caricamento del modello:", error)
);

// Scroll progress
let scrollProgress = 0;
function updateScrollProgress() {
  const rect = canvas.getBoundingClientRect();
  const vh = window.innerHeight;

  // Se il canvas è completamente sopra o sotto lo schermo, non aggiorno
  if (rect.bottom <= 0) {
    scrollProgress = 0; 
    return;
  }
  if (rect.top >= vh) {
    scrollProgress = 1; 
    return;
  }

  // Calcola il progresso SOLO nella finestra visibile del canvas
  const visibleHeight = vh + rect.height;
  const scroll = vh - rect.top;
  scrollProgress = Math.min(Math.max(scroll / visibleHeight, 0), 1);
}


window.addEventListener("scroll", updateScrollProgress);
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

// Animazione
function animate() {
  requestAnimationFrame(animate);

  if (model) {
    // ROTAZIONE (0.20 → 0.60 scroll)
    const rotationStart = 0.20;
    const rotationEnd = 0.60;
    let rotationProgress = 0;

    if (scrollProgress > rotationStart) {
      rotationProgress = Math.min(
        (scrollProgress - rotationStart) / (rotationEnd - rotationStart),
        1
      );
    }
    const fullRotation = rotationProgress * Math.PI * 2;

    // SCALA + PIEGA (0.60 → 1.0 scroll)
    const scaleStart = 0.60;
    const scaleEnd = 1.0;
    let scaleProgress = 0;

    if (scrollProgress > scaleStart) {
      scaleProgress = Math.min(
        (scrollProgress - scaleStart) / (scaleEnd - scaleStart),
        1
      );
    }

    //ingrandimento modello
    const scaleValue = BASE_SCALE * (1 + scaleProgress * 1.15);

    //piega modello di 90gradi su asse x
    const tiltX = -THREE.MathUtils.degToRad(90) * scaleProgress;

    if (scrollProgress >= scaleEnd) {
      model.rotation.y = -Math.PI / 2 + Math.PI * 2;
      model.rotation.x = -THREE.MathUtils.degToRad(90); 
      model.scale.setScalar(BASE_SCALE * 2.15);
    } else {
      model.rotation.y = -Math.PI / 2 + fullRotation;
      model.rotation.x = tiltX;
      model.scale.setScalar(scaleValue);
    }

    // Mantiene la posizione base
    model.position.y = BASE_POSITION.y;
  }

  //movimento della camera per mantenere visibile modello 
  camera.position.y = scrollProgress * 1.2;
  //settaggi massimi camera !importante per limiti animazione CLAMP
  camera.position.y = THREE.MathUtils.clamp(camera.position.y, 0.150, 1.040);

  //renderizzazoione scena e camera 
  renderer.render(scene, camera);
}

animate();

// Resize reattivo
window.addEventListener("resize", () => {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
});
