# RAIMES — Software Testing Plan

Tanggal: 17 November 2025

Versi: 1.0

Pengarang: Tim RAIMES

---

## 1. Tujuan

Dokumen ini mendeskripsikan rencana pengujian untuk proyek RAIMES (Responsible AI Mining Evaluation System). Tujuan utamanya:

- Menetapkan cakupan pengujian, jenis pengujian yang dibutuhkan, lingkungan, dan alat.
- Menyediakan strategi praktis untuk memverifikasi kualitas fungsional dan non-fungsional sistem.
- Memberi panduan bagi kontributor untuk membuat dan menjalankan tes.

## 2. Ruang Lingkup

Pengujian akan mencakup komponen-komponen utama berikut:

- Frontend React (folder `frontend/src`) — halaman publik (Landing), autentikasi (Login/Register), dashboard, manajemen kuisioner, hasil assessment.
- Backend TypeScript/Node (folder `backend/src`) — API (auth, registration, question/ questionnaire, assessment endpoints), database integration.
- Layanan AI (folder `backend/src/ai_service`) — modul Python yang melakukan validasi, pemrosesan bukti, dan scoring.
- Integrasi antara frontend, backend, dan penyimpanan berkas (`uploads`) termasuk alur pendaftaran akun dan manajemen permintaan.

Area yang tidak termasuk: integrasi 3rd-party non-API yang belum dikontrak, deployment ke lingkungan produksi (deployment testing ditangani terpisah).

## 3. Jenis Pengujian

1. Unit Testing
   - Target: fungsi dan modul kecil (React components, utility functions, TS controllers, Python functions).
   - Tools rekomendasi: `Jest` + `React Testing Library` untuk frontend; `Jest`/`ts-jest` atau `Vitest` untuk backend TS; `pytest` untuk modul Python.

2. Integration Testing
   - Target: integrasi antar modul (mis. controller ↔ database, API ↔ service layer).
   - Tools: `Supertest` (Node) untuk endpoint API; `pytest` dengan fixtures untuk modul Python; `msw` untuk mocking network pada frontend when appropriate.

3. End-to-End (E2E) Testing
   - Target: jalur pengguna utama (register → email/approval → login → submit questionnaire → view assessment).
   - Tools: `Cypress` (direkomendasikan) atau `Playwright`.

4. API Contract Testing
   - Target: endpoint API stabilitas/kontrak (status code, schema fields).
   - Tools: `Supertest` dan/atau `Postman` + `newman` untuk collection-based checks.

5. Static Analysis / Linters
   - Target: kualitas kode, style, potensi bug.
   - Tools: `ESLint`, `TypeScript` (kompilasi cek), `flake8`/`pylint` untuk Python.

6. Security Testing ( dasar )
   - Target: cek injeksi SQL, validasi input, otorisasi pada endpoints penting.
   - Tools: manual review, `npm audit`, dependency scanning, dan request fuzzing/endpoint pengetesan sederhana.

7. Performance Smoke Tests
   - Target: beban ringan pada endpoint kritis (mis. login, submit assessment)
   - Tools: `k6` atau `autocannon` sebagai smoke-performance checks di staging.

## 4. Kriteria Masuk / Keluar

- Kriteria Masuk (Entry):
  - Fitur telah diimplementasikan dan melewati code review.
  - Branch atau PR berisi deskripsi perubahan dan langkah untuk mereproduksi secara lokal.
  - Lingkungan test (dev/staging) tersedia.

- Kriteria Keluar (Exit):
  - Semua test unit dan integration pada modul terkait lulus (atau ada pengecualian yang disetujui).
  - E2E untuk alur utama lulus pada staging.
  - Tidak ada blokir kritis/security issues yang tidak diatasi.

## 5. Lingkungan Pengujian

- Lokasi: development (local), CI (GitHub Actions), staging (jika tersedia).
- Database: gunakan database test terpisah; untuk integrasi gunakan database lokal/postgres container atau Supabase test database.
- Environment variables: gunakan file `.env.test`/CI secrets.
- File uploads: gunakan storage lokal sementara atau mocking (tidak menulis ke bucket produksi).

## 6. Tools & Frameworks yang Direkomendasikan

- Frontend
  - `Jest` + `React Testing Library` — component/unit tests
  - `Cypress` — E2E tests

- Backend (Node/TypeScript)
  - `Jest` / `Vitest` + `ts-jest` — unit tests
  - `Supertest` — integration tests for express endpoints

- AI (Python)
  - `pytest` — unit & integration tests for `ai_service` modules
  - virtualenv atau conda pada CI untuk environment Python

- CI / Automation
  - `GitHub Actions` — menjalankan lint, unit tests, dan E2E (mungkin in headless mode)
  - `Dependabot` atau security scanning untuk dependency

- Lainnya
  - `ESLint`, `Prettier`
  - `Docker` untuk menjalankan DB/stack test jika diperlukan

## 7. Strategi Penulisan Tes

- Prioritaskan: critical flows (auth, registration approval, questionnaire submission, scoring, file upload).
- Setiap fitur baru wajib disertai unit tests dan integration tests minimal.
- Untuk UI, tulis tests untuk:
  - Render komponen utama (smoke)
  - Interaksi user utama (form fills, navigation)
- Gunakan mocks untuk external APIs. Untuk AI modules, gunakan fixtures data untuk memverifikasi keluaran deterministik.

## 8. Mapping Fitur → Test Types (Contoh)

- Auth (login/register)
  - Unit: validator input
  - Integration: controller ↔ db
  - E2E: user register → admin approve → login

- Registration Requests
  - Unit: business rules
  - Integration: file upload flow, DB insert
  - E2E: submit request → admin view → approve

- Questionnaire / Questions
  - Unit: scoring logic
  - Integration: question CRUD endpoints

- Assessment & Scoring (AI service)
  - Unit (Python): scoring logic functions
  - Integration: validate end-to-end scoring pipeline (sample inputs → expected outputs)

- Frontend Landing Page & Dashboard
  - Unit: key presentational components
  - Integration/E2E: navigation from landing → register → dashboard

## 9. Contoh Kasus Uji (Sample Test Cases)

1. Auth - Register (E2E)
   - Langkah: buka `/register`, isi form valid, submit → verifikasi permintaan tersimpan dan email/notification (mock) dikirim.
   - Ekspektasi: response success, item terlihat di `admin/account-requests`.

2. API - POST `/api/auth/login` (integration)
   - Langkah: panggil endpoint dengan credentials valid.
   - Ekspektasi: status 200, body mengandung `token` dan `user` object.

3. AI Module - scoring_service.py (unit)
   - Langkah: jalankan fungsi scoring terhadap fixture input.
   - Ekspektasi: return score sesuai range dan tipe data yang benar.

4. Frontend - Landing page render (unit)
   - Langkah: render `LandingPage` component.
   - Ekspektasi: title, CTA buttons, dan 4 stats terlihat.

5. File Upload (integration)
   - Langkah: submit account request dengan file mock.
   - Ekspektasi: file disimpan ke path `uploads/account-requests` (atau: mock verification) dan DB entry dibuat.

## 10. CI / Pipeline Example (GitHub Actions - rekomendasi singkat)

- Workflow steps:
  1. Checkout code
  2. Setup Node.js & Python runtimes
  3. Install dependencies for frontend and backend
  4. Run `lint` (ESLint)
  5. Run unit tests (frontend + backend + python)
  6. Run integration tests (backend) — menggunakan test DB container
  7. Optionally run E2E tests with `Cypress` in headless mode

Contoh (ringkas):

- `/.github/workflows/ci.yml` (disarankan): jalankan lint → unit tests → build → cypress (opsional pada branch `main`).

## 11. Test Data & Fixtures

- Simpan fixtures JSON di `tests/fixtures/` atau di masing-masing paket (`frontend/tests/fixtures`, `backend/tests/fixtures`, `backend/ai_service/tests/fixtures`).
- Contoh fixture: sample questionnaire responses, sample sensor readings untuk scoring, sample user object.

## 12. Pelaporan dan Pelacakan Bug

- Gunakan GitHub Issues untuk pelaporan bug; beri label `bug`, `test-failure`, `regression` sesuai kategori.
- Tes yang gagal di CI harus membuka issue otomatis (via Actions) atau mengaitkan ke PR.

## 13. Tanggung Jawab

- Developer: menulis unit tests untuk kode yang mereka tambahkan/ubah.
- QA / Reviewer: meninjau E2E test cases, memverifikasi integrasi di staging.
- DevOps: menyiapkan environment staging, database test, dan secrets untuk CI.

## 14. Jadwal & Prioritas

- Fase awal (sprint berikutnya):
  1. Sediakan setup test untuk backend (Jest + Supertest) dan Python (pytest).
  2. Tambahkan unit tests untuk endpoints kritis (auth, registration).
  3. Tambahkan beberapa E2E flows paling penting (register → approval → login).

- Prioritas fitur per testing:
  - High: Auth, Registration flow, Scoring
  - Medium: Questionnaire CRUD, Dashboard rendering
  - Low: Landing page styling

## 15. Risiko & Mitigasi

- Risiko: AI modules non-deterministic → mitigasi: gunakan deterministic fixtures, seed randomness, dan pengujian statistik jika perlu.
- Risiko: Ketergantungan on external services (Supabase) → mitigasi: gunakan mocking dalam tests unit/integration; gunakan test database container di CI.

## 16. Lampiran: Perintah Sampel untuk Pengembang

- Frontend unit tests (jika menggunakan Jest):

```powershell
cd frontend
npm install
npm run test
```

- Backend TypeScript tests (contoh memakai Jest):

```powershell
cd backend
npm install
npm run test
```

- Python AI tests (pytest):

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest backend/src/ai_service -q
```

- E2E (Cypress):

```powershell
cd frontend
npm run cypress:run
```
