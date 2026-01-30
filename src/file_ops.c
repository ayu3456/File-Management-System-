#include "file_ops.h"
#include "disk.h"
#include "directory.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <math.h>

// Create a new file
bool create_file(const char *filename, int size, bool read_perm, bool write_perm) {
    // Check if file already exists
    if (find_directory_entry(filename) != -1) {
        fprintf(stderr, "Error: File '%s' already exists.\n", filename);
        return false;
    }

    // Calculate required blocks
    int num_blocks_needed = (size + BLOCK_SIZE - 1) / BLOCK_SIZE;
    if (num_blocks_needed == 0 && size > 0) {
        num_blocks_needed = 1; // Even empty files take one block if size > 0
    } else if (size == 0) {
        num_blocks_needed = 0; // Truly empty files might not take any data blocks
    }

    // Find contiguous free blocks
    int start_block = -1;
    if (num_blocks_needed > 0) {
        start_block = find_contiguous_free_blocks(num_blocks_needed);
        if (start_block == -1) {
            fprintf(stderr, "Error: Not enough contiguous disk space for '%s' (size: %d bytes, blocks needed: %d).\n", filename, size, num_blocks_needed);
            return false;
        }
    }

    // Find a free File Table Entry
    int fte_index = -1;
    for (int i = 0; i < MAX_FILES; i++) {
        if (!file_table[i].in_use) {
            fte_index = i;
            break;
        }
    }
    if (fte_index == -1) {
        fprintf(stderr, "Error: File Table is full. Cannot create more files.\n");
        return false;
    }

    // Add to directory
    if (!add_directory_entry(filename, fte_index)) {
        return false; // Error adding to directory (e.g., directory full)
    }

    // Initialize File Table Entry
    strncpy(file_table[fte_index].filename, filename, MAX_FILENAME_LEN - 1);
    file_table[fte_index].filename[MAX_FILENAME_LEN - 1] = '\0';
    file_table[fte_index].file_size = size;
    file_table[fte_index].start_block = start_block;
    file_table[fte_index].num_blocks = num_blocks_needed;
    file_table[fte_index].read_permission = read_perm;
    file_table[fte_index].write_permission = write_perm;
    file_table[fte_index].created_timestamp = time(NULL);
    file_table[fte_index].in_use = true;

    // Allocate blocks on disk
    if (num_blocks_needed > 0) {
        allocate_blocks(start_block, num_blocks_needed);
    }

    save_file_system();
    printf("File '%s' created successfully (size: %d bytes, blocks: %d).\n", filename, size, num_blocks_needed);
    return true;
}

// Write data to a file
bool write_file(const char *filename, const char *data) {
    int dir_index = find_directory_entry(filename);
    if (dir_index == -1) {
        fprintf(stderr, "Error: File '%s' not found.\n", filename);
        return false;
    }

    FileTableEntry *fte = &file_table[directory[dir_index].file_table_index];

    // Permission check
    if (!fte->write_permission) {
        fprintf(stderr, "Error: Permission denied for writing to '%s'.\n", filename);
        return false;
    }

    int data_len = strlen(data);
    int new_num_blocks = (data_len + BLOCK_SIZE - 1) / BLOCK_SIZE;
    if (new_num_blocks == 0 && data_len > 0) {
        new_num_blocks = 1;
    } else if (data_len == 0) {
        new_num_blocks = 0;
    }

    // If the new data requires more or less blocks, we need to reallocate
    if (new_num_blocks != fte->num_blocks) {
        // Free old blocks first
        if (fte->num_blocks > 0) {
            free_blocks(fte->start_block, fte->num_blocks);
        }

        // Find new contiguous blocks
        int new_start_block = -1;
        if (new_num_blocks > 0) {
            new_start_block = find_contiguous_free_blocks(new_num_blocks);
            if (new_start_block == -1) {
                fprintf(stderr, "Error: Not enough contiguous disk space to write all data to '%s'.\n", filename);
                // Re-allocate original blocks if possible or leave file empty
                if (fte->num_blocks > 0) {
                    allocate_blocks(fte->start_block, fte->num_blocks);
                }
                return false;
            }
        }

        fte->start_block = new_start_block;
        fte->num_blocks = new_num_blocks;
        fte->file_size = data_len; // Update file size based on actual data written

        if (new_num_blocks > 0) {
            allocate_blocks(new_start_block, new_num_blocks);
        }
    }

    // Write data to blocks
    char block_buffer[BLOCK_SIZE];
    for (int i = 0; i < fte->num_blocks; i++) {
        int offset = i * BLOCK_SIZE;
        int bytes_to_write = (data_len - offset > BLOCK_SIZE) ? BLOCK_SIZE : (data_len - offset);
        
        memset(block_buffer, 0, BLOCK_SIZE); // Clear buffer for partial writes

        if (bytes_to_write > 0) {
            memcpy(block_buffer, data + offset, bytes_to_write);
        }
        write_block(fte->start_block + i, block_buffer);
    }
    
    fte->file_size = data_len; // Update file size after writing data
    save_file_system();
    printf("Data written to '%s'. (New size: %d bytes, New blocks: %d)\n", filename, fte->file_size, fte->num_blocks);
    return true;
}

// Read data from a file
bool read_file(const char *filename, char *buffer, int buffer_size) {
    int dir_index = find_directory_entry(filename);
    if (dir_index == -1) {
        fprintf(stderr, "Error: File '%s' not found.\n", filename);
        return false;
    }

    FileTableEntry *fte = &file_table[directory[dir_index].file_table_index];

    // Permission check
    if (!fte->read_permission) {
        fprintf(stderr, "Error: Permission denied for reading from '%s'.\n", filename);
        return false;
    }

    if (fte->file_size == 0 || fte->num_blocks == 0) {
        buffer[0] = '\0'; // Empty file
        printf("File '%s' is empty.\n", filename);
        return true;
    }

    if (buffer_size < fte->file_size + 1) { // +1 for null terminator
        fprintf(stderr, "Error: Buffer too small to read entire file '%s'. Required: %d, Available: %d.\n", filename, fte->file_size + 1, buffer_size);
        return false;
    }

    char block_buffer[BLOCK_SIZE];
    int bytes_read = 0;
    for (int i = 0; i < fte->num_blocks; i++) {
        read_block(fte->start_block + i, block_buffer);
        int bytes_to_copy = (fte->file_size - bytes_read > BLOCK_SIZE) ? BLOCK_SIZE : (fte->file_size - bytes_read);
        memcpy(buffer + bytes_read, block_buffer, bytes_to_copy);
        bytes_read += bytes_to_copy;
    }
    buffer[bytes_read] = '\0'; // Null-terminate the buffer

    printf("File content:\n%s\n", buffer);
    return true;
}

// Delete a file
bool delete_file(const char *filename) {
    int dir_index = find_directory_entry(filename);
    if (dir_index == -1) {
        fprintf(stderr, "Error: File '%s' not found.\n", filename);
        return false;
    }

    int fte_index = directory[dir_index].file_table_index;
    FileTableEntry *fte = &file_table[fte_index];

    // Free data blocks
    if (fte->num_blocks > 0) {
        free_blocks(fte->start_block, fte->num_blocks);
    }

    // Clear File Table Entry
    fte->in_use = false;
    memset(fte->filename, 0, MAX_FILENAME_LEN);
    fte->file_size = 0;
    fte->start_block = -1;
    fte->num_blocks = 0;
    fte->read_permission = false;
    fte->write_permission = false;
    fte->created_timestamp = 0;

    // Remove from directory
    remove_directory_entry(filename);

    save_file_system();
    printf("File '%s' deleted successfully.\n", filename);
    return true;
}
