#include "directory.h"
#include "disk.h"
#include "file_ops.h"
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Helper to print files in JSON format for the frontend
void list_files_json() {
  printf("[");
  bool first = true;
  for (int i = 0; i < MAX_FILES; i++) {
    if (directory[i].in_use) {
      if (!first)
        printf(",");
      FileTableEntry *fte = &file_table[directory[i].file_table_index];
      printf("{\"filename\":\"%s\",\"size\":%d,\"blocks\":%d,\"created\":%ld}",
             fte->filename, fte->file_size, fte->num_blocks,
             (long)fte->created_timestamp);
      first = false;
    }
  }
  printf("]\n");
}

// Helper to print disk status in JSON
void show_disk_status_json() {
  printf("{");
  printf("\"total_size\":%d,", superblock.total_disk_size);
  printf("\"block_size\":%d,", superblock.block_size);
  printf("\"total_blocks\":%d,", superblock.total_blocks);
  printf("\"free_blocks\":%d,", superblock.free_block_count);
  printf("\"used_blocks\":%d",
         superblock.total_blocks - superblock.free_block_count);
  printf("}\n");
}

void handle_command(int argc, char *argv[]) {
  if (strcmp(argv[1], "create") == 0) {
    if (argc < 4) {
      fprintf(stderr, "Usage: %s create <filename> <size>\n", argv[0]);
      return;
    }
    int size = atoi(argv[3]);
    if (create_file(argv[2], size, true, true)) {
      printf("{\"status\":\"success\",\"message\":\"File created\"}\n");
    } else {
      printf("{\"status\":\"error\",\"message\":\"Failed to create file\"}\n");
    }
  } else if (strcmp(argv[1], "write") == 0) {
    if (argc < 4) {
      fprintf(stderr, "Usage: %s write <filename> <data>\n", argv[0]);
      return;
    }
    // Join all remaining arguments as data (in case of spaces)
    char data[VIRTUAL_DISK_SIZE] = "";
    for (int i = 3; i < argc; i++) {
      strcat(data, argv[i]);
      if (i < argc - 1)
        strcat(data, " ");
    }

    if (write_file(argv[2], data)) {
      printf("{\"status\":\"success\",\"message\":\"Data written\"}\n");
    } else {
      printf("{\"status\":\"error\",\"message\":\"Failed to write data\"}\n");
    }
  } else if (strcmp(argv[1], "read") == 0) {
    if (argc < 3) {
      fprintf(stderr, "Usage: %s read <filename>\n", argv[0]);
      return;
    }
    char *buffer = malloc(VIRTUAL_DISK_SIZE);
    if (buffer && read_file(argv[2], buffer, VIRTUAL_DISK_SIZE)) {
      // Output raw content or JSON? For now, raw content is easier for the
      // reader logic providing it doesn't conflict with JSON parsing. Let's
      // wrap it in JSON to be consistent. Need to escape quotes/newlines in
      // real impl, but for now simple content:
      printf("{\"status\":\"success\",\"content\":\"%s\"}\n", buffer);
    } else {
      printf(
          "{\"status\":\"error\",\"message\":\"Failed to read or empty\"}\n");
    }
    free(buffer);
  } else if (strcmp(argv[1], "delete") == 0) {
    if (argc < 3) {
      fprintf(stderr, "Usage: %s delete <filename>\n", argv[0]);
      return;
    }
    if (delete_file(argv[2])) {
      printf("{\"status\":\"success\",\"message\":\"File deleted\"}\n");
    } else {
      printf("{\"status\":\"error\",\"message\":\"Failed to delete file\"}\n");
    }
  } else if (strcmp(argv[1], "list") == 0) {
    list_files_json();
  } else if (strcmp(argv[1], "status") == 0) {
    show_disk_status_json();
  } else {
    fprintf(stderr, "Unknown command: %s\n", argv[1]);
  }
}

// Function to display the menu and get user choice
int display_menu() {
  int choice;
  printf("\nVirtual File Management System Menu:\n");
  printf("1. Create File\n");
  printf("2. Write File\n");
  printf("3. Read File\n");
  printf("4. Delete File\n");
  printf("5. List Files\n");
  printf("6. Disk Status\n");
  printf("7. Exit\n");
  printf("Enter your choice: ");
  scanf("%d", &choice);
  while (getchar() != '\n')
    ; // Clear input buffer
  return choice;
}

int main(int argc, char *argv[]) {
  if (!init_disk()) {
    fprintf(stderr, "Failed to initialize virtual disk. Exiting.\n");
    return 1;
  }

  if (argc > 1) {
    handle_command(argc, argv);
    close_disk();
    return 0;
  }

  int choice;
  char filename[MAX_FILENAME_LEN];
  int size;
  char *data_to_write = malloc(VIRTUAL_DISK_SIZE);
  char *read_buffer = malloc(VIRTUAL_DISK_SIZE);

  if (!data_to_write || !read_buffer) {
    fprintf(stderr, "Memory allocation failed\n");
    return 1;
  }

  do {
    choice = display_menu();
    switch (choice) {
    case 1: // Create File
      printf("Enter filename: ");
      fgets(filename, MAX_FILENAME_LEN, stdin);
      filename[strcspn(filename, "\n")] = 0; // Remove newline
      printf("Enter size (bytes): ");
      scanf("%d", &size);
      while (getchar() != '\n')
        ; // Clear input buffer
      create_file(filename, size, true, true);
      break;
    case 2: // Write File
      printf("Enter filename: ");
      fgets(filename, MAX_FILENAME_LEN, stdin);
      filename[strcspn(filename, "\n")] = 0; // Remove newline
      printf("Enter data to write: ");
      fgets(data_to_write, VIRTUAL_DISK_SIZE, stdin);
      data_to_write[strcspn(data_to_write, "\n")] = 0; // Remove newline
      write_file(filename, data_to_write);
      break;
    case 3: // Read File
      printf("Enter filename: ");
      fgets(filename, MAX_FILENAME_LEN, stdin);
      filename[strcspn(filename, "\n")] = 0; // Remove newline
      read_file(filename, read_buffer, VIRTUAL_DISK_SIZE);
      printf("File content:\n%s\n", read_buffer);
      break;
    case 4: // Delete File
      printf("Enter filename: ");
      fgets(filename, MAX_FILENAME_LEN, stdin);
      filename[strcspn(filename, "\n")] = 0; // Remove newline
      delete_file(filename);
      break;
    case 5: // List Files
      list_files();
      break;
    case 6: // Disk Status
      show_disk_status();
      break;
    case 7: // Exit
      printf("Exiting...\n");
      break;
    default:
      printf("Invalid choice. Please try again.\n");
    }
  } while (choice != 7);

  free(data_to_write);
  free(read_buffer);
  close_disk();
  return 0;
}
