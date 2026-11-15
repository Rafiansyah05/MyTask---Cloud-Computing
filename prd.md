# Product Requirements Document (PRD)

## Student Task Management System

**Dokumen:** PRD untuk implementasi aplikasi web\
**Versi:** 1.0\
**Status:** Ready for implementation\
**Bahasa antarmuka:** Bahasa Indonesia\
**Target:** Tugas 9 --- Komputasi Awan dan Terdistribusi (CAK3EAB3)

------------------------------------------------------------------------

## 1. Ringkasan Produk

Student Task Management System adalah aplikasi web untuk membantu
mahasiswa mengelola mata kuliah, tugas perkuliahan, subtugas, tenggat
waktu, prioritas, dan progres pengerjaan dalam satu tempat.

Aplikasi dibuat sebagai proyek pembelajaran dengan arsitektur Next.js.
React digunakan untuk membangun frontend, sedangkan Node.js digunakan
sebagai runtime backend melalui Next.js Route Handlers/API Routes.
Aplikasi tidak menggunakan database. Data disimpan sementara pada
struktur data JavaScript (in-memory object/array) yang diinisialisasi
dari data seed.

## 2. Latar Belakang dan Masalah

Mahasiswa dapat menerima tugas dari berbagai mata kuliah dengan tenggat
waktu dan tingkat prioritas yang berbeda. Ketika informasi tugas
tersebar di berbagai media, mahasiswa dapat kesulitan melihat seluruh
beban tugas, menentukan pekerjaan yang perlu didahulukan, dan memantau
progres penyelesaian.

Aplikasi ini menyediakan satu tempat untuk mencatat mata kuliah,
mengelola tugas, memecah tugas menjadi subtugas, dan memantau deadline
serta progres pengerjaan.

## 3. Tujuan Produk

1.  Memungkinkan mahasiswa mengelola data mata kuliah.
2.  Memungkinkan mahasiswa melakukan CRUD tugas perkuliahan.
3.  Memungkinkan mahasiswa memecah tugas menjadi subtugas dan mengelola
    statusnya.
4.  Menampilkan ringkasan aktivitas akademik melalui dashboard.
5.  Membantu mahasiswa melihat tugas berdasarkan mata kuliah, status,
    prioritas, dan deadline.

### 3.1 Bukan Tujuan (Out of Scope)

-   Login, registrasi, autentikasi, dan role pengguna.
-   Integrasi dengan LMS kampus, Google Classroom, kalender eksternal,
    atau email.
-   Kolaborasi banyak pengguna.
-   Notifikasi push atau pengiriman pengingat otomatis.
-   AI, rekomendasi belajar, atau analitik prediktif.
-   Database atau penyimpanan permanen.
-   Upload file/lampiran tugas.

## 4. Target Pengguna

**Mahasiswa** yang ingin mengatur mata kuliah dan tugas akademiknya
secara mandiri.

Aplikasi diasumsikan digunakan oleh satu pengguna pada satu sesi/demo.
Tidak ada pemisahan data antar akun.

## 5. Ruang Lingkup Fitur

### 5.1 Dashboard

-   Menampilkan jumlah seluruh mata kuliah.
-   Menampilkan jumlah seluruh tugas.
-   Menampilkan jumlah tugas yang belum selesai dan yang selesai.
-   Menampilkan daftar deadline terdekat.
-   Menampilkan ringkasan progres tugas berdasarkan subtugas yang
    selesai.
-   Menyediakan tautan cepat menuju halaman Courses dan Tasks.

### 5.2 Course Management

Pengguna dapat: - Melihat daftar mata kuliah. - Menambahkan mata
kuliah. - Melihat detail mata kuliah. - Mengubah data mata kuliah. -
Menghapus mata kuliah.

Data mata kuliah: - Kode mata kuliah. - Nama mata kuliah. - Nama dosen
(opsional). - Semester.

Aturan: - Kode mata kuliah wajib diisi dan tidak boleh duplikat. - Nama
mata kuliah wajib diisi. - Mata kuliah yang masih memiliki tugas tidak
dapat dihapus. Tampilkan pesan agar pengguna menghapus atau memindahkan
tugas terlebih dahulu.

### 5.3 Task Management

Pengguna dapat: - Melihat seluruh tugas. - Menambahkan tugas. - Melihat
detail tugas. - Mengubah tugas. - Menghapus tugas. - Memfilter tugas
berdasarkan mata kuliah, status, dan prioritas. - Mengurutkan tugas
berdasarkan deadline terdekat.

Data tugas: - Mata kuliah terkait. - Judul. - Deskripsi (opsional). -
Deadline. - Prioritas: Low, Medium, High. - Status: Todo, In Progress,
Done.

Aturan: - Tugas wajib terhubung ke satu mata kuliah yang valid. - Judul
dan deadline wajib diisi. - Status default adalah `Todo`. - Prioritas
default adalah `Medium`. - Saat tugas dihapus, seluruh subtugas yang
terkait ikut dihapus (cascade delete). - Deadline disimpan dan
ditampilkan dengan format tanggal yang konsisten.

### 5.4 Subtask Management

Pengguna dapat: - Melihat subtugas pada halaman detail tugas. -
Menambahkan subtugas. - Mengubah judul subtugas. - Mengubah status
subtugas menjadi belum selesai atau selesai. - Menghapus subtugas.

Data subtugas: - Tugas terkait. - Judul. - Status: Todo atau Done.

Aturan: - Subtugas wajib terhubung ke tugas yang valid. - Judul subtugas
wajib diisi. - Status default adalah `Todo`. - Subtask hanya dapat
dibuat, diedit, atau dihapus dari konteks tugas induknya.

### 5.5 Course-Based Task View

-   Pengguna dapat memilih mata kuliah.
-   Sistem menampilkan tugas yang terhubung dengan mata kuliah tersebut.
-   Tampilkan empty state jika belum ada tugas.

### 5.6 Task Progress Tracking

-   Progress dihitung dari jumlah subtugas berstatus `Done` dibagi total
    subtugas.
-   Tampilkan progress dalam persentase dan progress bar.
-   Jika tugas belum memiliki subtugas, tampilkan `Belum ada subtugas`,
    bukan 0% seolah-olah ada pekerjaan yang sudah dirinci.
-   Status tugas (`Todo`, `In Progress`, `Done`) tetap dikelola secara
    eksplisit oleh pengguna dan tidak otomatis diubah berdasarkan
    subtugas.

### 5.7 Upcoming Deadlines

-   Tampilkan tugas yang belum berstatus `Done`.
-   Urutkan dari deadline paling dekat.
-   Tampilkan nama tugas, mata kuliah, tanggal deadline, prioritas, dan
    status.
-   Beri penanda visual untuk deadline yang sudah lewat dan deadline
    dalam 3 hari ke depan.
-   Jangan membuat notifikasi browser atau email.

## 6. Entitas dan Model Data

Gunakan tiga entitas utama berikut. Semua data dikelola pada backend
menggunakan array/object JavaScript, bukan database.

### 6.1 Course

``` ts
type Course = {
  id: string;
  courseCode: string;
  courseName: string;
  lecturer: string;
  semester: string;
  createdAt: string;
  updatedAt: string;
};
```

### 6.2 Task

``` ts
type TaskStatus = "Todo" | "In Progress" | "Done";
type TaskPriority = "Low" | "Medium" | "High";

type Task = {
  id: string;
  courseId: string;
  title: string;
  description: string;
  deadline: string; // ISO date: YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
};
```

### 6.3 Subtask

``` ts
type SubtaskStatus = "Todo" | "Done";

type Subtask = {
  id: string;
  taskId: string;
  title: string;
  status: SubtaskStatus;
  createdAt: string;
  updatedAt: string;
};
```

### 6.4 Relasi

-   Satu Course memiliki banyak Task (one-to-many).
-   Satu Task memiliki banyak Subtask (one-to-many).
-   Setiap Task harus memiliki `courseId` yang mengacu ke Course yang
    ada.
-   Setiap Subtask harus memiliki `taskId` yang mengacu ke Task yang
    ada.

### 6.5 Data Seed

Sediakan data awal agar aplikasi langsung terlihat berfungsi setelah
dijalankan: - Minimal 3 mata kuliah. - Minimal 5 tugas yang tersebar
pada mata kuliah tersebut. - Minimal 2 subtugas untuk beberapa tugas.

Gunakan contoh data akademik yang masuk akal dan tidak memakai data
pribadi. Pastikan seluruh foreign key pada data seed valid.

## 7. Persyaratan CRUD

CRUD wajib tersedia untuk **setiap entitas**.

  ---------------------------------------------------------------------------
  Entitas        Create         Read           Update          Delete
  -------------- -------------- -------------- --------------- --------------
  Courses        Tambah mata    Daftar dan     Edit mata       Hapus jika
                 kuliah         detail mata    kuliah          tidak memiliki
                                kuliah                         tugas

  Tasks          Tambah tugas   Daftar dan     Edit            Hapus beserta
                 pada mata      detail tugas   detail/status   subtugas
                 kuliah                        tugas           

  Subtasks       Tambah         Daftar         Edit            Hapus subtugas
                 subtugas pada  subtugas       judul/status    
                 tugas                                         
  ---------------------------------------------------------------------------

Semua aksi CRUD harus benar-benar mengubah state backend, bukan hanya
mengubah tampilan frontend.

## 8. Persyaratan Teknis

### 8.1 Tech Stack

-   **Framework:** Next.js (App Router).
-   **Frontend:** React + TypeScript.
-   **Backend:** Node.js melalui Next.js Route Handlers
    (`app/api/**/route.ts`).
-   **Styling:** Tailwind CSS.
-   **Icons:** Lucide React (opsional).
-   **Data storage:** In-memory JavaScript arrays/objects yang
    diinisialisasi dari seed data.
-   **Package manager:** npm.

Jangan membuat backend Express terpisah. Satu aplikasi Next.js sudah
mencakup frontend React dan backend Node.js.

### 8.2 Ketentuan Penyimpanan Data

-   Dilarang menggunakan database apa pun (termasuk SQLite, PostgreSQL,
    MongoDB, Supabase, Firebase, Prisma, atau ORM lain).
-   Jangan menggunakan `localStorage` sebagai sumber data utama.
-   Backend menyimpan data dalam in-memory store berbentuk array/object.
-   Untuk menghindari data store ter-reset akibat hot reload saat
    development, simpan singleton store pada `globalThis` dengan pola
    yang aman untuk TypeScript.
-   Data akan kembali ke seed awal ketika proses server dihentikan atau
    dijalankan ulang. Ini merupakan batasan yang disengaja karena tugas
    mensyaratkan tanpa database.
-   Jangan mengklaim data tersimpan permanen.
-   Karena data berada di memori proses Node.js, jalankan satu instance
    aplikasi untuk demo CRUD. Beberapa instance backend tidak otomatis
    berbagi data.

### 8.3 Arsitektur

``` text
Browser
  |
  | React UI
  v
Next.js App Router
  |
  | HTTP fetch
  v
Next.js Route Handlers (Node.js runtime)
  |
  v
In-memory Store (JavaScript arrays/objects)
```

Semua API harus menggunakan Node.js runtime, bukan Edge Runtime.

### 8.4 Standar Implementasi

-   Gunakan TypeScript.
-   Gunakan App Router.
-   Pisahkan komponen UI, tipe data, validasi, dan data store.
-   Gunakan `crypto.randomUUID()` atau helper ID yang tersedia di
    Node.js untuk membuat ID.
-   Validasi input di backend meskipun frontend juga melakukan validasi.
-   Kembalikan HTTP status code yang sesuai.
-   Tangani loading, error, dan empty state pada frontend.
-   Hindari duplikasi logika bisnis.
-   Jangan menambahkan dependensi atau layanan eksternal yang tidak
    dibutuhkan.

## 9. API Requirements

Buat REST API berikut. Semua endpoint mengembalikan JSON.

### 9.1 Courses

  -----------------------------------------------------------------------
  Method                  Endpoint                Keterangan
  ----------------------- ----------------------- -----------------------
  GET                     `/api/courses`          Mengambil seluruh mata
                                                  kuliah

  POST                    `/api/courses`          Membuat mata kuliah

  GET                     `/api/courses/[id]`     Mengambil detail mata
                                                  kuliah

  PUT                     `/api/courses/[id]`     Mengubah mata kuliah

  DELETE                  `/api/courses/[id]`     Menghapus mata kuliah
                                                  jika tidak memiliki
                                                  tugas
  -----------------------------------------------------------------------

Contoh body POST/PUT:

``` json
{
  "courseCode": "IF123",
  "courseName": "Komputasi Awan",
  "lecturer": "Dosen A",
  "semester": "Semester 5"
}
```

### 9.2 Tasks

  -----------------------------------------------------------------------
  Method                  Endpoint                Keterangan
  ----------------------- ----------------------- -----------------------
  GET                     `/api/tasks`            Mengambil seluruh
                                                  tugas; dukung query
                                                  opsional `courseId`,
                                                  `status`, `priority`

  POST                    `/api/tasks`            Membuat tugas

  GET                     `/api/tasks/[id]`       Mengambil detail tugas

  PUT                     `/api/tasks/[id]`       Mengubah tugas

  DELETE                  `/api/tasks/[id]`       Menghapus tugas dan
                                                  subtugas terkait
  -----------------------------------------------------------------------

Contoh body POST/PUT:

``` json
{
  "courseId": "course-id",
  "title": "Mengerjakan Tugas 9",
  "description": "Membuat aplikasi manajemen tugas",
  "deadline": "2026-11-25",
  "priority": "High",
  "status": "Todo"
}
```

### 9.3 Subtasks

  --------------------------------------------------------------------------------
  Method                  Endpoint                         Keterangan
  ----------------------- -------------------------------- -----------------------
  GET                     `/api/tasks/[taskId]/subtasks`   Mengambil subtugas dari
                                                           suatu tugas

  POST                    `/api/tasks/[taskId]/subtasks`   Membuat subtugas untuk
                                                           suatu tugas

  PUT                     `/api/subtasks/[id]`             Mengubah subtugas

  DELETE                  `/api/subtasks/[id]`             Menghapus subtugas
  --------------------------------------------------------------------------------

Contoh body POST:

``` json
{
  "title": "Membuat rancangan frontend",
  "status": "Todo"
}
```

### 9.4 Dashboard

  -----------------------------------------------------------------------
  Method                  Endpoint                Keterangan
  ----------------------- ----------------------- -----------------------
  GET                     `/api/dashboard`        Mengambil ringkasan
                                                  jumlah course, task,
                                                  status task, deadline
                                                  terdekat, dan progres

  -----------------------------------------------------------------------

### 9.5 Format Respons API

Respons sukses menggunakan format konsisten:

``` json
{
  "data": {},
  "message": "Request berhasil"
}
```

Respons error:

``` json
{
  "error": {
    "message": "Mata kuliah tidak ditemukan"
  }
}
```

Gunakan status code: - `200` untuk GET/PUT/DELETE berhasil. - `201`
untuk POST berhasil. - `400` untuk input tidak valid. - `404` untuk data
tidak ditemukan. - `409` untuk konflik, misalnya kode mata kuliah
duplikat atau mata kuliah masih memiliki tugas. - `500` untuk kesalahan
server yang tidak terduga.

## 10. Persyaratan Halaman dan UI

Gunakan tampilan dashboard yang bersih, modern, responsif, dan mudah
dipahami. Prioritaskan keterbacaan dan fungsi daripada dekorasi.

### 10.1 Global Layout

-   Sidebar navigasi pada desktop.
-   Navigasi yang tetap mudah digunakan pada layar mobile.
-   Header berisi nama halaman dan judul aplikasi.
-   Konten utama memiliki jarak dan hierarki visual yang konsisten.
-   Gunakan Bahasa Indonesia untuk label, tombol, pesan validasi, dan
    empty state.

Menu navigasi: 1. Dashboard 2. Mata Kuliah 3. Tugas 4. Deadline

### 10.2 Dashboard (`/`)

Komponen: - Kartu total mata kuliah. - Kartu total tugas. - Kartu tugas
belum selesai. - Kartu tugas selesai. - Daftar deadline terdekat. -
Ringkasan progres tugas.

### 10.3 Mata Kuliah (`/courses`)

Komponen: - Tabel atau daftar mata kuliah. - Tombol Tambah Mata
Kuliah. - Form tambah/edit. - Aksi detail, edit, dan hapus. - Konfirmasi
sebelum menghapus.

### 10.4 Tugas (`/tasks`)

Komponen: - Daftar tugas. - Filter mata kuliah. - Filter status. -
Filter prioritas. - Pengurutan berdasarkan deadline. - Tombol Tambah
Tugas. - Form tambah/edit. - Tautan menuju detail tugas.

### 10.5 Detail Tugas (`/tasks/[id]`)

Komponen: - Informasi tugas dan mata kuliah. - Deadline, prioritas, dan
status. - Daftar subtugas. - Form tambah subtugas. - Aksi edit dan hapus
subtugas. - Progress bar berdasarkan subtugas selesai.

### 10.6 Deadline (`/deadlines`)

Komponen: - Daftar tugas yang belum selesai. - Urutan deadline
terdekat. - Penanda deadline lewat dan deadline dalam 3 hari. - Nama
mata kuliah dan prioritas.

### 10.7 Komponen dan Interaksi

-   Gunakan dialog/modal atau halaman form untuk create dan update.
-   Tampilkan feedback sukses atau gagal setelah operasi.
-   Tombol hapus harus meminta konfirmasi.
-   Tombol submit dinonaktifkan ketika request sedang diproses.
-   Form menampilkan validasi field yang jelas.
-   Semua halaman harus memiliki loading state, error state, dan empty
    state yang sesuai.

## 11. Aturan Bisnis dan Validasi

1.  `courseCode`, `courseName`, dan `semester` wajib diisi. `lecturer`
    boleh kosong.
2.  `courseCode` harus unik (case-insensitive).
3.  Task harus memiliki `courseId` yang valid.
4.  Task harus memiliki `title` dan `deadline`.
5.  `priority` hanya menerima `Low`, `Medium`, atau `High`.
6.  `status` task hanya menerima `Todo`, `In Progress`, atau `Done`.
7.  Subtask harus memiliki `taskId` yang valid dan `title` yang tidak
    kosong.
8.  Status subtask hanya menerima `Todo` atau `Done`.
9.  Course tidak dapat dihapus jika masih memiliki task.
10. Menghapus task juga menghapus semua subtask terkait.
11. Persentase progres task dihitung dari subtasks berstatus `Done`.
12. Jika tidak ada subtask, progres ditampilkan sebagai belum tersedia.
13. Semua operasi mutasi dilakukan di backend dan hasil terbaru
    ditampilkan kembali di frontend.

## 12. Struktur Folder yang Disarankan

``` text
student-task-management/
├── app/
│   ├── api/
│   │   ├── courses/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── tasks/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── [taskId]/subtasks/route.ts
│   │   ├── subtasks/
│   │   │   └── [id]/route.ts
│   │   └── dashboard/route.ts
│   ├── courses/page.tsx
│   ├── tasks/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── deadlines/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── courses/
│   ├── tasks/
│   └── ui/
├── lib/
│   ├── api.ts
│   ├── store.ts
│   ├── seed.ts
│   ├── validations.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── public/
├── package.json
├── tsconfig.json
└── README.md
```

Struktur ini merupakan panduan. Agent boleh menyesuaikan detail struktur
selama seluruh fitur dan endpoint tetap tersedia dan tidak membuat
arsitektur yang lebih kompleks dari kebutuhan.

## 13. Kriteria Penerimaan (Acceptance Criteria)

Aplikasi dinyatakan memenuhi kebutuhan apabila:

### Course

-   [ ] Pengguna dapat melihat daftar mata kuliah.
-   [ ] Pengguna dapat menambahkan mata kuliah.
-   [ ] Pengguna dapat mengubah mata kuliah.
-   [ ] Pengguna dapat menghapus mata kuliah yang tidak memiliki tugas.
-   [ ] Sistem menolak kode mata kuliah duplikat.
-   [ ] Sistem menolak penghapusan mata kuliah yang masih memiliki
    tugas.

### Task

-   [ ] Pengguna dapat melihat daftar tugas.
-   [ ] Pengguna dapat menambahkan tugas pada mata kuliah.
-   [ ] Pengguna dapat mengubah judul, deskripsi, deadline, prioritas,
    dan status.
-   [ ] Pengguna dapat menghapus tugas.
-   [ ] Sistem menolak task dengan course yang tidak valid.
-   [ ] Penghapusan task ikut menghapus subtasks terkait.
-   [ ] Filter mata kuliah, status, dan prioritas berfungsi.

### Subtask

-   [ ] Pengguna dapat melihat subtugas pada detail tugas.
-   [ ] Pengguna dapat menambahkan subtugas.
-   [ ] Pengguna dapat mengubah judul dan status subtugas.
-   [ ] Pengguna dapat menghapus subtugas.
-   [ ] Progress task berubah sesuai jumlah subtugas yang selesai.

### Dashboard dan Deadline

-   [ ] Dashboard menampilkan angka yang sesuai dengan data backend.
-   [ ] Deadline menampilkan tugas belum selesai dan diurutkan dari yang
    terdekat.
-   [ ] Penanda deadline lewat dan mendekat bekerja dengan benar.

### Teknis

-   [ ] Aplikasi dapat dijalankan secara lokal dengan `npm install` dan
    `npm run dev`.
-   [ ] `npm run build` berhasil tanpa error TypeScript/build.
-   [ ] Semua endpoint menggunakan backend Next.js dengan Node.js
    runtime.
-   [ ] Tidak ada database atau layanan penyimpanan eksternal.
-   [ ] Data seed tampil pada saat pertama kali aplikasi dijalankan.
-   [ ] CRUD dilakukan melalui API backend, bukan hanya state lokal
    frontend.
-   [ ] README menjelaskan instalasi, cara menjalankan aplikasi, fitur,
    API, dan batasan penyimpanan in-memory.

## 14. Instruksi Eksekusi untuk Coding Agent

Implementasikan aplikasi berdasarkan PRD ini dengan urutan berikut:

1.  Periksa direktori kerja dan kondisi repository sebelum mengubah
    file. Jika belum ada proyek Next.js, buat proyek baru menggunakan
    Next.js App Router, TypeScript, dan Tailwind CSS.
2.  Implementasikan tipe data, seed data, in-memory store singleton, dan
    fungsi validasi terlebih dahulu.
3.  Implementasikan seluruh API Route Handlers untuk Courses, Tasks,
    Subtasks, dan Dashboard.
4.  Implementasikan layout dan halaman frontend.
5.  Hubungkan seluruh interaksi frontend ke API backend menggunakan
    `fetch`.
6.  Implementasikan loading, error, empty state, validasi, dan
    konfirmasi penghapusan.
7.  Jalankan lint/typecheck yang tersedia dan `npm run build`. Perbaiki
    error sampai berhasil.
8.  Uji alur CRUD untuk ketiga entitas dan validasi relasinya.
9.  Buat atau perbarui README dengan instruksi menjalankan aplikasi.
10. Laporkan file penting yang dibuat, endpoint yang tersedia, hasil
    build, pengujian yang dilakukan, dan batasan bahwa data akan reset
    ketika server restart.

### Batasan untuk Agent

-   Jangan berhenti setelah membuat mockup atau UI statis.
-   Jangan membuat tombol yang tidak memiliki fungsi.
-   Jangan mengganti in-memory store dengan database.
-   Jangan menambahkan autentikasi atau fitur di luar scope.
-   Jangan menggunakan Express atau backend service terpisah.
-   Jangan menyatakan pengujian berhasil jika perintahnya belum
    benar-benar dijalankan.
-   Jika menemukan konflik antara implementasi dan PRD, prioritaskan
    persyaratan PRD dan jelaskan perubahan yang diperlukan.

------------------------------------------------------------------------

## 15. Catatan Batasan Sistem

Karena aplikasi tidak menggunakan database, data hanya berada di memori
proses Node.js. Data akan kembali ke seed awal ketika server dimulai
ulang dan tidak otomatis dibagikan antar beberapa instance backend.
Untuk demonstrasi tugas, jalankan satu instance aplikasi. Batasan ini
harus dijelaskan dalam laporan agar tidak menimbulkan klaim bahwa
aplikasi memiliki penyimpanan permanen atau mendukung horizontal scaling
dengan state yang konsisten.
