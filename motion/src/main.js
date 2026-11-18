import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ---------- Renderer, scene, camera ----------
const canvas = document.querySelector("#scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0, 15);

// ---------- Objek utama ----------
const material = new THREE.MeshPhysicalMaterial({
  color: new THREE.Color("#ff7a45"),
  metalness: 0.2,
  roughness: 0.15,
  clearcoat: 1,
  clearcoatRoughness: 0.1,
  iridescence: 0.6,
});
const mesh = new THREE.Mesh(new THREE.TorusKnotGeometry(1.4, 0.45, 256, 48), material);
const group = new THREE.Group();
group.add(mesh);
scene.add(group);

const keyLight = new THREE.DirectionalLight("#ffffff", 2);
keyLight.position.set(4, 5, 6);
scene.add(keyLight);

// ---------- Partikel latar ----------
const COUNT = 600;
const positions = new Float32Array(COUNT * 3);
for (let i = 0; i < COUNT * 3; i++) positions[i] = (Math.random() - 0.5) * 30;
const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({ size: 0.03, color: "#f2f0ea", transparent: true, opacity: 0.5 })
);
scene.add(particles);

// ---------- Animasi (GSAP) ----------
const mm = gsap.matchMedia();

mm.add(
  { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
  ({ conditions }) => {
    if (conditions.reduce) {
      // Tanpa gerakan besar: tampilkan posisi akhir intro langsung.
      camera.position.z = 11;
      return;
    }

    // Intro timeline
    const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .from(mesh.scale, { x: 0, y: 0, z: 0, duration: 1.4, ease: "back.out(1.6)" })
      .from(mesh.rotation, { y: -Math.PI, duration: 1.6 }, "<")
      .to(camera.position, { z: 11, duration: 1.8, ease: "power2.inOut" }, "<")
      .from(".hero > *", { y: 40, opacity: 0, duration: 0.9, stagger: 0.12 }, "-=1.1");

    // Scroll: objek bergeser kiri-kanan, berputar, dan berganti warna per section
    const scroll = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: "main", start: "top top", end: "bottom bottom", scrub: 1 },
    });
    scroll
      .to(group.position, { x: -2.2, duration: 1 })
      .to(group.rotation, { x: Math.PI * 0.5, y: Math.PI, duration: 1 }, "<")
      .to(material.color, { r: 0.35, g: 0.55, b: 1, duration: 1 }, "<")
      .to(group.position, { x: 2.2, duration: 1 })
      .to(group.rotation, { x: Math.PI, y: Math.PI * 2, duration: 1 }, "<")
      .to(material.color, { r: 0.6, g: 1, b: 0.7, duration: 1 }, "<")
      .to(group.position, { x: -2.2, y: 0.3, duration: 1 })
      .to(group.rotation, { x: Math.PI * 1.5, y: Math.PI * 3, duration: 1 }, "<")
      .to(material.color, { r: 1, g: 0.48, b: 0.27, duration: 1 }, "<")
      .to(particles.rotation, { y: Math.PI * 0.5, duration: 3 }, 0);

    // Teks tiap section muncul saat masuk layar
    gsap.utils.toArray(".panel:not(.hero)").forEach((panel) => {
      gsap.from(panel.children, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: panel, start: "top 70%" },
      });
    });
  }
);

// Gerakan halus mengikuti kursor (parallax)
const pointer = { x: 0, y: 0 };
window.addEventListener("pointermove", (e) => {
  pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
  pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
});

// ---------- Render loop (pakai ticker GSAP) ----------
gsap.ticker.add((time) => {
  mesh.rotation.z = time * 0.15;
  camera.position.x += (pointer.x * 0.4 - camera.position.x) * 0.05;
  camera.position.y += (-pointer.y * 0.4 - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
});

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
