const fs = require('fs');
const path = require('path');
const { uuidv4 } = require('@apexsoftwaresolutions/uuidv4');
const os = require('os');

const DOCUMENTS_FOLDER_PATH = path.join(os.homedir(), 'Documents');
const DATA_FOLDER_PATH = path.join(process.cwd(), 'data');
const IGNORED_DIRECTORIES = ['.git', '.vscode', 'node_modules']; // Add any additional directories to ignore here

/**
 * Ensures that the data folder exists, creating it if necessary.
 *
 * @function
 * @returns {void}
 */
const ensureDataFolderExists = () => {
    if (!fs.existsSync(DATA_FOLDER_PATH)) {
        fs.mkdirSync(DATA_FOLDER_PATH);
    }
};

/**
 * Recursively retrieves all directories and subdirectories in the specified directory,
 * and retrieves their metadata such as UUID, name, relative and absolute paths, and timestamps.
 * Supports symlinked directories.
 *
 * @async
 * @function
 * @param {string} directoryPath - The absolute path of the directory to retrieve subdirectories for.
 * @param {Set} [allDirectories=new Set()] - A set to store the metadata for each directory.
 * @returns {Promise<Set>} A set containing the metadata for each directory in the specified directory and its subdirectories.
 */
const getAllDirectoriesRecursively = async (directoryPath, allDirectories = new Set()) => {
    /**
     * Get all files and directories in the specified directory using the `fs.promises.readdir` method.
     *
     * @type {string[]}
     */
    const files = await fs.promises.readdir(directoryPath);

    /**
     * Iterate over each file and directory in the specified directory, and retrieve their metadata.
     */
    for (const file of files) {
        /**
         * Get the absolute path of the file or directory using the `path.join` method.
         *
         * @type {string}
         */
        const filePath = path.join(directoryPath, file);

        /**
         * The metadata for the file or subdirectory.
         *
         * @type {fs.Stats}
         */
        const fileStat = await fs.promises.lstat(filePath);

        
        /**
         * If the file or directory is a directory, retrieve its metadata and add it to the set of directories.
         * If it is a symlink, retrieve the target absolute path using the `fs.promises.realpath` method.
         */
        if (fileStat.isDirectory()) {

            // Ignore hidden directories and 'node_modules' directory
            if (file.startsWith('.') || IGNORED_DIRECTORIES.includes(file)) {
                continue;
            }
            /**
             * Generate a UUID for the directory using the `uuidv4` method.
             *
             * @type {string}
             */
            const directoryUUID = uuidv4();

            /**
             * If the file or directory is a symlink, retrieve the target absolute path using the `fs.promises.realpath` method.
             * Otherwise, use the current file path as the absolute path.
             *
             * @type {string}
             */
            let directoryAbsolutePath = filePath;
            if (fileStat.isSymbolicLink()) {
                directoryAbsolutePath = await fs.promises.realpath(filePath);
            }

            /**
             * Get the relative path of the directory using the `path.relative` method.
             * The `DOCUMENTS_FOLDER_PATH` variable is used as the base path to generate a relative path.
             *
             * @type {string}
             */
            const directoryRelativePath = path.relative(DOCUMENTS_FOLDER_PATH, directoryAbsolutePath);

            /**
             * Create an object with the metadata for the directory, including the UUID, name, relative path,
             * absolute path, timestamps, owner, group, and permissions.
             *
             * @type {Object}
             * @property {string} uuid - The UUID of the directory.
             * @property {string} name - The name of the directory.
             * @property {string} relative_path - The relative path of the directory.
             * @property {string} absolute_path - The absolute path of the directory.
             * @property {string} last_accessed - The timestamp when the directory was last accessed.
             * @property {string} last_modified - The timestamp when the directory was last modified.
             * @property {number} owner - The UID of the owner of the directory.
             * @property {number} group - The GID of the group owner of the directory.
             * @property {string} permissions - The permissions of the directory
            */
            const directoryMetadata = {
                uuid: directoryUUID,
                name: file,
                relative_path: directoryRelativePath,
                absolute_path: directoryAbsolutePath,
                last_accessed: fileStat.atime.toISOString(),
                last_modified: fileStat.mtime.toISOString(),
                owner: fileStat.uid,
                group: fileStat.gid,
                permissions: (fileStat.mode & 0o777).toString(8), // Octal notation
            };

            /**
             * Add the directory metadata to the set of directories.
             */
            allDirectories.add(directoryMetadata);

            /**
             * Recursively retrieve the subdirectories of the current directory.
             */
            await getAllDirectoriesRecursively(directoryAbsolutePath, allDirectories);
        }
    }

    /**
     * Return the set of directories with their metadata.
     *
     * @returns {Set} The set of directories with their metadata.
     */
    return allDirectories;
}

/**
 * Writes the given list of directories to a CSV file and a JSON file.
 *
 * @async
 * @param {Object[]} directories - The list of directories to write to the files.
 * @param {string} timestamp - The timestamp to include in the file names for uniqueness.
 * @returns {Promise<void>} - A Promise that resolves when the files have been written.
 */
const writeDirectoriesToFile = async (directories, timestamp) => {
    /**
     * The path to the CSV file to write.
     *
     * @type {string}
     */
    const csvFilePath = path.join(DATA_FOLDER_PATH, `directories_${timestamp}.csv`);

    /**
     * The path to the JSON file to write.
     *
     * @type {string}
     */
    const jsonFilePath = path.join(DATA_FOLDER_PATH, `directories_${timestamp}.json`);

    /**
     * A stream to write the CSV file.
     *
     * @type {WriteStream}
     */
    const csvWriteStream = fs.createWriteStream(csvFilePath, { flags: 'a' });

    // Write the CSV header to the file.
    csvWriteStream.write('uuid,name,relative_path,absolute_path,last_accessed,last_modified,owner,group,permissions\n');

    // Write each directory to the CSV file.
    for (const directory of directories) {
        const { uuid, name, relative_path, absolute_path, last_accessed, last_modified, owner, group, permissions } = directory;
        const csvLine = `${uuid},${name},${relative_path},${absolute_path},${last_accessed},${last_modified},${owner},${group},${permissions}\n`;
        csvWriteStream.write(csvLine);
    }

    /**
     * The JSON content to write to the file.
     *
     * @type {string}
     */
    const jsonContent = JSON.stringify([...directories], null, 2);

    // Write the JSON content to the file.
    await fs.promises.writeFile(jsonFilePath, jsonContent);
};


/**
 * Retrieves all directories and subdirectories in the Documents folder,
 * and writes the metadata for each directory to a CSV file and a JSON file.
 *
 * @async
 * @returns {Promise<void>} - A Promise that resolves when the directories have been written to the files.
 */
const getAllDirectoriesInDocumentsFolder = async () => {
    /**
     * Ensures that the data folder exists, creating it if necessary.
     */
    ensureDataFolderExists();

    /**
     * The list of all directories and their metadata.
     *
     * @type {Set<Object>}
     */
    const allDirectories = await getAllDirectoriesRecursively(DOCUMENTS_FOLDER_PATH);

    main()
    /**
     * The timestamp to include in the file names for uniqueness.
     *
     * @type {string}
     */
    const timestamp = new Date().toISOString().replace(/:/g, '-');

    // Write the directories to the files.
    await writeDirectoriesToFile(allDirectories, timestamp);
};


getAllDirectoriesInDocumentsFolder();


/**
  * Recursively counts the number of directories and subdirectories in the specified directory.
  *
  * @async
  * @function
  * @param {string} directoryPath - The absolute path of the directory to count subdirectories for.
  * @returns {Promise<number>} The total number of directories and subdirectories in the specified directory.
  */
    const countDirectoriesRecursively = async (directoryPath) => {
        let count = 0;

        /**
         * Get all files and directories in the specified directory using the `fs.promises.readdir` method.
         *
         * @param {string} directoryPath - The absolute path of the directory to retrieve files and directories for.
         * @returns {Promise<string[]>} A promise that resolves to an array of files and directories in the specified directory.
         */
        const files = await fs.promises.readdir(directoryPath);

        /**
         * Iterate over each file and directory in the specified directory, and count the number of directories and subdirectories.
         *
         * @function
         * @async
         * @param {string} directoryPath - The absolute path of the directory to count subdirectories for.
         * @returns {Promise<number>} The number of directories and subdirectories in the specified directory.
         */
        for (const file of files) {
            /**
             * Get the absolute path of the file or directory using the `path.join` method.
             *
             * @param {string} directoryPath - The absolute path of the directory to get the file path for.
             * @param {string} file - The name of the file to get the path for.
             * @returns {string} The absolute path of the file or directory.
             */
            const filePath = path.join(directoryPath, file);

            /**
             * Get the metadata for the file or subdirectory using the `fs.promises.lstat` method.
             *
             * @type {fs.Stats}
             */
            const fileStat = await fs.promises.lstat(filePath);

            /**
          * If the file or directory is a directory, recursively count its subdirectories.
          *
          * @function
          * @async
          * @param {string} directoryPath - The absolute path of the directory to count subdirectories for.
          * @returns {Promise<number>} - The number of directories and subdirectories in the specified directory.
          */
            if (fileStat.isDirectory()) {
                count++; // Increment count for the current directory
                count += await countDirectoriesRecursively(filePath); // Recursively count subdirectories
            }
        }

        return count;
    };

/**
 * Calculates the percentage of directories traversed out of the total number of directories and subdirectories.
 * 
 * @async
 * @function
 * @param {number} directoriesTraversed - The number of directories traversed.
 * @param {number} totalDirectories - The total number of directories and subdirectories.
 * @returns {Promise<number>} The percentage of directories traversed.
 */
const calculatePercentageTraversed = async (directoriesTraversed, totalDirectories) => {
    const percentage = (directoriesTraversed / totalDirectories) * 100;
    return percentage.toFixed(2); // Return percentage rounded to 2 decimal places
};


const main = async () => {
    const directoryPath = DOCUMENTS_FOLDER_PATH;
    const directoryCount = await countDirectoriesRecursively(directoryPath);
    console.log(`Total directories found: ${directoryCount}`);

    let currentCount = 0;
    const files = await fs.promises.readdir(directoryPath);
    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const fileStat = await fs.promises.lstat(filePath);
        if (fileStat.isDirectory()) {
            currentCount++;
            const percentage = await calculatePercentageTraversed(currentCount, directoryCount);
            console.log(`Traversed ${percentage}% of directories`);
            currentCount += await countDirectoriesRecursively(filePath);
        }
    }
};

// main()