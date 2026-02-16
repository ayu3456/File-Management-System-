#include "disk.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

FILE *disk_fp;
Superblock superblock;
FileTableEntry file_table[MAX_FILES];
DirectoryEntry directory[MAX_FILES];
bool block_bitmap[TOTAL_BLOCKS]; // Separate global bitmap

// Initialize the virtual disk
bool init_disk() {
  disk_fp = fopen("disk.txt", "rb+");
  if (disk_fp == NULL) {
    // If disk.txt doesn't exist, create and format it
    disk_fp = fopen("disk.txt", "wb+");
    if (disk_fp == NULL) {
      perror("Error creating disk.txt");
      return false;
    }
    // Initialize disk with zeros to ensure its size
    char zero_byte = 0;
    for (long i = 0; i < VIRTUAL_DISK_SIZE; i++) {
      fwrite(&zero_byte, 1, 1, disk_fp);
    }
    fflush(disk_fp);

    format_disk();
    fprintf(stderr, "Virtual disk created and formatted: disk.txt\n");
  } else {
    // If disk.txt exists, load the file system
    load_file_system();
    fprintf(stderr, "Virtual disk loaded from disk.txt\n");
  }
  return true;
}

// Close the virtual disk file
void close_disk() {
  if (disk_fp != NULL) {
    fclose(disk_fp);
    disk_fp = NULL;
  }
}

// Format the virtual disk
void format_disk() {
  // Initialize Superblock
  superblock.total_disk_size = VIRTUAL_DISK_SIZE;
  superblock.block_size = BLOCK_SIZE;
  superblock.total_blocks = TOTAL_BLOCKS;
  superblock.free_block_count = TOTAL_BLOCKS; // All blocks are free initially
  superblock.file_table_size = MAX_FILES;
  superblock.directory_size = MAX_FILES;

  // Initialize block bitmap (all free)
  for (int i = 0; i < TOTAL_BLOCKS; i++) {
    block_bitmap[i] = false;
  }

  // Mark blocks used by metadata as allocated
  int metadata_blocks_count = (DATA_BLOCKS_OFFSET + BLOCK_SIZE - 1) /
                              BLOCK_SIZE; // Total blocks for metadata
  if (metadata_blocks_count >=
      TOTAL_BLOCKS) { // Ensure we don't try to allocate beyond disk size
    metadata_blocks_count = TOTAL_BLOCKS - 1; // Or handle as an error
  }
  for (int i = 0; i < metadata_blocks_count; i++) {
    block_bitmap[i] = true;
  }
  superblock.free_block_count -= metadata_blocks_count;

  // Initialize File Table entries (all unused)
  for (int i = 0; i < MAX_FILES; i++) {
    file_table[i].in_use = false;
  }

  // Initialize Directory entries (all unused)
  for (int i = 0; i < MAX_FILES; i++) {
    directory[i].in_use = false;
  }

  // Write superblock, file table, and directory to disk
  save_file_system();
}

// Write data to a specific block
void write_block(int block_num, const char *data) {
  // block_num is the logical block number, convert to physical offset
  long actual_offset = DATA_BLOCKS_OFFSET + (long)block_num * BLOCK_SIZE;

  if (actual_offset < DATA_BLOCKS_OFFSET ||
      actual_offset + BLOCK_SIZE > VIRTUAL_DISK_SIZE) {
    fprintf(stderr,
            "Error: Invalid block write access (offset: %ld, block_num: %d)\n",
            actual_offset, block_num);
    return;
  }
  fseek(disk_fp, actual_offset, SEEK_SET);
  fwrite(data, BLOCK_SIZE, 1, disk_fp);
  fflush(disk_fp);
}

// Read data from a specific block
void read_block(int block_num, char *buffer) {
  // block_num is the logical block number, convert to physical offset
  long actual_offset = DATA_BLOCKS_OFFSET + (long)block_num * BLOCK_SIZE;

  if (actual_offset < DATA_BLOCKS_OFFSET ||
      actual_offset + BLOCK_SIZE > VIRTUAL_DISK_SIZE) {
    fprintf(stderr,
            "Error: Invalid block read access (offset: %ld, block_num: %d)\n",
            actual_offset, block_num);
    return;
  }
  fseek(disk_fp, actual_offset, SEEK_SET);
  fread(buffer, BLOCK_SIZE, 1, disk_fp);
}

// Find a contiguous set of free blocks
int find_contiguous_free_blocks(int count) {
  int start_block_idx = -1;
  int current_contiguous_count = 0;

  // Calculate the index of the first data block after metadata
  int first_data_block_logical_idx =
      (DATA_BLOCKS_OFFSET + BLOCK_SIZE - 1) / BLOCK_SIZE;

  for (int i = first_data_block_logical_idx; i < TOTAL_BLOCKS; i++) {
    if (!block_bitmap[i]) {
      // Block is free
      if (current_contiguous_count == 0) {
        start_block_idx =
            i; // Mark the start of a potential contiguous block run
      }
      current_contiguous_count++;
      if (current_contiguous_count == count) {
        return start_block_idx; // Found enough contiguous blocks
      }
    } else {
      // Block is used, reset count
      start_block_idx = -1;
      current_contiguous_count = 0;
    }
  }
  return -1; // Not enough contiguous blocks found
}

// Allocate a set of blocks
void allocate_blocks(int start_block, int count) {
  // OS Concept: Disk Block Management - Marking blocks as used
  for (int i = 0; i < count; i++) {
    if (start_block + i >= TOTAL_BLOCKS) {
      fprintf(stderr, "Error: Attempt to allocate block out of bounds: %d\n",
              start_block + i);
      return;
    }
    block_bitmap[start_block + i] = true;
  }
  superblock.free_block_count -= count;
  save_file_system();
}

// Free a set of blocks
void free_blocks(int start_block, int count) {
  // OS Concept: Disk Block Management - Marking blocks as free
  for (int i = 0; i < count; i++) {
    if (start_block + i >= TOTAL_BLOCKS) {
      fprintf(stderr, "Error: Attempt to free block out of bounds: %d\n",
              start_block + i);
      return;
    }
    block_bitmap[start_block + i] = false;
  }
  superblock.free_block_count += count;
  save_file_system();
}

// Load file system metadata from disk
void load_file_system() {
  // OS Concept: Metadata Handling - Reading superblock, file table, and
  // directory from disk
  fseek(disk_fp, SUPERBLOCK_OFFSET, SEEK_SET);
  fread(&superblock, sizeof(Superblock), 1, disk_fp);

  fseek(disk_fp, FILE_TABLE_OFFSET, SEEK_SET);
  fread(file_table, sizeof(FileTableEntry), MAX_FILES, disk_fp);

  fseek(disk_fp, DIRECTORY_OFFSET, SEEK_SET);
  fread(directory, sizeof(DirectoryEntry), MAX_FILES, disk_fp);

  fseek(disk_fp, BLOCK_BITMAP_OFFSET, SEEK_SET);
  fread(block_bitmap, sizeof(bool), TOTAL_BLOCKS, disk_fp);
}

// Save file system metadata to disk
void save_file_system() {
  // OS Concept: Metadata Handling - Writing superblock, file table, and
  // directory to disk
  fseek(disk_fp, SUPERBLOCK_OFFSET, SEEK_SET);
  fwrite(&superblock, sizeof(Superblock), 1, disk_fp);

  fseek(disk_fp, FILE_TABLE_OFFSET, SEEK_SET);
  fwrite(file_table, sizeof(FileTableEntry), MAX_FILES, disk_fp);

  fseek(disk_fp, DIRECTORY_OFFSET, SEEK_SET);
  fwrite(directory, sizeof(DirectoryEntry), MAX_FILES, disk_fp);

  fseek(disk_fp, BLOCK_BITMAP_OFFSET, SEEK_SET);
  fwrite(block_bitmap, sizeof(bool), TOTAL_BLOCKS, disk_fp);
  fflush(disk_fp);
}

// Show disk status
void show_disk_status() {
  printf("\nDisk Status:\n");
  printf("Total Disk Size: %d bytes (%.2f MB)\n", superblock.total_disk_size,
         (float)superblock.total_disk_size / (1024 * 1024));
  printf("Block Size: %d bytes\n", superblock.block_size);
  printf("Total Blocks: %d\n", superblock.total_blocks);
  printf("Free Block Count: %d\n", superblock.free_block_count);
  printf("Used Block Count: %d\n",
         superblock.total_blocks - superblock.free_block_count);
  printf("Disk Status: OK\n");
}
