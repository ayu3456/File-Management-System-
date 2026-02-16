# Frontend — Virtual File Management System

This directory contains both the **React client** and the **Node.js API server** that together form the web-based desktop UI for the Virtual File Management System.

## Structure

```
frontend/
├── server/          # Node.js Express API (middleware between browser and C backend)
│   ├── index.js     # API routes + VFM command execution
│   └── package.json
└── client/          # React + Vite frontend (Desktop UI)
    ├── src/
    │   ├── App.jsx             # Window manager + app routing
    │   ├── apps/               # Desktop applications
    │   │   ├── FileManager.jsx # File browser with drag & drop
    │   │   ├── TextEditor.jsx  # File content editor
    │   │   ├── RecycleBin.jsx  # Soft-deleted file manager
    │   │   └── StorageMap.jsx  # Disk usage heatmap
    │   └── components/         # Shared UI components
    │       ├── Desktop.jsx     # Desktop icon grid
    │       ├── Taskbar.jsx     # Bottom taskbar with clock
    │       └── Window.jsx      # Draggable/maximizable window
    └── package.json
```

## Tech Stack

- **React 19** — UI framework
- **Vite** — Build tool & dev server
- **Tailwind CSS 4** — Utility-first CSS
- **Lucide React** — Icon library
- **Framer Motion** — Window animations
- **Axios** — HTTP client
- **Express** — API server

## How to Run

### 1. Start the API Server (Port 3001)

```bash
cd server
npm install
node index.js
```

> **Note:** The C backend (`vfm`) must be compiled first. See the root README.

### 2. Start the React Dev Server (Port 5173)

```bash
cd client
npm install
npm run dev
```

### 3. Open in Browser

Go to `http://localhost:5173`

## API Endpoints

All endpoints are served from `http://localhost:3001/api`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/files` | List all files |
| `POST` | `/files` | Create file (`{ filename, size }`) |
| `GET` | `/files/:name` | Read file content |
| `PUT` | `/files/:name` | Write to file (`{ content }`) |
| `DELETE` | `/files/:name` | Delete file permanently |
| `POST` | `/files/rename` | Rename file (`{ oldName, newName }`) |
| `GET` | `/status` | Disk status info |
| `POST` | `/format` | Format/flush entire disk |
