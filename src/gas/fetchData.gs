"use strict";
/// <reference path="./global.d.ts" />
globalThis.fetchData = globalThis.fetchData || {};
globalThis.fetchData = {
    loadHistory: function (fileName) {
        try {
            const files = DriveApp.getFilesByName(fileName);
            if (!files.hasNext()) {
                console.error("File not found: " + fileName);
                return [];
            }
            const file = files.next();
            const content = file.getBlob().getDataAsString(); // Read the file as a string
            return JSON.parse(content); // Convert JSON string to an object
        }
        catch (error) {
            console.error("Failed to load watch history:", error);
            return [];
        }
    }
};
