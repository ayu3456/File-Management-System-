# Frontend Client — Desktop UI

React-based desktop environment that simulates an OS interface for the Virtual File Management System.

## Applications

| App | Icon | Description |
|-----|------|-------------|
| **My Computer** | 🖥️ | Browse files, create new files, soft-delete, open in editor, drag & drop import |
| **Text Editor** | 📄 | Read and edit file content, save changes back to virtual disk |
| **Recycle Bin** | 🗑️ | View soft-deleted files (`.trash_` prefix), restore or permanently delete |
| **Storage** | 💾 | 10×10 heatmap of disk usage by file type, flush storage button |

## Components

- **Desktop** — Renders desktop icon grid (double-click to open apps)
- **Window** — Draggable, minimizable, maximizable window container
- **Taskbar** — Bottom bar with Start menu, running apps, and clock

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173`. Requires the API server on port 3001.

## Tech

- React 19 + Vite
- Tailwind CSS 4
- Lucide React (icons)
- Framer Motion (animations)
- Axios (HTTP)
