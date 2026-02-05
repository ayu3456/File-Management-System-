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


    *   Operations like `read_file`, `write_file`, and `delete_file` first attempt to locate the specified filename in the directory structure. If the filename is not found, an error such as "File not found" is returned.

These edge cases are handled by checks at the appropriate points in the file operation functions, returning informative error messages to the user and preventing invalid or potentially destructive operations.
