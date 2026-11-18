# Motion 3D (Three.js + GSAP)

Proyek untuk membuat animasi 3D di browser.

- **Three.js** membuat dan menggambar objek 3D (bentuk, material, cahaya, partikel).
- **GSAP** mengatur gerakannya (timeline intro, animasi ikut scroll lewat ScrollTrigger, easing).
- **Vite** adalah server pengembangan dan alat build.

## Menjalankan

Butuh Node.js 18 atau lebih baru.

```bash
cd motion
npm install
npm run dev
```

Buka alamat yang muncul di terminal (biasanya `http://localhost:5173`).

Untuk membuat versi siap upload (folder `dist/`):

```bash
npm run build
```

## Struktur

| File | Isi |
| --- | --- |
| `index.html` | Halaman dan teks tiap section |
| `src/main.js` | Scene 3D dan semua animasi GSAP |
| `src/style.css` | Tampilan teks dan layout |

## Mengganti objek dengan model 3D sendiri

Simpan file `.glb` di `motion/public/`, lalu di `src/main.js` ganti mesh torus dengan:

```js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

new GLTFLoader().load("/model.glb", (gltf) => {
  group.remove(mesh);
  group.add(gltf.scene);
});
```

Animasi GSAP menggerakkan `group`, jadi model baru ikut bergerak tanpa perlu mengubah timeline.
