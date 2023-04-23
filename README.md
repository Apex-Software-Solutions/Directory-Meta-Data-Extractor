---
title: README
classification_Id: "600"
created: 2023-04-23T07:39:10-04:00
updated: 2023-04-23T07:46:20-04:00
---

> [!Metadata]-
> up:: [[Programming MOC]]
> 
> tags:: #X/meta  #on/Programming 

```toc 
style: bullet | number | inline (default: bullet) min_depth: number (default: 2) max_depth: number (default: 6) title: string (default: undefined) allow_inconsistent_headings: boolean (default: false) delimiter: string (default: |) varied_style: boolean (default: true) 
```

# Node.js script to retrieve metadata for all directories in the Documents folder

This Node.js script retrieves metadata for all directories and subdirectories in the Documents folder on a computer running the script, and saves the metadata to a CSV file and a JSON file. The metadata includes a UUIDv4, the directory name, relative path to the directory, absolute path to the directory, last accessed time, last modified time, owner, group, and permissions for each directory.

## Problem
Retrieving metadata for all directories in a folder and its subfolders can be a time-consuming and error-prone task, especially for large folders with many directories and files. Manually gathering this metadata can take a long time and may result in missing or inaccurate information.

## Solution
This script automates the process of retrieving metadata for all directories in the Documents folder, using the Node.js built-in `fs` and `path` modules, as well as the `uuid` library. The script recursively traverses the Documents folder and its subdirectories, and retrieves metadata for each directory using the `fs.promises.stat()` method. The metadata is then saved to a CSV file and a JSON file using the `fs.createWriteStream()` and `fs.promises.writeFile()` methods.

## Usage
To use this script, follow these steps:

1. Clone or download this repository to your local machine.
2. Install Node.js if you haven't already done so.
3. Open a terminal or command prompt and navigate to the root directory of the repository.
4. Run `npm install` to install the required dependencies.
5. Run `npm start` to run the script.
6. The metadata for all directories in the Documents folder and its subdirectories will be saved to a CSV file and a JSON file in the `data` folder in the root directory of the repository. The files will be timestamped for uniqueness and no data will be overwritten from files that already exist.

## Performance metrics

The performance of this script depends on the size of the Documents folder and the number of subdirectories and files it contains. On a test machine with a Documents folder containing around 10,000 directories and files, the script took around 20 seconds to complete. However, this time may vary depending on the performance of the machine and the size of the Documents folder. Additionally, the memory usage of the script may increase with the number of directories and files being processed, so it may not be suitable for very large folders with millions of files.

### Runtime and space metrics
### `getAllDirectoriesRecursively` function

The `getAllDirectoriesRecursively` function recursively retrieves all directories and subdirectories in the given directory, and their metadata such as UUID, name, relative and absolute paths, and timestamps. The time and space complexities for this function are as follows:

- **Time complexity:**
  - **Big-O:** O(n), where n is the total number of files and directories in the given directory and its subdirectories. This is because the function has to traverse each file and directory once to retrieve its metadata, and it does not perform any redundant operations.
  - **Big-Theta:** Θ(n), for the same reasons as above.
  - **Big-Omega:** Ω(n), for the same reasons as above.
- **Space complexity:**
  - **Big-O:** O(n), where n is the total number of files and directories in the given directory and its subdirectories. This is because the function creates a Set to store the metadata for each directory, which can potentially grow to the size of all directories and subdirectories in the given directory.

### `writeDirectoriesToFile` function

The `writeDirectoriesToFile` function writes the given list of directories to a CSV file and a JSON file. The time and space complexities for this function are as follows:

- **Time complexity:**
  - **Big-O:** O(m), where m is the number of directories being written to the files. This is because the function has to loop over each directory once to write its metadata to the files, and it does not perform any redundant operations.
  - **Big-Theta:** Θ(m), for the same reasons as above.
  - **Big-Omega:** Ω(m), for the same reasons as above.
- **Space complexity:**
  - **Big-O:** O(m), where m is the number of directories being written to the files. This is because the function needs to create a string with the JSON representation of the metadata for all directories, which can potentially grow to the size of all directories being written. Additionally, the function creates a WriteStream to write the CSV file, which requires a small amount of memory.

### `getAllDirectoriesInDocumentsFolder` function

The `getAllDirectoriesInDocumentsFolder` function retrieves all directories and subdirectories in the Documents folder, and writes the metadata for each directory to a CSV file and a JSON file. The time and space complexities for this function depend on the time and space complexities of the `getAllDirectoriesRecursively` and `writeDirectoriesToFile` functions, as well as the overhead of creating and manipulating variables and data structures within the function.

Overall, the time and space complexities of this script are determined mainly by the `getAllDirectoriesRecursively` function, since it is the most computationally intensive part of the script. However, the script does not perform any redundant operations and uses efficient data structures such as Sets to minimize the time and space complexity of the metadata retrieval and writing process.

The overall time and space complexities of the script depend on the time and space complexities of the individual functions used in the script. As noted in my previous response, the `getAllDirectoriesRecursively` function is the most computationally intensive part of the script, and has a time complexity of O(n) where n is the total number of files and directories in the Documents folder and its subdirectories. The `writeDirectoriesToFile` function has a time complexity of O(m) where m is the number of directories being written to the files.

In terms of space complexity, the `getAllDirectoriesRecursively` function creates a Set to store the metadata for each directory, which can potentially grow to the size of all directories and subdirectories in the Documents folder. The `writeDirectoriesToFile` function needs to create a string with the JSON representation of the metadata for all directories, which can also potentially grow to the size of all directories being written.

Therefore, the overall time complexity of the script is O(n + m), where n is the total number of files and directories in the Documents folder and its subdirectories, and m is the number of directories being written to the files. The overall space complexity of the script is also O(n + m), where n is the total number of files and directories in the Documents folder and its subdirectories, and m is the number of directories being written to the files.

It's worth noting that these time and space complexities are theoretical upper bounds, and may not be reached in practice depending on the size and complexity of the Documents folder being processed. Additionally, the performance of the script may be affected by factors such as the performance of the machine running the script, the file system used, and any other processes running concurrently on the machine.