# Virtual File Management System

## Project Overview
This project simulates an Operating System-level file management system in C, handling file operations on a virtual disk. The system does not interact with the host OS file system for its internal file logic, instead, it manages a single file (`disk.txt`) as if it were a physical hard drive.

## OS Concepts Used
-   **File Allocation**: Contiguous allocation is used for storing file data blocks.
-   **Disk Block Management**: The virtual disk is divided into blocks, and a free block count is maintained.
-   **Metadata Handling**: File metadata (name, size, permissions, timestamps, block information) is stored in a File Table (inode-like structure).
-   **Permissions Checking**: Basic read/write permissions are managed.
-   **Fragmentation Awareness**: Contiguous allocation inherently deals with external fragmentation, as it requires large contiguous free blocks for larger files.

## Virtual Disk Layout Diagram (ASCII)

```
+-------------------+
|     SUPERBLOCK    |
| - Total Disk Size |
| - Block Size      |
| - Total Blocks    |
| - Free Block Count|
| - Disk Status     |
+-------------------+
|                   |
|   FILE TABLE      |
| (inode-like)      |
| - File Name       |
| - File Size       |
| - Starting Block  |
| - Number of Blocks|
| - Permissions     |
| - Created Timestamp|
+-------------------+
|                   |
|   DIRECTORY       |
| (Single-Level)    |
| - File Name ->    |
|   File Table Entry|
+-------------------+
|                   |
|   DATA BLOCKS     |
|                   |
+-------------------+
```

## How to Compile and Run
To compile the project, navigate to the `vfm_project` directory and use a C compiler (like GCC):

```bash
gcc -o vfm -Iinclude src/*.c main.c
```

To run the compiled program:

```bash
./vfm
```

## Example Usage

```
Virtual File Management System Menu:
1. Create File
2. Write File
3. Read File
4. Delete File
5. List Files
6. Disk Status
7. Exit
Enter your choice: 1
Enter filename: my_document.txt
Enter size: 100
File 'my_document.txt' created successfully.

Enter your choice: 2
Enter filename: my_document.txt
Enter data to write: Hello, this is some data for my virtual file!
Data written to 'my_document.txt'.

Enter your choice: 3
Enter filename: my_document.txt
File content: Hello, this is some data for my virtual file!

Enter your choice: 5
Files on disk:
- my_document.txt (Size: 100 bytes, Blocks: 4, Permissions: RW)

Enter your choice: 6
Disk Status:
Total Disk Size: 1 MB
Block Size: 32 bytes
Total Blocks: 32768
Free Block Count: 32764
Disk Status: OK

Enter your choice: 7
Exiting...
```

## Viva Explanation Section

### 1. What is a "Virtual File Management System" in this context?
In this project, a Virtual File Management System (VFMS) is a software layer that simulates the core functionalities of an operating system's file system. Instead of directly interacting with the underlying host OS file system for logical file operations (like creating, reading, writing, and deleting files), it manages its own "virtual disk" represented by a single file (`disk.txt`). All file system logic, including block allocation, directory management, and metadata handling, is implemented within the VFMS itself, offering a simplified, self-contained environment to demonstrate OS concepts.

### 2. Why use a "normal file" as a virtual disk?
Using a normal file (e.g., `disk.txt`) as a virtual disk allows us to abstract away the complexities of interacting with actual hardware. It provides a simple, portable, and easily manageable medium to simulate disk operations. This approach enables us to focus on implementing OS-level file system concepts (like block allocation, directory structures, and file tables) without needing to worry about hardware-specific drivers or low-level disk I/O. It effectively turns a regular file into a raw block device for our simulated file system.

### 3. Explain Contiguous Allocation. What are its pros and cons?
**Contiguous Allocation** is a method of allocating disk space for files where each file occupies a set of contiguous blocks on the disk. This means all blocks belonging to a file are located next to each other, forming a single, unbroken sequence.

**Pros:**
*   **Simple Implementation**: It's relatively easy to implement as file locations can be described by just a starting block address and the number of blocks.
*   **Excellent Read Performance**: Since all blocks are contiguous, reading a file sequentially is very fast. The disk head needs to move only once to the starting block and then can read the entire file without further seeking. This is ideal for applications that primarily perform sequential access.

**Cons:**
*   **External Fragmentation**: This is the most significant drawback. As files are created and deleted, the disk can become riddled with small, unusable free spaces between allocated files. Even if the total free space is sufficient for a new file, if it's not contiguous, the file cannot be allocated. This leads to wasted disk space and can eventually prevent the creation of new files even when space is available.
*   **Difficulty with File Growth**: If a file needs to grow, it's often difficult to find additional contiguous blocks immediately following its current allocation. This might require moving the entire file to a new, larger contiguous block, which is an expensive operation.
*   **Initial Size Declaration**: To avoid the growth problem, files often require their maximum size to be declared at creation time, which can lead to over-allocation and internal fragmentation if the file doesn't reach its maximum size.

### 4. How is "metadata handling" implemented in this project?
Metadata handling in this project is primarily managed through the **File Table** (which simulates an inode-like structure) and the **Superblock**.

*   **Superblock**: Stores global metadata about the entire virtual disk, such as its total size, block size, total number of blocks, the count of free blocks, and the overall disk status. This information is crucial for managing the disk at a high level.
*   **File Table**: Each entry in the file table represents the metadata for a single file. This includes:
    *   `File name`: The human-readable name of the file.
    *   `File size`: The current size of the file in bytes.
    *   `Starting block`: The disk address of the first block allocated to the file.
    *   `Number of blocks`: The total number of contiguous blocks the file occupies.
    *   `Read/Write permission`: Flags indicating allowed operations.
    *   `Created timestamp`: The time when the file was created.

The `Directory Structure` then maps human-readable file names to their corresponding entries in the File Table, acting as an index to access the file's metadata and data blocks.

### 5. Describe the role of the Superblock.
The Superblock is a critical data structure located at a fixed, well-known position on the virtual disk (usually the very first block). Its role is to store essential global information about the entire file system. In this project, it specifically stores:

*   **Total Disk Size**: The total capacity of the virtual disk in bytes.
*   **Block Size**: The fixed size of each data block on the disk.
*   **Total Blocks**: The total number of blocks available on the disk.
*   **Free Block Count**: The current number of unallocated blocks on the disk. This is vital for managing disk space and determining if new files can be created or existing ones can grow.
*   **Disk Status**: An indicator of the disk's health or state (e.g., "OK", "CORRUPTED").

The Superblock is the first point of contact for the file system when it needs to understand the disk's fundamental characteristics and current state. It's loaded into memory when the file system is initialized and updated whenever critical disk parameters change.

### 6. How are edge cases like "disk full" or "file exists" handled?
*   **Disk Full**:
    *   When `create_file` is called, the system first checks if there are enough contiguous free blocks available to accommodate the requested file size. If not, an error message indicating "Disk Full" or "Insufficient contiguous space" is returned.
    *   Similarly, during `write_file`, if the file needs to expand and there isn't enough contiguous space, an error will be reported.
*   **File Exists**:
    *   Before creating a new file with `create_file`, the system checks the directory structure to see if a file with the given `filename` already exists. If a duplicate name is found, an error message like "File already exists" is returned, preventing overwriting or creating conflicting entries.
*   **Permission Denied**:
    *   When `write_file` or `read_file` is called, the system checks the `Read/Write permission` flag stored in the file's metadata (in the File Table entry). If the requested operation (write or read) is not permitted for that file, an "Permission Denied" error is returned, ensuring data integrity and access control.
*   **File Not Found**:
    *   Operations like `read_file`, `write_file`, and `delete_file` first attempt to locate the specified filename in the directory structure. If the filename is not found, an error such as "File not found" is returned.

These edge cases are handled by checks at the appropriate points in the file operation functions, returning informative error messages to the user and preventing invalid or potentially destructive operations.