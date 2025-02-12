function importWatchHistory(jsonFileId) {
  var sheetName = "rawData"; // set sheet name

  var ss = getOrCreateSpreadsheet();
  var sheet = getOrCreateSheet(ss, sheetName);

  var data = getJsonData(jsonFileId);
  if (!data || data.length === 0) {
    console.error("❌ No data found in JSON.");
    return;
  }

  var formattedData = processWatchData(data);
  insertDataToSheet(sheet, formattedData);

  console.log("✅ Data import completed!");
  return {
        spreadsheetUrl: ss.getUrl(),
        sheetName: sheetName
  }; // return spreadsheet URL and sheet name
}

function getOrCreateSpreadsheet() {
  var ss;
  var fileName = "WatchHistory"; // set spreadsheet name

  try {
    var files = DriveApp.getFilesByName(fileName);
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create(fileName);
      console.log("📄 New Spreadsheet Created: " + ss.getUrl());
    }
  } catch (e) {
    console.error("❌ Error: " + e.toString());
    return null;
  }

  return ss;
}

function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);

    if (sheet) {
        sheet.clear();
        Logger.log(`📄 Existing sheet '${sheetName}' found. Data cleared.`);
    } else {
        sheet = ss.insertSheet(sheetName);
        Logger.log(`🆕 New sheet '${sheetName}' created.`);
    }

    var headers = ["Title", "Channel Name", "Channel URL", "Original Time",
                   "Chicago Time", "Year", "Month", "Day", "Hour", "Minutes",
                   "Time Diff (min)", "Estimated Watch Time (min)", "Session ID"];
    sheet.appendRow(headers);

    return sheet;
}

function getJsonData(fileId) {
    try {
        console.log(`📂 Fetching JSON file with ID: ${fileId}`);

        var file = DriveApp.getFileById(fileId);
        var content = file.getBlob().getDataAsString();  // get file content as string

        return JSON.parse(content);
    } catch (error) {
        console.error(`❌ Error fetching JSON data: ${error.message}`);
        return null;
    }
}


function processWatchData(data) {
  var timezone = "America/Chicago";
    var formattedData = [];
    var prevTime = null;
    var sessionId = 1;
    var sessionTimeDiffs = [];
    var sessionStartIndex = 0;
    var sessionCounts = {};

    for (var i = 0; i < data.length; i++) {
        var entry = data[i];
        var title = entry.title;
        var name = entry.subtitles && entry.subtitles.length > 0 ? entry.subtitles[0].name : "Unknown";
        var url = entry.subtitles && entry.subtitles.length > 0 ? entry.subtitles[0].url : "N/A";
        var originalTime = new Date(entry.time);
        var chicagoTime = Utilities.formatDate(originalTime, timezone, "yyyy-MM-dd HH:mm:ss");

        var year = originalTime.getFullYear();
        var month = originalTime.getMonth() + 1;
        var day = originalTime.getDate();
        var hour = originalTime.getHours();
        var minutes = originalTime.getMinutes();

        var timeDiff = prevTime ? (prevTime - originalTime) / (1000 * 60) : null;

        if (timeDiff !== null && timeDiff > 90) {
            if (sessionTimeDiffs.length > 0) {
                var medianTime = calculateMedian(sessionTimeDiffs);
                if (!isNaN(medianTime) && medianTime !== null) {
                    formattedData[sessionStartIndex][10] = medianTime;
                    formattedData[sessionStartIndex][11] = medianTime;
                }
            }

            sessionId++;
            sessionTimeDiffs = [];
            sessionStartIndex = formattedData.length;
        }

        sessionTimeDiffs.push(timeDiff !== null ? timeDiff : 0);

        if (!sessionCounts[sessionId]) {
            sessionCounts[sessionId] = 0;
        }
        sessionCounts[sessionId]++;

        formattedData.push([
            title, name, url, originalTime, chicagoTime, year, month, day, hour, minutes,
            timeDiff, timeDiff, sessionId
        ]);

        prevTime = originalTime;
    }

    if (sessionTimeDiffs.length > 0) {
        var medianTime = calculateMedian(sessionTimeDiffs);
        if (!isNaN(medianTime) && medianTime !== null) {
            formattedData[sessionStartIndex][10] = medianTime;
            formattedData[sessionStartIndex][11] = medianTime;
        }
    }

    for (var i = 0; i < formattedData.length; i++) {
        var sessionId = formattedData[i][12];

        if (sessionCounts[sessionId] === 1) {
            formattedData[i][11] = 20;
        }

        else if (formattedData[i][10] > 90) {
            var validDiffs = sessionTimeDiffs.filter(x => x !== null && x > 0 && x <= 90);
            var maxTime = validDiffs.length > 0 ? Math.max(...validDiffs) : 20; // if no valid diffs, set to 20
            formattedData[i][11] = maxTime;
        }

        // 🔹 `NaN`/`null` , set to 20
        if (isNaN(formattedData[i][11]) || formattedData[i][11] === null) {
            formattedData[i][11] = 20;
        }
    }

    return formattedData;
}

function insertDataToSheet(sheet, formattedData) {
  var range = sheet.getRange(sheet.getLastRow() + 1, 1, formattedData.length, formattedData[0].length);
  range.setValues(formattedData);
}

function calculateMedian(values) {
  if (values.length === 0) return null;
  values.sort((a, b) => a - b);
  var mid = Math.floor(values.length / 2);
  return values.length % 2 === 0 ? (values[mid - 1] + values[mid]) / 2 : values[mid];
}
