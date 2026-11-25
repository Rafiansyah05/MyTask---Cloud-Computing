# Deskripsi Website — MyTask (Student Task Management System)

Dokumen ini disusun sebagai analisis faktual kondisi website saat ini (kode sumber dan hasil render browser) untuk bahan redesain. Seluruh temuan merujuk langsung pada file di repositori serta hasil screenshot di `/docs/screenshots/`.

---

## 1. Ringkasan

- **Tujuan Website:** Aplikasi web manajemen tugas perkuliahan mahasiswa untuk mengelola mata kuliah, tugas perkuliahan, subtugas (checklist), tenggat waktu (*upcoming deadlines*), dan progres penyelesaian tugas (`app/layout.tsx`, `README.md`).
- **Target Pengguna:** Mahasiswa perguruan tinggi (secara spesifik terlihat pada copy *"Portal Akademik Mahasiswa"*, *"Semester 5"*, dan contoh kode mata kuliah seperti `CAK3EAB3` di `app/page.tsx`, `components/layout/AppLayout.tsx`, `lib/seed.ts`).
- **Alur Utama Pengguna:**
  1. **Melihat Ringkasan (`/`)**: Memantau metrik total mata kuliah, total tugas, tugas belum selesai (*pending*), tugas selesai (*done*), 5 deadline terdekat, dan daftar progres subtugas (`app/page.tsx`).
  2. **Mengelola Mata Kuliah (`/courses`)**: Menambah, melihat detail (beserta tugas terkait), mengubah, dan menghapus mata kuliah. Sistem menolak kode MK duplikat (HTTP 409) dan melarang penghapusan MK yang masih memiliki tugas (`app/courses/page.tsx`, `lib/store.ts`).
  3. **Mengelola Tugas (`/tasks`)**: Memfilter tugas berdasarkan mata kuliah, status (`Todo`, `In Progress`, `Done`), dan prioritas (`Low`, `Medium`, `High`); membuat/mengedit/menghapus tugas melalui modal (`app/tasks/page.tsx`).
  4. **Mengelola Detail & Checklist Subtugas (`/tasks/[id]`)**: Mengubah status tugas langsung melalui *segmented button*, mengedit/menghapus tugas induk, serta menambah, mencentang (`Todo` ↔ `Done`), mengedit, dan menghapus subtugas yang otomatis menghitung persentase progres (`app/tasks/[id]/page.tsx`).
  5. **Memantau Tenggat Waktu (`/deadlines`)**: Melihat seluruh tugas aktif yang belum selesai (`status !== "Done"`), dikelompokkan dan difilter berdasarkan status *Semua*, *Mendesak (≤ 3 Hari)*, dan *Lewat Deadline* (`app/deadlines/page.tsx`, `lib/store.ts`).

---

## 2. Tech Stack

| Kategori | Teknologi / Detail | Bukti File |
|---|---|---|
| **Framework** | Next.js `^15.1.0` (App Router, terinstal `15.5.29`) | `package.json`, `app/` |
| **UI Library & Bahasa** | React `^19.0.0`, React DOM `^19.0.0`, TypeScript `^5.7.2` (`strict: true`) | `package.json`, `tsconfig.json` |
| **Styling** | Tailwind CSS `^3.4.17`, PostCSS `^8.4.49`, Autoprefixer `^10.4.20` | `package.json`, `tailwind.config.js`, `postcss.config.js`, `app/globals.css` |
| **Font** | Google Font `Inter` via `next/font/google` | `app/layout.tsx` |
| **State Management** | Local component state (`React.useState`, `React.useEffect`) + URL query params (`useSearchParams`) — tidak ada library state global eksternal (Redux/Zustand) | `app/**/page.tsx` |
| **Data Fetching & API** | Native `fetch` wrapper (`lib/api-client.ts`) ke Next.js Route Handlers (`app/api/**/route.ts`) | `lib/api-client.ts`, `app/api/` |
| **Penyimpanan Data** | In-memory JavaScript store (`MemoryStore` singleton di `globalThis`) dengan data awal dari `lib/seed.ts` (tanpa database eksternal) | `lib/store.ts`, `lib/seed.ts` |
| **Library UI / Ikon Tambahan** | Tidak ditemukan (seluruh komponen UI dan 1 ikon SVG dibangun manual) | `package.json`, `components/ui/` |

---

## 3. Peta Halaman

Aplikasi memiliki **5 route halaman** (seluruhnya dibungkus oleh `AppLayout` di `app/layout.tsx`):

1. **`/` — Dashboard (`app/page.tsx`)**
   - *Fungsi:* Ringkasan status akademik mahasiswa.
   - *Struktur Section (atas ke bawah):*
     1. Top Navbar + Sub-header Banner `"Ringkasan Akademik"` (`AppLayout.tsx`).
     2. Hero Banner Card (`"Selamat Datang di Sistem MyTask"` + 2 tombol CTA: `Kelola Mata Kuliah` dan `+ Tambah Tugas`).
     3. Grid 4 Kartu Metrik (`Mata Kuliah`, `Total Tugas`, `Belum Selesai`, `Selesai Dikerjakan`).
     4. Grid 2 Kolom: Kiri `"Deadline Terdekat"` (maksimal 5 item pertama) & Kanan `"Progres Subtugas"` (scrollable max-height `440px`).

2. **`/courses` — Manajemen Mata Kuliah (`app/courses/page.tsx`)**
   - *Fungsi:* CRUD daftar mata kuliah dan melihat tugas yang terhubung ke tiap mata kuliah.
   - *Struktur Section (atas ke bawah):*
     1. Top Navbar + Sub-header `"Manajemen Mata Kuliah"`.
     2. Top Header Card (`"Daftar Mata Kuliah"` + tombol `+ Tambah Mata Kuliah`).
     3. Area Alert (sukses/error, muncul kondisional).
     4. Tabel Mata Kuliah (`No`, `Kode MK`, `Nama Mata Kuliah`, `Dosen Pengampu`, `Semester`, `Aksi` dengan menu dropdown titik tiga: Detail, Ubah, Hapus).
     5. Modal Tambah/Ubah Mata Kuliah, Modal Detail Mata Kuliah, dan `ConfirmModal` Hapus.

3. **`/tasks` — Manajemen Tugas Perkuliahan (`app/tasks/page.tsx`)**
   - *Fungsi:* Daftar seluruh tugas dengan filter multi-dimensi dan CRUD tugas.
   - *Struktur Section (atas ke bawah):*
     1. Top Navbar + Sub-header `"Manajemen Tugas Perkuliahan"`.
     2. Header Card (`"Manajemen Tugas Perkuliahan"` + tombol `+ Tambah Tugas Baru`).
     3. Area Alert (peringatan jika belum ada mata kuliah, sukses, error).
     4. Filter Bar Card (`Filter & Pencarian`: dropdown Mata Kuliah, Status Tugas, Prioritas, dan tombol `Bersihkan Filter`).
     5. Baris info jumlah tugas & keterangan urutan (`"Ditemukan X tugas"`, `"Diurutkan berdasarkan deadline terdekat"`).
     6. Daftar Kartu Tugas (tiap kartu berisi badge MK/status/prioritas, judul, deskripsi max 2 baris, deadline & rasio subtugas, kotak progress bar, serta 3 tombol aksi: `Detail & Checklist`, `Ubah`, `Hapus`).
     7. Modal Tambah/Ubah Tugas dan `ConfirmModal` Hapus.

4. **`/tasks/[id]` — Detail Tugas & Subtugas (`app/tasks/[id]/page.tsx`)**
   - *Fungsi:* Menampilkan detail lengkap satu tugas dan mengelola checklist subtugas.
   - *Struktur Section (atas ke bawah):*
     1. Top Navbar + Sub-header `"Detail Tugas & Subtugas"`.
     2. Baris navigasi & aksi atas (`← Kembali ke Daftar Tugas`, tombol `Ubah Tugas`, `Hapus Tugas`).
     3. Area Alert (sukses/error).
     4. Main Task Details Card (badge MK & prioritas, judul tugas, kotak deskripsi, grid metadata 3 kolom berisi Deadline, *segmented control* Status Pengerjaan `Todo`/`In Progress`/`Done`, dan tanggal dibuat, serta kotak `ProgressBar`).
     5. Subtasks Section Card (form inline `+ Tambah Subtugas` dan daftar checklist subtugas dengan tombol toggle checkbox, `Batal`/`Selesai`, `Ubah`, `Hapus`).
     6. Modal Ubah Judul Subtugas, `ConfirmModal` Hapus Subtugas, Modal Ubah Data Tugas, dan `ConfirmModal` Hapus Tugas.

5. **`/deadlines` — Tenggat Waktu (`app/deadlines/page.tsx`)**
   - *Fungsi:* Pemantauan tugas aktif (`status !== "Done"`) berdasarkan urgensi tenggat waktu.
   - *Struktur Section (atas ke bawah):*
     1. Top Navbar + Sub-header `"Tenggat Waktu & Jadwal"`.
     2. Page Header Card (`"Tenggat Waktu (Upcoming Deadlines)"`).
     3. Grid 3 Kartu Ringkasan Interaktif (klik untuk memfilter: `Total Tugas Aktif`, `Mendesak (≤ 3 Hari)`, `Lewat Deadline (Terlambat)`).
     4. Bar Segmented Filter Pills (`Semua`, `Mendesak ≤ 3 Hari`, `Lewat Deadline`).
     5. Daftar Kartu Deadline (tiap kartu menampilkan badge MK, badge status waktu, badge prioritas, badge status tugas, judul, deskripsi, tanggal tenggat, dan tombol `Buka Detail & Checklist →`).

---

## 4. Inventaris Komponen

### Komponen Layout
- **`AppLayout`** (`components/layout/AppLayout.tsx`):
  - Navbar sticky (`h-16`, `bg-white/95 backdrop-blur-sm`, `border-b border-slate-200`), logo `/logo.png`, navigasi desktop terpusat (`absolute left-1/2 -translate-x-1/2`), tombol CTA kanan `+ Kelola Tugas`, tombol hamburger mobile (`md:hidden`), dropdown menu mobile (berisi link navigasi + footer info `"Status: In-Memory Storage"` dan `"Semester 5"`), serta sub-header banner dengan breadcrumb statis `MyTask / {PageTitle}` dan `<h1>`.

### Komponen UI Reusable (`components/ui/`)
- **`Alert`** (`components/ui/Alert.tsx`):
  - Varian `type`: `"success"` (emerald), `"error"` (rose), `"warning"` (amber), `"info"` (blue). Mendukung `title`, `message`, dan tombol `Tutup` opsional (`onClose`).
- **`Badge`** (`components/ui/Badge.tsx`):
  - Varian `variant`: `"primary"` (blue), `"secondary"` (indigo), `"success"` (emerald), `"warning"` (amber), `"danger"` (rose), `"neutral"` (slate).
  - Varian `size`: `"sm"` (`px-2 py-0.5 text-[11px]`), `"md"` (`px-2.5 py-1 text-xs`).
  - Opsi `dot?: boolean` (titik bulat `w-1.5 h-1.5` di sebelah kiri teks).
- **`Modal`** (`components/ui/Modal.tsx`):
  - Overlay `bg-slate-900/40 backdrop-blur-xs`, header dengan titik biru `w-2.5 h-2.5 bg-blue-500` + judul + tombol teks `Tutup`, mendukung tombol `Escape`, lock scroll `body`, dan `maxWidth`: `"sm" | "md" | "lg" | "xl"`.
- **`ConfirmModal`** (`components/ui/ConfirmModal.tsx`):
  - Membungkus `Modal` (`maxWidth="sm"`), memiliki varian `isDestructive` (`true` = tombol merah `bg-rose-600`, `false` = tombol biru `bg-blue-600`) dan state `isLoading`.
- **`EmptyState`** (`components/ui/EmptyState.tsx`):
  - Kotak putih berborder, ikon kotak bertuliskan teks monospace `"NIL"`, judul, deskripsi, dan tombol aksi opsional (`actionText` + `onAction`).
- **`LoadingState`** (`components/ui/LoadingState.tsx`):
  - Kotak putih berborder dengan pill `"Memproses Data"` (titik biru animasi `animate-ping`) dan teks pesan.
- **`ProgressBar`** (`components/ui/ProgressBar.tsx`):
  - Tinggi `h-2`, latar `bg-slate-100`. Jika `percentage === null` atau `totalSubtasks === 0` menampilkan bar kosong + teks `"Belum ada subtugas"`. Jika `100%` menggunakan gradasi `from-emerald-500 to-teal-500`; selain itu `from-blue-500 to-indigo-600`.

### Pola Komponen Lokal (Belum Diekstrak ke `components/ui/`)
- **Tombol (`<button>` & `<Link>`)**: Ditulis inline dengan class Tailwind di tiap halaman (primer biru `bg-blue-600`, sekunder putih `border-slate-200 bg-white`, destruktif `border-rose-200 bg-rose-50/60 text-rose-700`).
- **Input, Select, Textarea Form**: Ditulis inline di `app/courses/page.tsx`, `app/tasks/page.tsx`, dan `app/tasks/[id]/page.tsx`.
- **Kartu (Card)**: Ditulis inline di seluruh halaman (`rounded-[8px] border border-slate-200 bg-white`).

---

## 5. Sistem Visual Saat Ini

### Warna
- **Dark Mode:** **Tidak ditemukan.** Hanya tersedia light mode (`tailwind.config.js`, `app/globals.css`).
- **Token di `tailwind.config.js`:**
  - `brand.50` (`#F0F5FF`) s.d. `brand.900` (`#0B2368`), dengan `brand.500` (`#0052FF`) diberi komentar *"Signature brand blue"*. **Catatan faktual:** Token `brand-*` ini **tidak pernah dipakai** di komponen atau halaman mana pun; seluruh UI justru memakai palet bawaan Tailwind `blue-*` (`blue-50`, `blue-100`, `blue-500`, `blue-600`, `blue-700`).
  - `surface.DEFAULT` (`#FFFFFF`), `surface.subtle` (`#F8FAFC`), `surface.muted` (`#F1F5F9`). Di kode lebih sering ditulis langsung sebagai `bg-white`, `bg-[#F8FAFC]`, `bg-slate-50`, `bg-slate-100`.
- **Warna yang Sebenarnya Dipakai di UI:**
  - **Latar belakang halaman:** `#F8FAFC` (`app/globals.css`, `components/layout/AppLayout.tsx`).
  - **Permukaan kartu/modal/navbar:** `#FFFFFF` (`bg-white`, `bg-white/95`).
  - **Teks utama & sekunder:** `#1E293B` di `body` (`app/globals.css`), `text-slate-900`, `text-slate-800`, `text-slate-600`, `text-slate-500`, `text-slate-400`.
  - **Aksi primer & aktif:** `blue-600` (`#2563EB`), `blue-700` (`#1D4ED8`), `blue-50` (`#EFF6FF`).
  - **Status semantik:**
    - *Sukses / Done:* `emerald-50`, `emerald-200`, `emerald-600`, `emerald-700`, `emerald-800`.
    - *Peringatan / Mendesak / Pending:* `amber-50`, `amber-200`, `amber-600`, `amber-700`, `amber-800`, `amber-900`.
    - *Bahaya / Overdue / High / Hapus:* `rose-50`, `rose-200`, `rose-600`, `rose-700`, `rose-900`.
    - *Aksen gradasi dekoratif:* `indigo-50/50`, `indigo-50/30`, `indigo-600`, `teal-500`.

### Tipografi
- **Font Family:** `Inter` dimuat via `next/font/google` dengan CSS variable `--font-inter` dan fallback `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` (`app/layout.tsx`, `app/globals.css`, `tailwind.config.js`).
- **Hierarki & Ukuran Teks:**
  - `h1` (Sub-header `AppLayout.tsx`): `text-xl sm:text-2xl` (20px / 24px), `font-bold`, `tracking-tight`.
  - `h2` (Header section halaman & judul detail tugas): `text-xl` (`20px`) di `courses`/`tasks`/`deadlines`, `text-xl sm:text-2xl` di hero dashboard, `text-2xl` (`24px`) di detail tugas (`font-bold`).
  - Angka metrik dashboard (`app/page.tsx`): `text-3xl font-extrabold` (`30px`, bobot 800); di `deadlines/page.tsx`: `text-2xl font-bold` (`24px`, bobot 700).
  - `h3` / judul kartu: `text-base font-bold` (`16px`).
  - Body / input form: `text-sm` (`14px`) atau `text-xs sm:text-sm` (`12px`–`14px`).
  - Tombol, label filter, metadata: `text-xs` (`12px`).
  - Micro-label / badge kecil / caption: `text-[11px]` (`11px`).
  - Line-height: default Tailwind + `leading-relaxed` pada paragraf deskripsi/alert.

### Spacing, Grid, Container, Border Radius, Bayangan, dan Border
- **Container & Padding:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` pada navbar, sub-header, dan `<main className="... py-8">` (`AppLayout.tsx`).
- **Grid:**
  - Dashboard metrik: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`.
  - Dashboard 2 kolom: `grid-cols-1 lg:grid-cols-2 gap-8`.
  - Filter tasks: `grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3`.
  - Deadlines summary: `grid-cols-1 sm:grid-cols-3 gap-4`.
- **Border Radius:** Hampir seluruh elemen (kartu, tombol, badge, input, modal, alert) menggunakan `rounded-[8px]` secara eksplisit, dengan pengecualian `rounded-[6px]` pada *segmented button* status (`app/tasks/[id]/page.tsx`) dan `rounded-full` pada progress bar & indikator titik. (Konfigurasi `tailwind.config.js` juga mendefinisikan `DEFAULT: "8px"`, `lg: "8px"`, `xl: "12px"`, `2xl: "16px"`).
- **Bayangan (Shadow):** Sangat minimal (`shadow-xs` yang **bukan utility standar Tailwind v3**, `shadow-sm` pada tombol primer, `shadow-lg` pada dropdown aksi di `courses/page.tsx`, `shadow-xl` pada `Modal.tsx`).
- **Border:** Dominan garis tipis `border border-slate-200`, `border-slate-200/80`, `border-slate-100`, atau border semantik (`border-blue-100`, `border-amber-200`, `border-rose-200`).

### Ikon dan Ilustrasi
- **Pustaka Ikon:** Tidak menggunakan pustaka ikon (seperti Lucide/Heroicons).
- **Ikon yang Ada:**
  - Hanya 1 ikon SVG inline (ikon titik tiga vertikal `⋮`) di `app/courses/page.tsx` baris 267–269.
  - Karakter teks/HTML entity dipakai sebagai ikon: `+`, `✓`, `&rarr;` (`→`), `&larr;` (`←`), `•`.
  - Ikon placeholder teks `"NIL"` di `EmptyState.tsx`.
  - **Emoji sebagai ikon:** **Tidak ditemukan** di seluruh kode maupun UI.
- **Ilustrasi:** Tidak ditemukan.

### Gambar dan Animasi/Transisi
- **Gambar:** Hanya logo brand `/logo.png` (`h-8 w-auto` di `AppLayout.tsx`) dan `/icon.png` / `/favicon.ico` sebagai favicon (`app/layout.tsx`). Tidak ada gambar konten atau foto lain.
- **Animasi / Transisi:**
  - Global CSS (`app/globals.css`): `button, a, input, select, textarea { transition: all 0.15s ease-in-out; }`.
  - Progress bar (`ProgressBar.tsx`): `transition-all duration-500 ease-out`.
  - Indikator loading (`LoadingState.tsx`): `animate-ping`.
  - **Catatan class tidak berfungsi:** Beberapa file memakai `animate-in fade-in duration-200` (di `page.tsx`, `Modal.tsx`, `AppLayout.tsx`) dan `backdrop-blur-xs` (`Modal.tsx`) serta `shadow-xs` (`AppLayout.tsx`, `page.tsx`, `deadlines/page.tsx`). Class `animate-in`, `fade-in`, `backdrop-blur-xs`, dan `shadow-xs` adalah utility Tailwind v4 / plugin `tailwindcss-animate`, **bukan** bawaan Tailwind v3.4.17 tanpa plugin, sehingga tidak menghasilkan efek apa pun di konfigurasi saat ini.

---

## 6. Layout dan Responsivitas

- **Breakpoint yang Digunakan:** `sm` (`640px`), `md` (`768px`), `lg` (`1024px`) — standar Tailwind CSS.
- **Perilaku & Temuan Visual dari Screenshot Desktop (`1440px`) dan Mobile (`390px`):**
  - **Desktop (`1440px`):**
    - `dashboard-desktop.png`, `courses-desktop.png`, `tasks-desktop.png`, `task-detail-desktop.png`, dan `deadlines-desktop.png` tampil rapi dalam container `max-w-7xl` dengan ruang kosong kiri-kanan yang proporsional.
    - Pada `dashboard-desktop.png`, kolom kanan `"Progres Subtugas"` terpotong oleh `max-h-[440px] overflow-y-auto` sehingga item ke-4 terpotong setengah di bagian bawah kotak.
  - **Mobile (`390px`):**
    - Grid metrik (4 kolom → 1 kolom), grid 2 kolom dashboard (→ 1 kolom), filter bar (→ 1 kolom), dan kartu tugas (`lg:flex-row` → `flex-col`) menumpuk ke bawah dengan benar.
    - **Masalah layout yang terlihat pada screenshot `390px`:**
      1. **Terpotong di sisi kanan pada semua 5 screenshot mobile** (`dashboard-mobile.png`, `courses-mobile.png`, `tasks-mobile.png`, `task-detail-mobile.png`, `deadlines-mobile.png`): tombol hamburger menu di kanan atas navbar tidak tampak dalam frame `390px`, dan sisi kanan kartu/teks terpotong di tepi kanan.
      2. **Form tambah subtugas di `/tasks/[id]` (`task-detail-mobile.png`):** `<form className="flex gap-2.5">` tidak menggunakan `flex-col sm:flex-row` dan input tidak diberi `min-w-0`, sehingga input + tombol `+ Tambah Subtugas` (`shrink-0`) mendorong lebar melebihi viewport `390px`.
      3. **Tabel mata kuliah di `/courses` (`courses-mobile.png`):** Menggunakan `<table>` penuh (`overflow-x-auto`) tanpa tampilan alternatif kartu untuk mobile; kolom `Semester` dan `Aksi` terdorong keluar ke kanan sehingga butuh scroll horizontal tabel.
      4. **Baris info di `/tasks` (`tasks-mobile.png`):** `"Ditemukan 6 tugas"` dan `"Diurutkan berdasarkan deadline terdekat"` memakai `flex justify-between` tanpa `flex-wrap`, sehingga teks kanan terpotong di lebar sempit.

---

## 7. Konten

- **Gaya Bahasa / Copywriting:** Bahasa Indonesia formal-informatif yang konsisten untuk konteks akademik mahasiswa (*"Kelola data mata kuliah semester ini beserta relasi tugas perkuliahan"*, *"Pecah tugas besar menjadi langkah-langkah terukur"*).
- **Campuran Bahasa (Code-switching):** Istilah status dan prioritas di data & UI menggunakan bahasa Inggris (`Todo`, `In Progress`, `Done`, `Low`, `Medium`, `High`, `Upcoming Deadlines`), sementara label di sekitarnya berbahasa Indonesia (contoh: `"Status: Done"`, `"Prioritas High"`, `"Tenggat Waktu (Upcoming Deadlines)"`).
- **Teks Placeholder / Generik:**
  - Tidak ada teks *Lorem ipsum*.
  - Data awal (`lib/seed.ts`) berisi data dummy realistis perkuliahan Semester 5 (4 mata kuliah, 6 tugas bertanggal November 2026, serta subtugas), termasuk referensi langsung ke tugas kuliah pembuatnya: `"Implementasi Aplikasi Cloud MyTask (Tugas 9)"`.
  - Terdapat satu label statis di menu mobile `AppLayout.tsx` baris 125–126: `"Status: In-Memory Storage"` dan `"Semester 5"` yang bersifat *hardcoded* (bukan dari data dinamis).

---

## 8. Aksesibilitas dan Performa

- **Kontras Warna:**
  - Sebagian besar teks utama (`text-slate-900` / `text-slate-800` di atas putih) memiliki kontras tinggi.
  - **Potensi masalah kontras:** Teks `text-slate-400` (`#94A3B8`) di atas putih (`#FFFFFF`) atau `bg-slate-50` digunakan untuk placeholder, label uppercase metadata (`Modal`, `courses/page.tsx`, `tasks/[id]/page.tsx`, `deadlines/page.tsx`), dan teks `"Belum ada subtugas"` (`ProgressBar.tsx`) — rasio kontras `#94A3B8` di atas `#FFFFFF` sekitar ~2.5:1 (di bawah standar WCAG AA 4.5:1 untuk teks kecil `11px`–`12px`).
- **Ukuran Target Sentuh:**
  - Banyak tombol aksi menggunakan padding kecil: `px-2.5 py-1 text-xs` (tinggi ±26px) pada tombol subtugas (`Selesai`, `Ubah`, `Hapus` di `app/tasks/[id]/page.tsx`), tombol `p-1.5` pada menu titik tiga (`app/courses/page.tsx`), dan checkbox subtugas `h-5 w-5` (`20px × 20px`) — di bawah rekomendasi minimum `44px × 44px` untuk sentuhan mobile.
- **Label Form & Semantik HTML:**
  - **Tidak ada atribut `htmlFor` dan `id` yang menghubungkan `<label>` dengan `<input>` / `<select>` / `<textarea>`** di seluruh form (`app/courses/page.tsx`, `app/tasks/page.tsx`, `app/tasks/[id]/page.tsx`).
  - Di `app/tasks/[id]/page.tsx` baris 388, input tambah subtugas tidak memiliki `<label>` sama sekali (hanya `placeholder`).
  - Di `app/deadlines/page.tsx` baris 64, 79, 94, tiga kartu ringkasan yang dapat diklik menggunakan `<div onClick={...}>` alih-alih `<button>` (tidak bisa difokus/diaktivasi dengan keyboard Tab/Enter).
  - Di `app/tasks/[id]/page.tsx` baris 442, judul subtugas yang dapat diklik menggunakan `<span onClick={...}>`.
  - Di `Modal.tsx`, tidak ada `role="dialog"`, `aria-modal="true"`, maupun *focus trap* saat modal terbuka.
- **Alt Text:** Logo di `AppLayout.tsx` memiliki `alt="MyTask Logo"`. Tidak ada `<img>` lain.
- **Focus State:**
  - Input dan select memiliki `focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none` (terlihat baik untuk input).
  - Tombol dan link tidak memiliki custom `focus-visible:ring-*`, hanya mengandalkan default browser (atau tidak ada sama sekali jika ter-override).
- **Performa:**
  - Seluruh 5 halaman menggunakan `"use client"` dan melakukan *client-side data fetching* di `useEffect` (menampilkan `LoadingState` terlebih dahulu sebelum konten muncul), padahal Next.js App Router mendukung Server Components.
  - Tidak ada dependency berat atau library UI besar (`package.json` hanya berisi `next`, `react`, `react-dom`), sehingga bundle JS relatif ringan.

---

## 9. AUDIT "AI SLOP"

| Kriteria Audit | Status | Bukti & Lokasi File |
|---|---|---|
| **Gradasi ungu-biru atau gradasi dekoratif tanpa fungsi** | **Sebagian** | Tidak ada gradasi ungu-biru mencolok di seluruh halaman, namun ada gradasi dekoratif lembut `bg-gradient-to-r from-blue-50/70 via-indigo-50/30 to-white` di sub-header (`AppLayout.tsx:133`), `from-blue-50/90 via-indigo-50/50 to-white` + blob blur `bg-blue-100/40 blur-2xl` di hero (`app/page.tsx:61,93`), dan gradasi pada `ProgressBar.tsx:37-38`. |
| **Semua kartu memakai radius besar, bayangan lembut, dan padding seragam** | **Sebagian** | Radiusnya konsisten `8px` (`rounded-[8px]`), bukan radius besar (`16px`–`24px`), dan bayangannya sangat minim/datar. Namun hampir seluruh kartu memakai pola border `border-slate-200 bg-white` dan padding `p-5` / `p-6` yang seragam di semua halaman. |
| **Hero generik: judul besar di tengah, dua tombol, badge kecil di atasnya** | **Sebagian** | Di `app/page.tsx:61-90`, hero banner tidak di tengah (rata kiri di desktop, tombol di kanan), tetapi strukturnya persis memiliki 1 badge kecil di atas (`"Portal Akademik Mahasiswa"`), judul, paragraf singkat, dan 2 tombol (`Kelola Mata Kuliah`, `+ Tambah Tugas`). |
| **Grid "3 fitur" dengan ikon bulat yang identik** | **Tidak** | Tidak ada section marketing "3 fitur". Grid yang ada adalah 4 kartu metrik (`app/page.tsx:97`) dan 3 kartu ringkasan filter (`app/deadlines/page.tsx:63`), keduanya tanpa ikon bulat identik. |
| **Emoji atau ikon generik sebagai dekorasi** | **Tidak** | Tidak ditemukan emoji di seluruh kode maupun UI. |
| **Font default (Inter/Roboto/system) tanpa karakter** | **Ya** | Hanya menggunakan `Inter` (`app/layout.tsx:6`, `tailwind.config.js:11`) untuk heading maupun body tanpa variasi font display/aksen atau karakter tipografi khusus. |
| **Copy klise ("Revolusioner", "Tingkatkan produktivitasmu", dll.)** | **Tidak** | Copywriting lugas dan fungsional sesuai domain akademik mahasiswa, tanpa buzzword marketing klise. |
| **Hierarki visual datar: semua elemen berbobot sama** | **Sebagian** | Di `app/page.tsx`, metrik utama (`text-3xl font-extrabold`) cukup menonjol, namun di `/courses`, `/tasks`, dan `/deadlines`, header halaman di sub-header `AppLayout` (`h1`) dan header card di dalam `<main>` (`h2`) menampilkan judul yang hampir identik dan berdekatan, serta kartu-kartu daftar tugas memiliki kepadatan badge dan border yang seragam. |
| **Ketidakkonsistenan: nilai warna/spacing/radius acak, bukan dari token** | **Ya** | `tailwind.config.js` mendefinisikan palet `brand.50`–`brand.900` (`#0052FF`) dan `surface.*`, tetapi **tidak satu pun komponen memakainya** — kode justru menulis `blue-600`, `bg-[#F8FAFC]`, dan `rounded-[8px]` secara *hardcoded* (meski `rounded` default sudah `8px`). Juga terdapat utility non-existent di Tailwind v3 seperti `shadow-xs`, `backdrop-blur-xs`, dan `animate-in fade-in`. |
| **Ciri generik lain yang ditemukan** | **Ya** | 1) **Redundansi Header:** Setiap halaman memiliki sub-header di `AppLayout` (`<h1>`) dan tepat di bawahnya ada Header Card (`<h2>`) yang mengulang informasi yang sama (contoh di `/tasks`: sub-header bertuliskan `"Manajemen Tugas Perkuliahan"`, diikuti kartu putih bertuliskan `"Manajemen Tugas Perkuliahan"`).<br>2) **Titik biru dekoratif berulang:** Titik bulat biru kecil (`w-2 h-2` / `w-2.5 h-2.5`) dipakai berulang di header card `courses/page.tsx`, `tasks/page.tsx`, `deadlines/page.tsx`, dan `Modal.tsx`. |

---

## 10. Hal yang HARUS Dipertahankan

1. **Struktur Data & Kontrak API (`types/index.ts`, `lib/api-client.ts`, `app/api/**`):**
   - Model `Course`, `Task`, `Subtask`, `TaskWithDetails`, `UpcomingDeadlineTask`, dan `DashboardSummary` beserta seluruh endpoint REST API (`/api/dashboard`, `/api/courses`, `/api/tasks`, `/api/subtasks`).
2. **Aturan Bisnis di `lib/store.ts`:**
   - Kode mata kuliah unik (*case-insensitive*, HTTP 409 jika duplikat).
   - Mata kuliah tidak dapat dihapus jika masih memiliki tugas terkait (HTTP 409).
   - *Cascade delete* tugas otomatis menghapus seluruh subtugasnya.
   - Perhitungan progres otomatis berdasarkan rasio subtugas `Done / total` (atau `null` → `"Belum ada subtugas"` jika 0 subtugas).
   - Klasifikasi deadline: *Overdue* (`daysRemaining < 0`), *Due Soon* (`0 <= daysRemaining <= 3`), dan hanya tugas dengan `status !== "Done"` yang masuk daftar upcoming deadlines.
3. **Alur Utama & Fungsionalitas 5 Halaman:**
   - Dashboard ringkasan, CRUD Mata Kuliah + modal detail relasi tugas, CRUD Tugas + filter 3 dimensi (`courseId`, `status`, `priority`), Detail Tugas + checklist subtugas interaktif, dan halaman Tenggat Waktu dengan filter urgensi.
4. **Identitas Branding Dasar:**
   - Nama **MyTask**, aset logo `/logo.png` dan `/icon.png`, serta bahasa Indonesia sebagai bahasa utama antarmuka.

---

## 11. Masalah Utama dan Peluang (Diurutkan dari Dampak Terbesar)

1. **[Tinggi] Responsivitas Mobile (390px) Bermasalah:**
   - Seluruh screenshot mobile menunjukkan konten terpotong di sisi kanan, form tambah subtugas (`flex` tanpa `flex-col sm:flex-row` dan `min-w-0`) meluber, dan tabel mata kuliah di `/courses` memaksa scroll horizontal alih-alih berubah menjadi tampilan kartu di mobile.
2. **[Tinggi] Redundansi Sub-Header vs Header Card di Setiap Halaman:**
   - `AppLayout.tsx` menampilkan banner sub-header (`<h1>`), lalu halaman `/courses`, `/tasks`, dan `/deadlines` langsung menampilkan kartu header putih (`<h2>`) dengan judul yang sama/mirip. Ini memboroskan ruang vertikal (*above the fold*) dan membingungkan hierarki.
3. **[Tinggi] Aksesibilitas Form & Elemen Interaktif Masih Kurang:**
   - Tidak ada `htmlFor`/`id` pada `<label>` form, kartu filter di `/deadlines` memakai `<div onClick>` (tidak ramah keyboard), modal tidak memiliki `role="dialog"` / *focus trap*, dan teks `text-slate-400` memiliki kontras rendah.
4. **[Sedang] Target Sentuh Terlalu Kecil di Mobile:**
   - Tombol aksi subtugas (`px-2.5 py-1`), checkbox (`20px`), dan tombol menu aksi (`p-1.5`) berada di bawah standar ukuran sentuh `44px`.
5. **[Sedang] Token Desain Tidak Terpakai & Class CSS Tidak Valid:**
   - Palet `brand-*` di `tailwind.config.js` diabaikan, dan class seperti `shadow-xs`, `backdrop-blur-xs`, serta `animate-in fade-in` tidak bekerja di Tailwind v3.4.17 tanpa plugin.
6. **[Sedang] Potensi Inkonsistensi Bahasa (Indonesia vs Inggris):**
   - Label antarmuka berbahasa Indonesia, tetapi nilai status/prioritas (`Todo`, `In Progress`, `Done`, `High`, `Medium`, `Low`) dan beberapa teks (`"Upcoming Deadlines"`, `"NIL"`) masih bercampur bahasa Inggris.
7. **[Rendah–Sedang] Pengalaman *Client-Side Loading* & Scroll Terpotong:**
   - Semua halaman melakukan fetch di client sehingga user selalu melihat layar `"Memproses Data"` setiap berpindah halaman. Selain itu, kotak `"Progres Subtugas"` di dashboard memiliki `max-h-[440px]` yang memotong kartu ke-4 secara visual tanpa indikator scroll yang jelas.
8. **[Rendah] Ketidakhadiran Ikon Visual yang Konsisten:**
   - Penggunaan teks `"NIL"` di `EmptyState`, karakter panah `&rarr;`, dan hanya 1 SVG titik tiga membuat tampilan terasa terlalu tekstual dan kurang *scannable* pada aksi cepat.

---

## 12. Pertanyaan Terbuka untuk Pemilik Website

1. **Arah Bahasa:** Apakah istilah `Todo`, `In Progress`, `Done`, dan `High/Medium/Low` ingin dipertahankan dalam bahasa Inggris, atau diterjemahkan penuh ke bahasa Indonesia di UI saat redesain?
2. **Arah Visual & Warna:** Token `brand.500` di `tailwind.config.js` diset ke `#0052FF` (biru elektrik), sedangkan UI saat ini memakai `blue-600` (`#2563EB`). Apakah redesain akan memakai `#0052FF` sebagai warna utama, atau bebas menentukan palet baru?
3. **Navigasi & Layout:** Apakah pendekatan *Top Navigation Bar* tanpa sidebar wajib dipertahankan pada redesain, atau boleh dieksplorasi pola navigasi lain (misalnya sidebar di desktop + bottom nav di mobile)?
4. **Banner Selamat Datang di Dashboard:** Apakah Hero Banner `"Selamat Datang di Sistem MyTask"` di `/` masih dibutuhkan, atau boleh diringkas agar metrik dan deadline langsung tampil di atas lipatan (*above the fold*)?
5. **Info Statis di Menu Mobile:** Pada dropdown mobile `AppLayout.tsx` terdapat teks hardcoded `"Status: In-Memory Storage"` dan `"Semester 5"`. Apakah info ini perlu dipertahankan, dibuat dinamis, atau dihapus?
6. **Pustaka Ikon:** Apakah boleh menambahkan pustaka ikon ringan seperti `lucide-react` pada saat implementasi redesain nanti?

