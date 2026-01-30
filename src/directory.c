#include "directory.h"
#include <string.h>
#include <stdio.h>

// Find a directory entry by filename
int find_directory_entry(const char *filename) {
    for (int i = 0; i < MAX_FILES; i++) {
        if (directory[i].in_use && strcmp(directory[i].filename, filename) == 0) {
            return i;
        }
    }
    return -1; // Not found
}

// Find a free directory entry slot
int find_free_directory_entry() {
    for (int i = 0; i < MAX_FILES; i++) {
        if (!directory[i].in_use) {
            return i;
        }
    }
    return -1; // No free entry
}

// Add a new directory entry
bool add_directory_entry(const char *filename, int file_table_index) {
    int entry_index = find_free_directory_entry();
    if (entry_index == -1) {
        fprintf(stderr, "Error: Directory is full.\n");
        return false;
    }
    if (find_directory_entry(filename) != -1) {
        fprintf(stderr, "Error: File '%s' already exists.\n", filename);
        return false;
    }

    strncpy(directory[entry_index].filename, filename, MAX_FILENAME_LEN - 1);
    directory[entry_index].filename[MAX_FILENAME_LEN - 1] = '\0'; // Ensure null-termination
    directory[entry_index].file_table_index = file_table_index;
    directory[entry_index].in_use = true;
    save_file_system();
    return true;
}

// Remove a directory entry
bool remove_directory_entry(const char *filename) {
    int entry_index = find_directory_entry(filename);
    if (entry_index == -1) {
        fprintf(stderr, "Error: File '%s' not found in directory.\n", filename);
        return false;
    }

    directory[entry_index].in_use = false;
    memset(directory[entry_index].filename, 0, MAX_FILENAME_LEN);
    directory[entry_index].file_table_index = -1;
    save_file_system();
    return true;
}

// List all files in the directory
void list_files() {
    printf("\nFiles on disk:\n");
    bool found_files = false;
    for (int i = 0; i < MAX_FILES; i++) {
        if (directory[i].in_use) {
            FileTableEntry *fte = &file_table[directory[i].file_table_index];
            printf("- %s (Size: %d bytes, Blocks: %d, Permissions: %s%s)\n",
                   fte->filename,
                   fte->file_size,
                   fte->num_blocks,
                   fte->read_permission ? "R" : "",
                   fte->write_permission ? "W" : "");
            found_files = true;
        }
    }
    if (!found_files) {
        printf("No files found.\n");
    }
}
