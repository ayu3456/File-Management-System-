#ifndef DISK_H
#define DISK_H

#include <stdio.h>
#include <stdbool.h>
#include <time.h>

// Define disk specifications
#define VIRTUAL_DISK_SIZE (1 * 1024 * 1024) // 1 MB
#define BLOCK_SIZE 32                       // 32 bytes
#define MAX_FILES 128                       // Maximum number of files in the system
#define MAX_FILENAME_LEN 32                 // Maximum length for a filename

// Calculate total blocks automatically
#define TOTAL_BLOCKS (VIRTUAL_DISK_SIZE / BLOCK_SIZE)

// Superblock structure
typedef struct {
    int total_disk_size;    // Total size of the disk in bytes
    int block_size;         // Size of each block in bytes
    int total_blocks;       // Total number of blocks on the disk
    int free_block_count;   // Number of currently free blocks
    int file_table_size;    // Number of entries in the file table
    int directory_size;     // Number of entries in the directory
} Superblock;

// File Table Entry (inode-like structure)
typedef struct {
    char filename[MAX_FILENAME_LEN]; // Name of the file
    int file_size;                   // Size of the file in bytes
    int start_block;                 // Starting block on the disk
    int num_blocks;                  // Number of blocks allocated to the file
    bool read_permission;            // Read permission (true = allowed)
    bool write_permission;           // Write permission (true = allowed)
    time_t created_timestamp;        // Timestamp of file creation
    bool in_use;                     // Flag to indicate if this entry is in use
} FileTableEntry;

// Directory Entry (single-level)
typedef struct {
    char filename[MAX_FILENAME_LEN]; // Name of the file
    int file_table_index;            // Index into the FileTableEntry array
    bool in_use;                     // Flag to indicate if this entry is in use
} DirectoryEntry;

// Global disk and file system structures
extern FILE *disk_fp;
extern Superblock superblock;
extern FileTableEntry file_table[MAX_FILES];
extern DirectoryEntry directory[MAX_FILES];
extern bool block_bitmap[TOTAL_BLOCKS]; // Separate bitmap

// Define offsets for metadata within disk.txt
#define SUPERBLOCK_OFFSET 0
#define FILE_TABLE_OFFSET (SUPERBLOCK_OFFSET + sizeof(Superblock))
#define DIRECTORY_OFFSET (FILE_TABLE_OFFSET + sizeof(FileTableEntry) * MAX_FILES)
#define BLOCK_BITMAP_OFFSET (DIRECTORY_OFFSET + sizeof(DirectoryEntry) * MAX_FILES)
#define DATA_BLOCKS_OFFSET (BLOCK_BITMAP_OFFSET + sizeof(bool) * TOTAL_BLOCKS) // Data blocks start after bitmap

// Function prototypes for disk operations
bool init_disk();
void close_disk();
void format_disk();
void write_block(int block_num, const char *data);
void read_block(int block_num, char *buffer);
int find_contiguous_free_blocks(int count);
void allocate_blocks(int start_block, int count);
void free_blocks(int start_block, int count);
void load_file_system();
void save_file_system();
void show_disk_status();

#endif // DISK_H