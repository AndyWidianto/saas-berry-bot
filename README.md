
# 🚀 Full-Stack SaaS Application (NestJS & React/Vite)

Repositori ini berisi kode sumber untuk aplikasi SaaS lengkap yang terdiri dari backend core (NestJS), frontend dashboard admin (React/Vite dengan Nginx), yang dikelola secara modular menggunakan Docker dan Docker Compose.

---

## 📂 Struktur Project

```text
.
├── backend/                  # NestJS Backend API & Core Services
│   ├── apps/core-backend/    # Main backend application
│   └── Dockerfile.nest       # Dockerfile untuk backend NestJS
├── frontend/                 # Frontend aplikasi utama
│   └── Dockerfile.next       # Dockerfile frontend utama
├── frontend_admin/           # Dashboard Admin (React + Vite + Nginx)
│   ├── Dockerfile.vite       # Dockerfile multi-stage untuk Vite & Nginx
│   ├── nginx.conf            # Konfigurasi Nginx custom untuk SPA Routing
│   └── .dockerignore         # Konfigurasi ignore file Docker
└── docker-compose.yml        # Konfigurasi orchestrasi layanan Docker
```

## 🛠️ Teknologi yang Digunakan

- Backend: Node.js, NestJS, Prisma ORM, PostgreSQL, WebSockets (EventGateway), Redis/BullMQ (Queue Processor).
- Frontend / Admin: React, Vite, Tailwind CSS, TypeScript.
- Server & Deployment: Nginx (Alpine), Docker, Docker Compose.

## ⚙️ Prasyarat (Prerequisites)

Sebelum menjalankan project ini, pastikan komputer/server Anda telah menginstal:
- Docker
- Docker Compose


# 🚀 Cara Menjalankan Project (Docker)

Project ini telah dikonfigurasi menggunakan Docker Compose agar mudah dijalankan dalam satu perintah.

## 1. Clone repository ini (jika belum)
```bash
git clone <url-repository-anda>
cd <nama-folder-project>
```

## 2. Atur file Environment (.env)
Pastikan Anda sudah melengkapi file .env di masing-masing direktori service (seperti pada frontend_admin/.env dan backend) sesuai kebutuhan konfigurasi lokal/production Anda.

## 3. Build dan Jalankan Container

```bash 
// Jalankan perintah berikut di root folder (tempat docker-compose.yml berada)
docker compose up -d --build

// Cek Status Container
docker compose ps
```


# 🌐 Akses Layanan

Setelah container berjalan dengan sukses, Anda dapat mengakses layanan melalui browser:
- Frontend Admin: http://localhost:8443 
- Frontend: http://localhost:3000
- Backend Core: http://localhost:5000
- Whatsapp Gateway: http://localhost:4000

# 📄 License

Project ini dilisensikan di bawah MIT License.