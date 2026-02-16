#ifndef DIRECTORY_H
#define DIRECTORY_H

#include "disk.h"
#include <stdbool.h>

// Function prototypes for directory operations
int find_directory_entry(const char *filename);
int find_free_directory_entry();
bool add_directory_entry(const char *filename, int file_table_index);
bool remove_directory_entry(const char *filename);
bool rename_file(const char *old_filename, const char *new_filename);
void list_files();

#endif // DIRECTORY_H