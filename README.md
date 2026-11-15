# MyTask - Student Task Management System

Aplikasi web modern untuk membantu mahasiswa mengelola mata kuliah, tugas perkuliahan, subtugas (checklist), tenggat waktu (upcoming deadlines), dan progres penyelesaian dalam satu platform terpadu.

Dibuat untuk memenuhi spesifikasi **Tugas 9 — Komputasi Awan dan Terdistribusi (CAK3EAB3)**.

---

## 1. Fitur Utama

- **Top Navigation Bar:** Seluruh menu navigasi terintegrasi rapi pada navbar atas (Dashboard, Mata Kuliah, Daftar Tugas, Tenggat Waktu) tanpa menggunakan sidebar samping.
- **Dashboard Akademik (`/`)**:
  - Banner selamat datang dengan ringkasan status akademik dan tombol aksi cepat.
  - Kartu metrik soft-color untuk total mata kuliah, total tugas, tugas belum selesai (pending), dan tugas selesai (done).
  - Tinjauan tenggat waktu terdekat dengan visualisasi status (terlambat / mendesak &le; 3 hari).
  - Ringkasan progres tugas berbasis subtugas dengan progress bar gradien.
- **Manajemen Mata Kuliah (`/courses`)**:
  - CRUD lengkap mata kuliah (Kode MK, Nama MK, Dosen Pengampu, Semester).
  - Validasi keunikan kode mata kuliah (case-insensitive).
  - Proteksi integritas relasi: mata kuliah tidak dapat dihapus jika masih memiliki tugas terkait.
- **Manajemen Tugas Perkuliahan (`/tasks`)**:
  - CRUD lengkap tugas perkuliahan terhubung dengan mata kuliah.
  - Filter tugas multi-dimensi (berdasarkan mata kuliah, status: *Todo / In Progress / Done*, dan prioritas: *Low / Medium / High*).
  - Pengurutan otomatis berdasarkan deadline terdekat.
  - Cascade delete: penghapusan tugas otomatis menghapus seluruh subtugas terkait.
- **Detail Tugas & Subtugas (`/tasks/[id]`)**:
  - Rincian deskripsi, deadline, status, dan prioritas tugas.
  - CRUD subtugas (tambah, edit judul, hapus, dan checklist Todo/Done).
  - Pelacakan progres otomatis berdasarkan rasio subtugas selesai (menampilkan "Belum ada subtugas" jika belum dirinci).
- **Tenggat Waktu / Upcoming Deadlines (`/deadlines`)**:
  - Menampilkan seluruh tugas aktif yang belum selesai.
  - Penanda visual tegas untuk tugas yang sudah lewat deadline (*Overdue*) dan yang jatuh tempo dalam 3 hari ke depan (*Due Soon*).
  - Filter interaktif (Semua, Mendesak, Lewat Deadline).

---

## 2. Desain & Karakteristik UI

- **Modern Top Navigation:** Tidak ada sidebar, semua navigasi berada di navbar atas dengan indikator aktif yang bersih dan responsif.
- **Border Radius 8px:** Sudut membulat modern (`border-radius: 8px`) diterapkan secara konsisten pada kartu, modal, input, tombol, dan badge.
- **Warna Soft & Elegan:** Palet warna lembut dengan garis batas halus (`border-slate-200/80` / `border-blue-100`), aksen pastel (soft blue, soft amber, soft emerald, soft rose), dan latar belakang bersih (`#F8FAFC`).
- **Font Inter:** Menggunakan tipografi Inter murni (`next/font/google`).
- **Aset Logo:** Memotong logo sumber untuk ikon URL (`public/icon.png`, `public/favicon.ico`) dan logo visual navbar (`public/logo.png`).

---

## 3. Tech Stack & Arsitektur

- **Framework:** Next.js (App Router)
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Node.js Route Handlers (`app/api/**/route.ts`)
- **Runtime:** Node.js (bukan Edge Runtime)
- **Data Store:** In-memory JavaScript Data Store (`lib/store.ts`) dengan pola singleton pada `globalThis` untuk mencegah data reset saat hot reload development.

### Batasan Penting Penyimpanan In-Memory
Aplikasi ini sengaja tidak menggunakan database eksternal/SQL/ORM sesuai ketentuan tugas. Data disimpan dalam memori proses Node.js yang diinisialisasi dari data seed (`lib/seed.ts`). Ketika proses server dimatikan atau di-restart, data akan kembali ke data seed awal.

---

## 4. Daftar Endpoint REST API

Semua endpoint mengembalikan format JSON standar:
- Respons Sukses: `{ "data": <payload>, "message": "<keterangan>" }`
- Respons Error: `{ "error": { "message": "<keterangan>" } }`

| Metode | Endpoint | Deskripsi |
|---|---|---|
| `GET` | `/api/dashboard` | Mengambil ringkasan metrik, progres, dan upcoming deadlines |
| `GET` | `/api/courses` | Mengambil seluruh mata kuliah |
| `POST` | `/api/courses` | Menambahkan mata kuliah baru |
| `GET` | `/api/courses/[id]` | Mengambil detail satu mata kuliah |
| `PUT` | `/api/courses/[id]` | Memperbarui data mata kuliah |
| `DELETE` | `/api/courses/[id]` | Menghapus mata kuliah (gagal jika masih ada tugas) |
| `GET` | `/api/tasks` | Mengambil daftar tugas (query: `courseId`, `status`, `priority`) |
| `POST` | `/api/tasks` | Menambahkan tugas baru |
| `GET` | `/api/tasks/[id]` | Mengambil detail tugas beserta subtugas dan progres |
| `PUT` | `/api/tasks/[id]` | Memperbarui data atau status tugas |
| `DELETE` | `/api/tasks/[id]` | Menghapus tugas beserta cascade delete semua subtugasnya |
| `GET` | `/api/tasks/[id]/subtasks` | Mengambil daftar subtugas dari tugas tertentu |
| `POST` | `/api/tasks/[id]/subtasks` | Menambahkan subtugas baru ke tugas tertentu |
| `PUT` | `/api/subtasks/[id]` | Memperbarui judul atau status subtugas (`Todo` / `Done`) |
| `DELETE` | `/api/subtasks/[id]` | Menghapus satu subtugas |

---

## 5. Cara Instalasi & Menjalankan Aplikasi

### Prasyarat
- Node.js versi 18+ (direkomendasikan Node.js v20 atau v24)
- npm versi 9+

### Langkah Menjalankan

1. **Instalasi Dependensi:**
   ```bash
   npm install
   ```

2. **Menjalankan Mode Development:**
   ```bash
   npm run dev
   ```
   Buka peramban di `http://localhost:3000`.

3. **Build & Menjalankan Mode Production:**
   ```bash
   npm run build
   npm run start
   ```

4. **Menjalankan Pengujian Otomatis (E2E Test Suite):**
   ```bash
   node test-e2e.mjs
   ```

---

## 6. Hasil Pengujian Fungsional

Pengujian menyeluruh telah dijalankan melalui `test-e2e.mjs` dengan hasil:
- **37 Pengujian Berhasil (0 Failed)**
- Validasi CRUD Course, Task, dan Subtask berjalan sempurna.
- Validasi aturan bisnis:
  - Duplikasi kode mata kuliah ditolak (HTTP 409).
  - Penghapusan mata kuliah yang masih memiliki tugas ditolak (HTTP 409).
  - Cascade delete tugas menghapus seluruh subtugasnya.
  - Perhitungan persentase progres subtugas akurat (0% &rarr; 50% &rarr; 100% &rarr; Belum ada subtugas).
  - Penanda deadline lewat (*Overdue*) dan mendekat (&le; 3 hari) berfungsi tepat.
