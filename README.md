# Virtual File Management System

## Project Overview

This project simulates an **Operating System-level file management system** in C, with a full **web-based desktop UI** built in React. The system manages a virtual disk (`disk.txt`) as if it were a physical hard drive, handling file creation, reading, writing, deletion, and storage visualization — all through a desktop-style interface that mimics a real OS.

### Team
**Sahil / Ayush — Team Deadlock**

---

## Architecture

```
┌──────────────────┐     HTTP/JSON      ┌──────────────────┐     exec()       ┌──────────────┐
│   React Frontend │  ───────────────►  │  Node.js Server  │  ─────────────►  │   C Backend  │
│   (Browser)      │  ◄───────────────  │  (Express API)   │  ◄─────────────  │   (vfm CLI)  │
│   Port 5173      │                    │  Port 3001       │    stdout/err    │              │
└──────────────────┘                    └──────────────────┘                  └──────┬───────┘
                                                                                    │
                                                                               disk.txt
                                                                          (Virtual Disk File)
```

**Why a Node.js middleware?** Browsers cannot execute system commands. The Node.js server bridges the React frontend and the C executable by translating HTTP requests into CLI commands via `child_process.exec()`.

---

## OS Concepts Demonstrated

| Concept | Implementation |
|---------|---------------|
| **File Allocation** | Contiguous block allocation for storing file data |
| **Disk Block Management** | Virtual disk divided into 32-byte blocks with a bitmap tracker |
| **Metadata (Inodes)** | File Table entries store name, size, permissions, timestamps, block info |
| **Directory Structure** | Single-level directory mapping filenames to File Table indices |
| **Permissions** | Read/Write permission flags per file |
| **Superblock** | Stores global disk metadata (size, block count, free count) |
| **Soft Delete (Recycle Bin)** | Files renamed with `.trash_` prefix instead of immediate deletion |
| **Disk Formatting** | Full disk format (flush) resets all metadata and frees all blocks |

---

## Virtual Disk Layout

```
+---------------------+
|     SUPERBLOCK       |  ← Disk metadata (size, block size, free count)
+---------------------+
|     FILE TABLE       |  ← Inode-like entries (128 max files)
|  (FileTableEntry[])  |     name, size, start_block, num_blocks, perms, timestamp
+---------------------+
|     DIRECTORY        |  ← Single-level directory
|  (DirectoryEntry[])  |     filename → file_table_index mapping
+---------------------+
|   BLOCK BITMAP       |  ← Free/used status for each block
+---------------------+
|     DATA BLOCKS      |  ← Actual file content (32 bytes per block)
+---------------------+
```

---

## Features

### C Backend (`vfm`)
- Create, read, write, delete files on a virtual disk
- Rename files (used for soft delete)
- Disk status reporting (JSON output)
- Format disk (wipe all files)
- Supports both **interactive menu mode** and **CLI headless mode**

### Web Frontend (Desktop UI)
- **Desktop Environment** — Wallpaper, desktop icons, taskbar with clock
- **Window Manager** — Draggable, minimizable, maximizable windows
- **File Manager (My Computer)** — Browse files, create, delete (soft), open in editor, drag & drop import
- **Text Editor** — Read existing file content and edit/save
- **Recycle Bin** — View soft-deleted files, restore or permanently delete
- **Storage Visualization** — 10×10 heatmap grid showing disk usage by file type, with flush button
- **Virtual Folders** — Organize files by type (Documents, Images, Code)

---

## How to Run

### Prerequisites
- **GCC** (C compiler)
- **Node.js** (v18+)
- **npm**

### 1. Compile the C Backend

```bash
gcc -I ./include src/disk.c src/file_ops.c src/directory.c main.c -o vfm
```

### 2. Start the Node.js API Server

```bash
cd frontend/server
npm install
node index.js
# Server runs on http://localhost:3001
```

### 3. Start the React Frontend

```bash
cd frontend/client
npm install
npm run dev
# App runs on http://localhost:5173
```

### 4. Open in Browser

Navigate to `http://localhost:5173` — you'll see the desktop environment with icons for My Computer, Text Editor, Recycle Bin, and Storage.

---

## CLI Usage (Headless Mode)

The C backend can also be used directly from the terminal:

```bash
./vfm create <filename> <size>       # Create a file
./vfm write <filename> <data>        # Write data to a file
./vfm read <filename>                # Read file content
./vfm delete <filename>              # Delete a file
./vfm rename <old_name> <new_name>   # Rename a file
./vfm list                           # List all files (JSON)
./vfm status                         # Show disk status (JSON)
./vfm format                         # Format disk (delete everything)
./vfm                                # Interactive menu mode
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/files` | List all files |
| `POST` | `/api/files` | Create a file (`{ filename, size }`) |
| `GET` | `/api/files/:name` | Read file content |
| `PUT` | `/api/files/:name` | Write to file (`{ content }`) |
| `DELETE` | `/api/files/:name` | Delete a file permanently |
| `POST` | `/api/files/rename` | Rename a file (`{ oldName, newName }`) |
| `GET` | `/api/status` | Get disk status |
| `POST` | `/api/format` | Format/flush the entire disk |

---

## Project Structure

```
File-Management-System-/
├── main.c                    # Entry point (CLI + interactive mode)
├── include/
│   ├── disk.h                # Disk structures & constants
│   ├── directory.h           # Directory operation prototypes
│   └── file_ops.h            # File operation prototypes
├── src/
│   ├── disk.c                # Disk init, block I/O, save/load
│   ├── directory.c           # Directory CRUD + rename
│   └── file_ops.c            # File create/read/write/delete
├── frontend/
│   ├── server/
│   │   ├── index.js          # Express API server (middleware)
│   │   └── package.json
│   └── client/
│       ├── src/
│       │   ├── App.jsx       # Main app with window management
│       │   ├── main.jsx      # Entry point
│       │   ├── index.css     # Tailwind CSS
│       │   ├── apps/
│       │   │   ├── FileManager.jsx   # File browser
│       │   │   ├── TextEditor.jsx    # File editor
│       │   │   ├── RecycleBin.jsx    # Soft delete manager
│       │   │   └── StorageMap.jsx    # Disk usage visualization
│       │   └── components/
│       │       ├── Desktop.jsx       # Desktop icons
│       │       ├── Taskbar.jsx       # Bottom taskbar
│       │       └── Window.jsx        # Draggable window
│       └── package.json
├── disk.txt                  # Virtual disk file (auto-generated)
└── vfm                       # Compiled C binary
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Core Backend | C (GCC) |
| API Server | Node.js + Express |
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Animations | Framer Motion |
| HTTP Client | Axios |
