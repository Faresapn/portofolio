# Faresa Prasetyo Nugroho — Portfolio

Portofolio pribadi, dark theme. Konsepnya: **halaman ini sebuah film, scroll adalah playhead.**
Bar di bawah layar itu timeline editor: timecode, kecepatan shuttle, marker chapter, dan ruler yang bisa di-drag.

- **Next.js 15** (App Router, TypeScript), CSS Modules, tanpa Tailwind
- **GSAP** (ScrollTrigger, SplitText) + **Lenis** untuk smooth scroll
- Font: **Schibsted Grotesk** (judul & teks), **Newsreader** (kalimat pernyataan), **IBM Plex Mono** (timecode & log saja) — self-hosted via `next/font`

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3217 lewat launch.json, atau http://localhost:3000
npm run build      # cek build produksi
```

## Isi halaman

Tiap chapter punya "color grade" sendiri, dan tiap project/card punya label warna seperti clip di editor video
(palet di `app/globals.css`: teal, blue, violet, rose, amber, green + signal).

| Chapter | Latar | Isi |
| --- | --- | --- |
| 00 Intro | hitam | Nama besar; huruf menebal dan berubah warna mengikuti kursor. Strip color bars = palet situs |
| 01 About | hitam | Profil singkat, 3 card kemampuan (AI agents, Frontend & motion, Android), 4 fakta |
| 02 Work | hitam | Monitor sticky (warnanya ikut project aktif) + 6 card project berwarna. Klik = **live preview** di iframe, bisa Desktop / Tablet / Mobile |
| 03 AI Systems | teal gelap | Pipeline n8n yang "jalan" mengikuti scroll, 4 card agent Hermes, card OpenClaw |
| 04 Experience | cokelat umber | Riwayat kerja sebagai timeline editor, clip berwarna per track; klik untuk detail. Di HP jadi accordion |
| 05 Skills | kertas terang | Skill per kategori, card pendidikan / sertifikat / publikasi |
| 06 Contact | oranye-merah | Email besar + copy, link, colophon, tombol back to top |

Easter egg: tekan **J / K / L** untuk shuttle mundur / berhenti / maju (tekan berulang untuk 2×, 4×, 8×).

## Mengubah konten

Semua teks dan data ada di **`lib/content.ts`** (diambil dari CV). Tambah project baru = tambah item di `projects`,
lalu buat preview-nya (lihat bawah).

## Video preview

File di `public/previews/` adalah rekaman layar dari situs live (Chrome headless, 1440×900, scroll otomatis),
dipercepat jadi ±12,5 detik dan di-encode H.264 1280×800. Untuk merekam ulang:

```bash
npm i -D playwright                      # sekali saja; memakai Google Chrome yang sudah terinstal
npm run previews:record -- sapi laufee   # rekam slug tertentu (tanpa argumen = semua)
npm run previews:encode -- sapi laufee   # butuh ffmpeg + python3 Pillow
```

Rencana scroll tiap situs (berapa jauh, berapa lama, klik pompa sapi) ada di `SITES` pada `scripts/previews/record.mjs`.

## Catatan

- **SIP FX tidak bisa di-embed.** `sipfx.vercel.app` mengirim header `X-Frame-Options: SAMEORIGIN`, jadi di Screening Room
  yang tampil rekamannya + tombol buka tab baru. Kalau mau live juga, ganti header itu di `vercel.json` project forex menjadi
  `Content-Security-Policy: frame-ancestors 'self' https://<domain-portofolio>`.
- `konstruksi-…vercel.app` diproteksi Vercel Authentication, jadi yang dipakai versi publik `cliffline-house.vercel.app`.
- `prefers-reduced-motion` dihormati: tanpa smooth scroll, tanpa animasi masuk, video tidak autoplay.
- Belum di-deploy. Saat siap: `vercel` dari folder ini (atau hubungkan repo di dashboard Vercel).
