# Catatan buat Aufa — Struktur Website, Tools, dan Drama Deploy-nya

Ditulis khusus karena kamu terbiasa deploy web dengan HTML/CSS/JS polos (upload
file, langsung jalan). Website ini **beda caranya**, jadi ini penjelasan dari
awal: apa bedanya, kenapa strukturnya begini, dan kenapa proses deploy-nya
sempat berantakan.

---

## 1. Beda paling mendasar: ini bukan "file HTML yang langsung jalan"

Kalau HTML/CSS/JS biasa: kamu buka `index.html` di browser (atau upload apa
adanya ke hosting), dan itu LANGSUNG jadi halaman jadi. Tidak ada proses di
tengah.

Website ini pakai **React** + **Vite**, jadi ada satu langkah tambahan:

```
kode yang kamu tulis (src/*.jsx, *.css)
        │
        │  npm run build   ← ini yang disebut "build step"
        ▼
file HTML/CSS/JS jadi, siap disajikan (folder dist/)
```

- **React** = library untuk nulis UI sebagai komponen (`<ProfileSection />`,
  `<SkillTree />`, dst) memakai JSX — sintaks yang kelihatan kayak HTML di
  dalam JavaScript. Ini **bukan** HTML asli; browser tidak mengerti JSX
  secara langsung.
- **Vite** = alat yang mengubah semua `.jsx` dan `.css` itu menjadi
  HTML/CSS/JS biasa yang browser mengerti, sekaligus menggabungkan
  (*bundling*) puluhan file jadi beberapa file saja supaya cepat dimuat.

Konsekuensi paling penting buat kamu:

- **`npm run dev`** → jalankan versi "mentah" di komputer sendiri
  (`localhost:5173`), Vite mem-build on-the-fly tiap kali kamu save.
- **`npm run build`** → menghasilkan folder `dist/` berisi HTML/CSS/JS jadi.
  **Inilah yang sebenarnya di-hosting**, bukan folder `src/`.
- Kamu tidak bisa lagi "upload folder project apa adanya" ke hosting —
  browser akan bingung karena isinya JSX, bukan HTML. Yang di-deploy harus
  hasil `npm run build`.

---

## 2. Struktur folder

```
index.html, vite.config.js, package.json   → dibaca Vite untuk proses build
.github/workflows/deploy.yml               → resep otomatis build + deploy

src/                                        → kode React kamu
  App.jsx                                   → menyusun semua section jadi satu halaman
  index.css                                 → warna, font, reset global
  assets/Aufa_PP.jpg                        → gambar yang di-import langsung di kode
  lib/paths.js                              → helper kecil (lihat bagian 4)
  components/
    Header.jsx / .css                       → navbar atas
    ProfileSection.jsx / .css                → section 1: profil + link CV/sosmed
    SkillTree.jsx / .css                     → section 2: peta rasi bintang skill
    Experience.jsx / .css                    → section 3: timeline pengalaman
    Projects.jsx / .css                      → section 4: galeri project (filter + banner)
    Certifications.jsx / .css                → section 5: galeri sertifikat
    Contact.jsx / .css                       → section 6: email
    Footer.jsx / .css                        → footer
    GlowCursor.jsx / .css                    → efek cahaya ngikutin cursor

public/                                     → file mentah yang DIPAKAI LANGSUNG
  skills/, badges/, experience/,
  projects/, certificates/, *.pdf, *.jpg     (Vite tidak mengubah isi folder ini,
                                               cuma menyalinnya apa adanya ke dist/)

design-source/                              → file ASLI sebelum dipotong/dirapikan
                                               (bukan dipakai situs, cuma arsip lokal)

.agents/, .claude/, skills-lock.json        → tooling AI, tidak berhubungan dengan situs
```

**Aturan sederhana:** kalau sebuah file benar-benar dibaca situs saat jalan
(lewat `import` di `src/`, atau lewat path `/xxx` yang mengarah ke
`public/`), dia "aktif". Kalau cuma arsip/asal-usul gambar, dia disimpan di
`design-source/` dan **tidak ikut di-push ke GitHub** (diatur lewat
`.gitignore`).

---

## 3. Tools yang dipakai

| Tool | Fungsinya | Analogi buat kamu |
|---|---|---|
| **React 18** | Nulis UI sebagai komponen yang bisa punya "state" (data yang berubah, misal filter project yang lagi aktif) | Kayak nulis banyak fungsi JS yang masing-masing menghasilkan sepotong HTML, lalu digabung |
| **Vite 5** | Dev server pas ngoding + build tool pas mau deploy | Gantinya "buka file HTML langsung di browser" |
| **ogl** | Library WebGL kecil, dipakai cuma buat efek Glow Cursor | Satu-satunya "dependency" beneran di luar React |
| **CSS biasa** (`@keyframes`, `transition`) | Semua animasi | Sama persis kayak CSS yang kamu tahu — tidak ada Tailwind/Framer Motion di sini |
| **GitHub Actions** | Robot yang otomatis nge-build dan publish situs tiap kali kamu push | Gantinya kamu manual upload file ke hosting tiap ada perubahan |
| **GitHub Pages** | Hosting gratis dari GitHub | Sama seperti sebelumnya, cuma sekarang yang di-hosting adalah hasil `dist/`, bukan `src/` |

---

## 4. Kenapa tadi error-error pas deploy ke GitHub — dan solusinya

Ada dua masalah beda yang kejadian. Ini runtutannya:

### Masalah #1 — Gambar/PDF bakal hilang begitu online (ke-deteksi sebelum sempat live)

**Kenapa bisa kejadian:** di kode, semua path gambar ditulis absolut, misal:

```jsx
src="/skills/python.png"
```

Di `localhost`, situs hidup di `http://localhost:5173/`, jadi
`/skills/python.png` artinya `http://localhost:5173/skills/python.png` —
ketemu, aman.

Tapi GitHub Pages punya kebiasaan taruh project di dalam sub-folder nama
repo, bukan di akar domain:

```
https://aufananda.github.io/TESTING_WEB/
                             └── ini bagian tambahan yang tidak ada di localhost
```

Jadi begitu online, `/skills/python.png` dicari di
`https://aufananda.github.io/skills/python.png` (salah — hilang folder
`TESTING_WEB`), padahal harusnya
`https://aufananda.github.io/TESTING_WEB/skills/python.png`. Hasilnya semua
gambar, PDF CV, dan favicon bakal 404 walau kelihatan sempurna di
`localhost`. Ini jenis bug yang **tidak akan pernah ketahuan** kalau cuma
dites di komputer sendiri — baru muncul pas online.

**Solusinya:**

1. `vite.config.js` dikasih tahu nama sub-folder-nya:
   ```js
   export default defineConfig({
     base: '/TESTING_WEB/',
     ...
   });
   ```
2. Semua path gambar di kode diganti supaya otomatis nambahin sub-folder itu,
   lewat satu fungsi kecil di `src/lib/paths.js`:
   ```js
   export function asset(path) {
     const base = import.meta.env.BASE_URL; // Vite otomatis isi ini dari `base` di atas
     return base + path.replace(/^\/+/, '');
   }
   ```
   dipakai jadi `src={asset('skills/python.png')}` — otomatis benar baik di
   `localhost` (`base` = `/`) maupun online (`base` = `/TESTING_WEB/`).
3. Satu tempat yang tidak bisa pakai JS (favicon di `index.html`) pakai
   placeholder khusus dari Vite: `%BASE_URL%`.

### Masalah #2 — Situsnya 404 padahal kode sudah ke-push dan workflow "hijau"

Ini yang bikin bingung karena kelihatannya semua sudah benar: kode sudah
di-push, file workflow (`.github/workflows/deploy.yml`) sudah ada dan siap
jalan otomatis tiap `git push`. Tapi buka linknya, tetap 404.

**Penyebabnya bukan bug di kode — tapi setting repository:**
`TESTING_WEB` waktu itu **private**, dan **GitHub Pages versi gratis cuma
bisa jalan di repository yang public**. Kalau repo-nya private, Pages tidak
akan pernah bisa nge-serve apapun, walau workflow-nya benar seratus persen.

Cara saya mendeteksinya (karena saya tidak punya login ke akun GitHub kamu):
saya coba akses halaman repo-nya lewat `curl` tanpa login, dan dapat
`404 Page not found`. GitHub sengaja balikin 404 (bukan pesan "private")
buat repo private supaya orang luar tidak bisa nebak-nebak repo mana saja
yang ada — jadi 404 itu sendiri adalah tanda kalau repo-nya private.

**Solusinya:** ubah visibility repo dari private ke public
(Settings → General → Danger Zone → Change visibility), pastikan
Settings → Pages → Source di-set ke **"GitHub Actions"** (bukan opsi lama
"Deploy from a branch"), lalu jalankan ulang workflow-nya sekali secara
manual dari tab Actions. Begitu itu selesai, link-nya langsung hidup.

### Bonus — sedikit kerapian git yang juga dibetulkan

Branch lokal (`main`) sempat "nyambung" ke `origin/master` (nama beda),
sisa dari histori repo sebelumnya. Bukan error yang bikin gagal, tapi
berpotensi bikin `git push`/`git pull` polos (tanpa nama branch) salah
sasaran nantinya — sudah diluruskan supaya `main` lokal memang mengikuti
`origin/main`.

---

## 5. Kalau bikin project React + Vite baru lagi, checklist-nya

- [ ] Kalau targetnya GitHub Pages **project site** (bukan `username.github.io`
      langsung), set `base: '/nama-repo/'` di `vite.config.js` dari awal.
- [ ] Jangan pernah hardcode path gambar dari `public/` sebagai string
      `/xxx` telanjang — selalu lewat `import.meta.env.BASE_URL` (atau
      helper seperti `asset()` di atas).
- [ ] Pastikan repo-nya **public** sebelum berharap GitHub Pages jalan
      (kecuali akun GitHub berbayar).
- [ ] Settings → Pages → Source = **GitHub Actions**, bukan "Deploy from a
      branch".
- [ ] File yang dites: `npm run build` lalu buka `dist/index.html` dan cek
      apakah path asset-nya sudah kebawa prefix folder repo dengan benar.
