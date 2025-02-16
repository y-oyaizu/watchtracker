"use strict";

function getCurrentDate() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}
// utils.ts
/**
 * Search for the latest ZIP file in "Shared with me" folder
 * @returns {string | null} The name of the latest ZIP file or null if none found
 */
function getLatestZipInSharedFolder() {
    try {
        const zipFiles = DriveApp.searchFiles("title contains '.zip' and trashed = false");
        let latestFile = null;
        let latestDate = 0;
        while (zipFiles.hasNext()) {
            const file = zipFiles.next();
            const createdDate = file.getDateCreated().getTime();
            if (createdDate > latestDate) {
                latestDate = createdDate;
                latestFile = file;
            }
        }
        return latestFile ? latestFile.getName() : null;
    }
    catch (error) {
        console.error("Error finding latest ZIP file:", error);
        return null;
    }
}
/**
 * Extract watch-history.json from a ZIP file in Shared with me and save it to My Drive
 * @param {string} zipFileName - The name of the ZIP file
 */
function extractWatchHistoryFromSharedZip(zipFileName) {
    const targetFolderName = "YouTubeHistoryManagement";

    try {
        // 1️⃣ Search for ZIP file in "Shared with me"
        const zipFiles = DriveApp.searchFiles(`title = '${zipFileName}' and trashed = false`);
        if (!zipFiles.hasNext()) {
            console.error("❌ ZIP file not found in Shared with me.");
            return;
        }

        const zipFile = zipFiles.next();
        console.log(`📂 Found ZIP file: ${zipFile.getName()}`);
        console.log(`📦 MIME Type: ${zipFile.getMimeType()}`);

        // 2️⃣ Move ZIP file to My Drive (`YouTubeHistoryManagement` folder)
        let targetFolder;
        const folders = DriveApp.getFoldersByName(targetFolderName);
        if (folders.hasNext()) {
            targetFolder = folders.next();
        } else {
            console.log(`🚀 Creating folder: ${targetFolderName}`);
            targetFolder = DriveApp.createFolder(targetFolderName);
        }

        console.log(`📦 Copying ZIP to ${targetFolder.getName()}...`);
        const copiedZipFile = targetFolder.createFile(zipFile.getBlob()).setName(zipFile.getName());
        console.log(`✅ ZIP successfully copied to ${targetFolder.getName()}`);

        // 3️⃣ Retrieve the copied ZIP from Google Drive using Drive API (instead of DriveApp)
        console.log("📦 Fetching ZIP from Drive API...");
        const copiedZipFileId = copiedZipFile.getId();
        const url = `https://www.googleapis.com/drive/v3/files/${copiedZipFileId}?alt=media`;
        const options = {
            headers: {
                Authorization: "Bearer " + ScriptApp.getOAuthToken()
            }
        };
        const response = UrlFetchApp.fetch(url, options);
        const zipBlob = response.getBlob();

        console.log(`📦 ZIP file size: ${zipBlob.getBytes().length} bytes`);
        console.log(`📦 MIME Type before unzipping: ${zipBlob.getContentType()}`);
        console.log("📦 ZIP first 10 bytes: " + zipBlob.getBytes().slice(0, 10));

        // 4️⃣ Unzip the file
        console.log("📦 Unzipping ZIP with Unzipjs...");
        let blobs = [];
        try {
          const bytes = zipBlob.getBytes();
          const uint8Array = new Uint8Array(bytes);
          const unzipper = new Unzipjs.Zlib.Unzip(uint8Array);
          const filenames = unzipper.getFilenames();
          filenames.forEach(function(filename) {
            const fileData = unzipper.decompress(filename);
            if (fileData) {
              blobs.push(Utilities.newBlob(Array.from(fileData), null, filename));
            }
          });
        } catch (error) {
          console.error("❌ Error during unzip with Unzipjs:", error);
          return;
        }

        if (blobs.length === 0) {
          console.error("❌ No files extracted from ZIP.");
          return;
        }

        console.log(`✅ Extracted ${blobs.length} files from ZIP.`);

        let jsonBlob = null;
        for (const blob of blobs) {
          console.log(`📄 Extracted file: ${blob.getName()}, MIME Type: ${blob.getContentType()}, Size: ${blob.getBytes().length} bytes`);
          if (blob.getName().includes("watch-history.json")) {
            jsonBlob = blob;
            break;
          }
        }

        if (!jsonBlob) {
          console.error("❌ watch-history.json not found in ZIP.");
          return;
        }

        // 5️⃣ Save `watch-history.json` to `YouTubeHistoryManagement`
        const existingFiles = targetFolder.getFilesByName("watch-history.json");
        while (existingFiles.hasNext()) {
            existingFiles.next().setTrashed(true);
        }

        jsonBlob = jsonBlob.setName(getCurrentDate() + '_watch-history.json');
        const jsonFile = targetFolder.createFile(jsonBlob);
        console.log(`✅ ${getCurrentDate()}_watch-history.json saved to ${targetFolder.getName()}`);

        // 6️⃣ Delete copied ZIP if needed
        copiedZipFile.setTrashed(true);
        console.log(`🗑 Deleted copied ZIP from ${targetFolder.getName()}`);

        // 7️⃣ Return the ID of the extracted JSON file
        return jsonFile.getId();

    } catch (error) {
        console.error(`❌ Error extracting watch-history.json: ${error.message}`);
    }
}

/**
 * Finds or creates a folder by name.
 */
function getOrCreateFolder(folderName) {
  var folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

/**
 * Finds or creates a subfolder inside a given parent folder.
 */
function getOrCreateFolderInParent(parentFolder, subFolderName) {
  var folders = parentFolder.getFoldersByName(subFolderName);
  return folders.hasNext() ? folders.next() : parentFolder.createFolder(subFolderName);
}

/**
 * Saves a file to Google Drive, updating it if it already exists.
 * @param {string} folderName - The name of the folder in Google Drive.
 * @param {string} fileName - The name of the file to save.
 * @param {string} content - The content to save (JSON, text, etc.).
 * @param {string} mimeType - The MIME type of the file (default: `MimeType.PLAIN_TEXT`).
 */
function saveFileToDrive(folderName, fileName, content, mimeType = "application/json") {
  var folder = getOrCreateFolder(folderName);
  var fileIterator = folder.getFilesByName(fileName);

  if (fileIterator.hasNext()) {
    var existingFile = fileIterator.next();
    existingFile.setContent(content);
    Logger.log(`✅ Updated existing file: ${fileName}`);
  } else {
    folder.createFile(fileName, content, mimeType);
    Logger.log(`✅ Created new file: ${fileName}`);
  }
}
