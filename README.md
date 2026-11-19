# SplitAudio Frontend Client

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-22-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic-9-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-Reverse_Proxy-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)

The official web frontend client for the **SplitAudio** ecosystem. Built to consume and interact with the [SplitAudio Backend API (Orchestrator)](https://github.com/JozRamirez10/SplitAudio-Backend), this application provides a responsive, modern interface to upload local audio files or YouTube links, configure AI stem separation jobs, monitor processing queues in real time, and download individual tracks or packaged ZIP archives.

---

## 🏗️ Architecture & Tech Stack

- **Framework:** Angular 22 (Standalone Components)
- **UI Library:** Ionic Framework 9 (Web-only deployment)
- **Styling:** Tailwind CSS 3.4 & SCSS
- **Packaging & Utilities:** JSZip (client-side ZIP generation) & RxJS
- **Web Server & Reverse Proxy:** Nginx (Alpine) with dynamic `envsubst` templates
- **Infrastructure:** Docker & Docker Compose

### ⚡ Engineering Highlights

- **Reactive State Management with Signals:** Centralized state handling via Angular Signals (`SongState`) for song lists, loading states, active downloads, and real-time job tracking, minimizing boilerplate and ensuring efficient UI updates.
- **Asynchronous Job Polling & Queue Visibility:**
  - Live job tracking polls the backend every 5 seconds until completion or failure, driving a multi-phase progress screen with estimated processing times and accidental-exit protection (`window:beforeunload`).
  - A persistent active-jobs badge (`ActiveJobsBadgeComponent`) monitors the global processing queue every 15 seconds while the browser tab is visible (`document.visibilityState === 'visible'`).
- **Dual Ingestion & Validation:** Supports drag-and-drop local audio uploads (with client-side extension and file-size validation) as well as YouTube URL ingestion with live metadata previews (title and thumbnail) fetched via Noembed.
- **Client-Side ZIP Bundling:** Uses `JSZip` (`DownloadService`) to download all separated stems (including metronome tracks) concurrently from MinIO presigned URLs and package them into a single ZIP file named with the song's musical metadata (`SongName_Key_Hz_BPM.zip`).
- **Unified User Feedback:** Centralized Ionic alerts, confirmation dialogs, loading spinners, and toasts managed through `ModalService`.
- **Production-Ready Nginx Reverse Proxy:** Configured via `default.conf.template` to serve the Angular SPA, proxy `/api/` requests to the Spring Boot orchestrator with extended timeouts, and stream large audio files from MinIO with buffering disabled (`proxy_buffering off`) to prevent stalled downloads behind reverse proxies or Cloudflare.

> **Scope & Current Version Notes:**
> - **Web-Only Target:** Although built with Ionic UI components for a responsive layout, this project is strictly targeted and deployed as a web application (no native Android or iOS builds).
> - **Authentication (v1.0.0):** User authentication is not yet implemented in this initial release. All requests currently operate against a configurable `defaultUserEmail` defined in the Angular environment files.
> - **UI & Testing:** The application is under active visual iteration; screenshots and frontend unit tests are planned for upcoming releases.

---

## 📂 Repository Structure

```text
SplitAudio-Frontend/
├── src/
│   ├── app/
│   │   ├── components/           # Standalone UI components (dropzone, progress, badges, accordions)
│   │   ├── constants/            # Centralized routes, messages, instrument options, and defaults
│   │   ├── enums/                # TypeScript enumerations (job status, separation modes, modals)
│   │   ├── models/               # Backend DTOs and internal UI interfaces
│   │   ├── pages/                # Main views (song-list, song-upload)
│   │   ├── services/             # HTTP clients, JSZip downloader, and ModalService
│   │   └── states/               # Signal-based reactive state manager (SongState)
│   ├── assets/                   # Static assets and icons
│   ├── environments/             # Environment configurations (dev / prod)
│   └── theme/                    # Global Ionic variables and styling
├── default.conf.template         # Nginx reverse proxy & SPA template (envsubst-enabled)
├── nginx.conf                    # Global Nginx worker, gzip, and MIME configuration
├── docker-compose.yml            # Containerized frontend service definition
├── Dockerfile                    # Multi-stage Node 22 -> Nginx Alpine build
├── .env.example                  # Docker/Nginx environment variables template
├── tailwind.config.js            # Tailwind CSS configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v22+)
- Angular CLI (`npm install -g @angular/cli`)
- Docker & Docker Compose (for containerized deployment)
- *Required:* A running instance of the [SplitAudio Backend API](https://github.com/JozRamirez10/SplitAudio-Backend) and **MinIO**.

### Environment Setup

#### 1. Angular Environments (`src/environments/`)

Before running or building the application, update the environment files with your backend URL and default user email:

- **Development (`src/environments/environment.ts`):**
  ```typescript
  export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api',
    defaultUserEmail: 'your-email@yourdomain.com'
  };
  ```
- **Production (`src/environments/environment.prod.ts`):**
  When deploying behind the included Nginx reverse proxy, use `'/api'` so requests are routed automatically through the same origin:
  ```typescript
  export const environment = {
    production: true,
    apiUrl: '/api',
    defaultUserEmail: 'your-email@yourdomain.com'
  };
  ```

#### 2. Docker & Nginx Environment (`.env`)

For containerized execution, create your local `.env` file from the template:

```bash
cp .env.example .env
```

Configure the variables used by `docker-compose.yml` and `default.conf.template`:

```env
FRONTEND_PORT=8080
BACKEND_URL=http://split-audio-backend:8002
MINIO_URL=http://minio:9000
MINIO_BUCKET_NAME=split
```

### Installation & Execution

**Option A: Running with Docker Compose (Recommended)**

```bash
git clone https://github.com/JozRamirez10/SplitAudio-Frontend.git
cd SplitAudio-Frontend

# 1. Create and configure your .env file and src/environments/environment.prod.ts
cp .env.example .env

# 2. Build and start the Nginx container
docker compose up -d --build
```

The application will be available at `http://localhost:<FRONTEND_PORT>` (default `http://localhost:8080`).

**Option B: Running Locally for Development**

```bash
git clone https://github.com/JozRamirez10/SplitAudio-Frontend.git
cd SplitAudio-Frontend

# 1. Install dependencies
npm ci --legacy-peer-deps

# 2. Start the Angular development server
npm start
```

The application will be available at `http://localhost:4200`.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request