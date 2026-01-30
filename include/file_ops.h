#ifndef FILE_OPS_H
#define FILE_OPS_H

#include <stdbool.h>

// Function prototypes for file operations
bool create_file(const char *filename, int size, bool read_perm, bool write_perm);
bool write_file(const char *filename, const char *data);
bool read_file(const char *filename, char *buffer, int buffer_size);
bool delete_file(const char *filename);

#endif // FILE_OPS_H