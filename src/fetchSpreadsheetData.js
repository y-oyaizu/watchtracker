"use strict";

/**
 * Fetch watch history data from a Google Spreadsheet.
 * @param {string} spreadsheetUrl - The URL of the Google Spreadsheet.
 * @param {string} sheetName - The name of the sheet containing the watch history.
 * @returns {Array} List of watch history records.
 */
function getWatchHistoryFromSheet(spreadsheetUrl, sheetName) {
    let ss = SpreadsheetApp.openByUrl(spreadsheetUrl);
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
        console.error(`❌ Sheet not found: ${sheetName}`);
        return [];
    }

    let data = sheet.getDataRange().getValues(); // Get all data
    let headers = data[0]; // First row as headers
    let history = [];

    for (let i = 1; i < data.length; i++) {
        let entry = {};
        for (let j = 0; j < headers.length; j++) {
            entry[headers[j]] = data[i][j];
        }
        history.push(entry);
    }

    return history;
}
