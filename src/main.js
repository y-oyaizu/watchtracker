"use strict";
// Define the file path for the current month's watch history JSON file

function main() {
  console.log("🔍 Searching for the latest ZIP file...");

  const latestZip = getLatestZipInSharedFolder();

  if (!latestZip) {
    console.error("❌ No ZIP file found in Shared with me.");
    return;
  }

  console.log(`📂 Found ZIP: ${latestZip}`);
  console.log("📦 Extracting watch-history.json...");

  const jsonFileId = extractWatchHistoryFromSharedZip(latestZip); // extract json file from zip

  console.log("✅ Extraction process completed!");

  if (!jsonFileId) {
    console.error("❌ Failed to extract watch-history.json");
    return;
  }

  console.log(`✅ Extracted watch-history.json with File ID: ${jsonFileId}`);
  console.log("📊 Importing data into Google Spreadsheet...");

  const {spreadsheetUrl, sheetName} = importWatchHistory(jsonFileId); // transform json to sheet

  let watchHistory = getWatchHistoryFromSheet(spreadsheetUrl, sheetName);
  let watchTimeData = calculateWatchTime(watchHistory);

  console.log("📊 Watch time data successfully aggregated:");
  console.log(watchTimeData);

  let analyzedContentReport = analyzeWatchHistory(watchHistory);
  console.log("📊 Analyzed Content Report:");

  let fileId = generateBarChart(watchTimeData.dailyWatchTime);

  sendEmail(fileId,watchTimeData,analyzedContentReport);
  console.log("📧 Email sent with the report!");

}
