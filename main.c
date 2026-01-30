#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include "disk.h"
#include "file_ops.h"
#include "directory.h"

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
    while (getchar() != '\n'); // Clear input buffer
    return choice;
}

int main() {
    if (!init_disk()) {
        fprintf(stderr, "Failed to initialize virtual disk. Exiting.\n");
        return 1;
    }

    int choice;
    char filename[MAX_FILENAME_LEN];
    int size;
    char data_to_write[VIRTUAL_DISK_SIZE]; // Max data to write is disk size, though practically much less for a single file
    char read_buffer[VIRTUAL_DISK_SIZE]; // Max data to read is disk size, though practically much less for a single file

    do {
        choice = display_menu();
        switch (choice) {
            case 1: // Create File
                printf("Enter filename: ");
                fgets(filename, MAX_FILENAME_LEN, stdin);
                filename[strcspn(filename, "\n")] = 0; // Remove newline
                printf("Enter size (bytes): ");
                scanf("%d", &size);
                while (getchar() != '\n'); // Clear input buffer
                // For simplicity, create files with R/W permissions by default
                create_file(filename, size, true, true);
                break;
            case 2: // Write File
                printf("Enter filename: ");
                fgets(filename, MAX_FILENAME_LEN, stdin);
                filename[strcspn(filename, "\n")] = 0; // Remove newline
                printf("Enter data to write: ");
                fgets(data_to_write, sizeof(data_to_write), stdin);
                data_to_write[strcspn(data_to_write, "\n")] = 0; // Remove newline
                write_file(filename, data_to_write);
                break;
            case 3: // Read File
                printf("Enter filename: ");
                fgets(filename, MAX_FILENAME_LEN, stdin);
                filename[strcspn(filename, "\n")] = 0; // Remove newline
                read_file(filename, read_buffer, sizeof(read_buffer));
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

    close_disk();
    return 0;
}
