// Comprehensive E2E API and Business Logic Verification Script
const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log("=== MEMULAI PENGUJIAN OTOMATIS MYTASK ===");

  const timestamp = Date.now().toString().slice(-4);
  const testCode = `T${timestamp}`;

  // 1. Dashboard
  console.log("\n--- 1. UJI DASHBOARD ---");
  const dashRes = await request("/api/dashboard");
  assert(dashRes.status === 200, "GET /api/dashboard harus status 200");
  assert(dashRes.data?.data?.totalCourses >= 3, "Total courses minimal 3");
  assert(dashRes.data?.data?.totalTasks >= 5, "Total tasks minimal 5");
  assert(Array.isArray(dashRes.data?.data?.upcomingDeadlines), "upcomingDeadlines adalah array");
  assert(Array.isArray(dashRes.data?.data?.taskProgressList), "taskProgressList adalah array");

  // 2. Courses CRUD & Business Rules
  console.log("\n--- 2. UJI COURSES CRUD & ATURAN BISNIS ---");
  const coursesRes = await request("/api/courses");
  assert(coursesRes.status === 200, "GET /api/courses harus status 200");
  const initialCourses = coursesRes.data.data;
  assert(initialCourses.length >= 3, "Seed courses minimal 3 item");

  // Test Course Creation
  const newCoursePayload = {
    courseCode: testCode,
    courseName: "Mata Kuliah Pengujian Otomatis",
    lecturer: "Dr. Tester, M.Kom.",
    semester: "Semester 5",
  };
  const createCourseRes = await request("/api/courses", {
    method: "POST",
    body: JSON.stringify(newCoursePayload),
  });
  assert(createCourseRes.status === 201, "POST /api/courses berhasil status 201");
  const createdCourseId = createCourseRes.data.data.id;
  assert(createdCourseId !== undefined, "Course baru memiliki ID");

  // Test Duplicate Course Code Rejection (case-insensitive)
  const dupCourseRes = await request("/api/courses", {
    method: "POST",
    body: JSON.stringify({
      courseCode: testCode.toLowerCase(),
      courseName: "Duplikat Course",
      semester: "Semester 5",
    }),
  });
  assert(dupCourseRes.status === 409, "POST /api/courses menolak kode mata kuliah duplikat (409 Conflict)");

  // Test Get Course by ID
  const getCourseRes = await request(`/api/courses/${createdCourseId}`);
  assert(getCourseRes.status === 200, "GET /api/courses/[id] berhasil");
  assert(getCourseRes.data.data.courseCode === testCode, "Data kode mata kuliah sesuai");

  // Test Update Course
  const updateCourseRes = await request(`/api/courses/${createdCourseId}`, {
    method: "PUT",
    body: JSON.stringify({ courseName: "Mata Kuliah Pengujian Terupdate" }),
  });
  assert(updateCourseRes.status === 200, "PUT /api/courses/[id] berhasil (200)");
  assert(updateCourseRes.data.data.courseName === "Mata Kuliah Pengujian Terupdate", "Nama terupdate");

  // 3. Tasks CRUD & Business Rules
  console.log("\n--- 3. UJI TASKS CRUD & ATURAN BISNIS ---");
  // Test invalid courseId rejection
  const invalidTaskRes = await request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      courseId: "course-invalid-9999",
      title: "Tugas Invalid",
      deadline: "2026-12-01",
    }),
  });
  assert(invalidTaskRes.status === 400, "POST /api/tasks menolak courseId yang tidak valid (400)");

  // Test create task for createdCourseId
  const createTaskRes = await request("/api/tasks", {
    method: "POST",
    body: JSON.stringify({
      courseId: createdCourseId,
      title: "Tugas Proyek Cloud MyTask",
      description: "Deskripsi tugas proyek",
      deadline: "2026-11-20",
      priority: "High",
      status: "Todo",
    }),
  });
  assert(createTaskRes.status === 201, "POST /api/tasks berhasil (201)");
  const createdTaskId = createTaskRes.data.data.id;

  // Test deleting course when it has tasks (MUST BE REJECTED with 409)
  const delBlockedRes = await request(`/api/courses/${createdCourseId}`, {
    method: "DELETE",
  });
  assert(delBlockedRes.status === 409, "DELETE /api/courses/[id] ditolak saat masih memiliki tugas (409 Conflict)");

  // Test Filter Tasks by courseId
  const filterCourseRes = await request(`/api/tasks?courseId=${createdCourseId}`);
  assert(filterCourseRes.status === 200 && filterCourseRes.data.data.length === 1, "Filter tasks by courseId bekerja");

  // Test Filter Tasks by priority
  const filterPriorityRes = await request(`/api/tasks?priority=High`);
  assert(filterPriorityRes.status === 200 && filterPriorityRes.data.data.every(t => t.priority === "High"), "Filter tasks by priority bekerja");

  // Test Update Task
  const updateTaskRes = await request(`/api/tasks/${createdTaskId}`, {
    method: "PUT",
    body: JSON.stringify({
      status: "In Progress",
      priority: "Medium",
    }),
  });
  assert(updateTaskRes.status === 200, "PUT /api/tasks/[id] berhasil (200)");
  assert(updateTaskRes.data.data.status === "In Progress", "Status task berubah ke In Progress");

  // 4. Subtasks CRUD & Progress Tracking
  console.log("\n--- 4. UJI SUBTASKS CRUD & PROGRESS TRACKING ---");
  // Check initial progress when no subtask (progressPercentage must be null / 'Belum ada subtugas')
  const taskNoSubRes = await request(`/api/tasks/${createdTaskId}`);
  assert(taskNoSubRes.data.data.progressPercentage === null, "Tugas tanpa subtugas mengembalikan progressPercentage null");

  // Create Subtask 1
  const createSub1 = await request(`/api/tasks/${createdTaskId}/subtasks`, {
    method: "POST",
    body: JSON.stringify({ title: "Subtugas Tahap 1", status: "Todo" }),
  });
  assert(createSub1.status === 201, "POST /api/tasks/[id]/subtasks berhasil (201)");
  const sub1Id = createSub1.data.data.id;

  // Create Subtask 2
  const createSub2 = await request(`/api/tasks/${createdTaskId}/subtasks`, {
    method: "POST",
    body: JSON.stringify({ title: "Subtugas Tahap 2", status: "Done" }),
  });
  assert(createSub2.status === 201, "POST subtask ke-2 berhasil (201)");
  const sub2Id = createSub2.data.data.id;

  // Verify progress is 50% (1 of 2 done)
  const taskProgressRes = await request(`/api/tasks/${createdTaskId}`);
  assert(taskProgressRes.data.data.progressPercentage === 50, "Progress task 50% setelah 1 dari 2 subtugas Done");
  assert(taskProgressRes.data.data.totalSubtasks === 2, "totalSubtasks adalah 2");
  assert(taskProgressRes.data.data.completedSubtasks === 1, "completedSubtasks adalah 1");

  // Update Subtask 1 to Done
  const updateSub1 = await request(`/api/subtasks/${sub1Id}`, {
    method: "PUT",
    body: JSON.stringify({ status: "Done" }),
  });
  assert(updateSub1.status === 200, "PUT /api/subtasks/[id] berhasil");

  // Verify progress is now 100% (2 of 2 done)
  const taskProgress100 = await request(`/api/tasks/${createdTaskId}`);
  assert(taskProgress100.data.data.progressPercentage === 100, "Progress task 100% setelah semua subtugas Done");

  // Delete Subtask 2
  const delSub2 = await request(`/api/subtasks/${sub2Id}`, { method: "DELETE" });
  assert(delSub2.status === 200, "DELETE /api/subtasks/[id] berhasil");

  // 5. Cascade Delete of Tasks & Subtasks
  console.log("\n--- 5. UJI CASCADE DELETE & PENGHAPUSAN COURSE ---");
  // Delete the task
  const delTaskRes = await request(`/api/tasks/${createdTaskId}`, { method: "DELETE" });
  assert(delTaskRes.status === 200, "DELETE /api/tasks/[id] berhasil");

  // Verify subtask 1 was cascade deleted by checking getSubtasks on the deleted task (should return 404)
  const checkSub1 = await request(`/api/tasks/${createdTaskId}/subtasks`);
  assert(checkSub1.status === 404, "Subtugas ikut terhapus saat tugas dihapus (cascade delete)");

  // Now course has no tasks, deleting course must succeed
  const delCourseRes = await request(`/api/courses/${createdCourseId}`, { method: "DELETE" });
  assert(delCourseRes.status === 200, "DELETE /api/courses/[id] berhasil setelah tugasnya dihapus");

  // 6. Test Frontend HTML Pages Status
  console.log("\n--- 6. UJI HALAMAN FRONTEND (HTML RENDERING) ---");
  const pages = ["/", "/courses", "/tasks", "/deadlines"];
  for (const page of pages) {
    const pageRes = await fetch(`${BASE_URL}${page}`);
    assert(pageRes.status === 200, `Halaman ${page} mengembalikan status 200 OK`);
  }

  console.log(`\n=== HASIL AKHIR: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
