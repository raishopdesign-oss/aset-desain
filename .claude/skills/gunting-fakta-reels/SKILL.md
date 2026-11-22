---
name: gunting-fakta-reels
description: Produksi episode Reels "Gunting Fakta" (@guntingfakta), yaitu explainer 9:16 bergaya Tabletop App Flythrough tentang "kenapa X disebut Y" (merek yang jadi nama umum, sejarah singkat). Mencakup VO milik user sebagai patokan waktu, storyboard, render per frame yang bisa dilanjutkan, efek suara tanpa musik, watermark dan kartu logo, SRT, pengecekan tumpang tindih, thumbnail Poppins Bold, dan caption Instagram. Gunakan saat user meminta episode baru Gunting Fakta, video "kenapa ... disebut ...", atau perbaikan, thumbnail, atau caption untuk episode yang sudah ada.
---

# Gunting Fakta Reels

Seri Reels Instagram **@guntingfakta**. Episode yang sudah jadi:
- `proyek/odol-tabletop/` (Ep 01, Odol)
- `proyek/aqua-tabletop/` (Ep 02, Aqua)

Proyek baru dimulai dengan menyalin `proyek/aqua-tabletop/`, lalu mengganti `src/film.js`, `src/shots.js`, `audio/user_vo.py` (TEXT, STARTS), dan `index.html` (judul).

Mesin animasinya adalah skill **lemo-opuscar**, gaya *Tabletop App Flythrough*. Library ada di `/root/lemo-opuscar` (jalankan `setup.sh` dari skill itu kalau belum ada). Python memakai `/root/lemo-opuscar/.venv/bin/python`, karena python3 sistem tidak punya soundfile.

Selalu balas user dalam **Bahasa Indonesia**.

## Format tetap seri (keputusan user, jangan diubah tanpa ditanya)

- **Video:** 1080×1920, 30 fps, durasi mengikuti VO.
- **VO:** milik user (ElevenLabs, suara "Ricky"), satu file. **Gambar mengikuti VO; VO tidak pernah di-retime.**
- **Audio:**
  - **Tanpa musik**, hanya efek suara (foley). Foley diturunkan 40% saat VO bicara.
  - Mix akhir sekitar **−14 LUFS**, true peak ≤ −1 dB.
- **Watermark:** `assets/watermark.png` (405×108) di kiri atas, posisi (40, 200). Muncul pada 0,2 detik dan hilang sebelum kartu logo.
- **Penutup:** kamera mundur ke meja keseluruhan, lalu **kartu logo** (`assets/logo.png`, lingkaran) dengan teks "FOLLOW @GUNTINGFAKTA".
- **Subtitle:** ditanam di gambar (overlay DOM `captions.js`) dan juga dikirim sebagai file `.srt`.
- **Storyboard dulu** (`scripts/storyboard.py` menghasilkan 12 panel). Tunggu persetujuan user sebelum render penuh.
- **Paket kirim:**
  - `<nama>_vo-ricky.mp4`
  - `subtitles_id_vo-ricky.srt`
  - `thumbnail.jpg`
  - `CAPTION.md`

## Alur kerja

1. **Naskah dan VO.** Minta user mengirim VO dulu. Jalankan Whisper small (`language=id`, word timestamps) dan simpan hasilnya ke `vo_user/words.json`.
   - Isi `TEXT` (satu baris naskah per baris) dan `STARTS` (waktu mulai tiap baris, diambil dari kata pertamanya) di `user_vo.py`.
   - Jalankan skrip itu. Hasilnya `src/vo.js` (WT, DUR, LINES, VO cues) dan `vo_user/vo_track.wav`.
   - **Cek batas baris:** pastikan tidak ada kata yang jatuh ke baris tetangga.
2. **Film.** Isi `T` di `film.js` dengan waktu kata dari `WT`, supaya tiap animasi jatuh tepat pada kata yang diucapkan. Tulis kamera di `shots.js`.
3. **Storyboard**, lalu tunggu persetujuan user.
4. **Audio:**
   - `node $LIB/.../events.mjs` menghasilkan `events.json`.
   - `foley.py` menghasilkan `out/sfx.wav`.
   - `mix_user.py` menghasilkan `out/mix_user.wav`.
   - Terakhir, ubah ke −14 LUFS: `ffmpeg -af "volume=XdB,alimiter=limit=0.78:attack=2:release=80:level=disabled"` → `out/mix_final.wav`.
5. **Cek tumpang tindih SEBELUM render penuh** (lihat checklist di bawah):
   - Jalankan `sh scripts/check_frames.sh qc/fixN <t…>` dan lihat `all.jpg`.
   - Ulangi sampai bersih.
   - Untuk setiap perubahan posisi, buat folder `qc/fixN` baru. Jangan `rm` glob, karena perintah itu diblokir.
6. **Render gambar:**
   - Jalankan `sh scripts/render_frames.sh 3` sebagai **tugas latar yang dilacak** (`run_in_background`, timeout 7200000).
   - Saat batas 2 jam habis, jalankan ulang. Render melanjutkan dari frame yang sudah ada.
   - Kecepatannya sekitar 27–45 frame/menit, jadi video 169 detik (5070 frame) butuh ±2–3 jam.
7. **Encode, mux, dan QC:**
   - `sh scripts/encode_frames.sh`
   - `sh scripts/finish.sh <out.mp4> <DUR> <waktu_kartu_logo>`. Skrip ini juga mengecek loudness dan frame hitam, dan membuat contact sheet.
   - Lihat juga frame akhir (logo) dan beberapa frame tengah.
8. **SRT:** `node scripts/make_srt.mjs subtitles_id_vo-ricky.srt`.
9. **Commit dan push.** MP4 harus di bawah 100 MB; sekitar 70 MB untuk 169 detik masih aman. Kirim ke user dengan SendUserFile.
10. **Thumbnail dan caption** (lihat di bawah).

## Pelajaran dari perbaikan (WAJIB dicek setiap episode)

### Server dan render
- **Container dimatikan saat sesi diam.** Proses `nohup`/`setsid` yang terlepas akan ikut mati. Render harus berjalan sebagai tugas latar yang dilacak, maksimal 2 jam per tugas, lalu dijalankan ulang. Karena itu selalu pakai render per frame (`render_frames.sh`), bukan `video.mjs` sekali jalan.
- `sleep` di foreground diblokir. Untuk menunggu, pakai until-loop atau notifikasi tugas.
- **Memperbaiki sebagian:** hapus hanya frame pada rentang waktu yang terdampak (pakai Python `os.remove` dengan filter waktu dari nama `f_<detik>.jpg`). Setelah itu jalankan `render_frames.sh` lagi; hanya frame yang hilang yang dirender. Ingat bahwa rentang ending (tarikan kamera ke meja keseluruhan) memperlihatkan semua kartu.

### Checklist tumpang tindih (keluhan user di Ep 02)
1. **Sprite 3D di atas kartu menutupi judul kartu.** Botol voxel berdiri tegak, jadi dari sudut kamera rendah ia memanjang ke atas layar dan menutupi header kartu.
   - Taruh sprite di bagian bawah kartu (v sekitar 80% tinggi kartu).
   - Kecilkan skala (rak: 0,0048, bukan 0,0068).
   - Sediakan ruang kosong antara header dan slot.
2. **Dua objek pada titik yang sama.** Ep 02: posisi awal hero = slot Le Minerale. Periksa semua `P.*` dan `at(card, u, v)` supaya tidak ada dua objek di koordinat yang sama.
3. **Pill di dekat watermark.** Watermark menempati kiri atas (sekitar x 40–445, y 200–308 px). Pill yang muncul di sepertiga atas sisi kiri layar akan tertutup. Lebih aman taruh pill di bawah objek (offset seperti `V(0, .03, .1)`, ke arah kamera).
4. **Pill bertumpuk dengan pill.** Jika dua pill hidup bersamaan di area yang sama, akhiri pill pertama (`t1 = t0_berikutnya − 0.15`) sebelum yang kedua muncul. Periksa semua pasangan `t0/t1` di daftar `pills`.
5. **Pill di belakang objek 3D.** Pill memakai depth test, jadi bisa tertutup botol di depannya. Jangan menaruh pill tepat di belakang sprite.
6. **Pill terpotong di tepi layar** pada close-up yang sempit. Pakai offset vertikal (`V(0, .13, 0)`), bukan horizontal.
7. **Kamera close-up rendah membuat objek depan menutupi objek belakang.** Naikkan pitch-nya (Ep 02: `'hero'` 0,5 → 0,95).
8. **Kartu terpotong di tepi kiri atau kanan.** Atur jarak kamera atau subjek, lalu cek dengan still.
9. **Kartu logo di akhir** harus berhenti di tengah dan cukup besar. Cek frame sekitar DUR − 0,5 detik.
10. **Subtitle** hanya untuk teks yang diucapkan, dan selalu diambil dari waktu kata Whisper. Jika user bilang "subtitle tidak sama dengan VO", retime dengan `retime_subs.py` (ada di proyek Ep 01).

## Thumbnail (Poppins Bold)

Salin `scripts/thumbnail.py` ke `tools/` di proyek, lalu ganti:
- **Gambar latar:** satu still bersih. Render dengan `--q 'n=4&nosub'`, pilih adegan yang paling "menjawab" pertanyaan (Ep 02: rak dengan semua merek dicap AQUA).
- **Zoom dan crop:** `z, cx, cy`.
- **Teks:**
  - Chip kuning: "SELAMA INI KITA SALAH SEBUT?"
  - Judul putih dan kuning: "<X> ITU / NAMA MEREK!"
  - Subjudul satu kalimat.
  - "GUNTING FAKTA · EPS NN".

Semua teks penting harus berada di area 3:4 tengah (y 240–1680), supaya tetap terbaca di grid profil. Cek `qc/thumb_grid.jpg`. Pastikan tidak ada objek terpotong di tepi; kalau perlu turunkan zoom.

Tempel di atas gambar RGBA lewat layer overlay terpisah (`alpha_composite`), jangan menggambar langsung, karena warna chip bisa berubah jadi putih.

## Caption (`CAPTION.md`)

Ikuti format `proyek/*/CAPTION.md`:
- Baris pertama berisi hook (±125 karakter pertama tampil sebelum "selengkapnya").
- 4–6 poin dengan emoji ✂️💧👤🍶🚚.
- Penutup "Sama kayak Odol, Sanyo, dan Honda 😄".
- Ajakan komentar dan share, lalu "Follow @guntingfakta…".
- Sekitar 12–14 hashtag (selalu ada #guntingfakta).
- Ditutup dengan 4 hook alternatif, tips posting, dan **catatan cek fakta** (fakta dari naskah user belum diverifikasi).
