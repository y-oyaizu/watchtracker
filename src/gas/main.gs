"use strict";
// Define the file path for the current month's watch history JSON file

function main() {
  console.log("🔍 Searching for the latest ZIP file...");

  const latestZip = getLatestZipInSharedFolder(); // utils.js の関数をそのまま使う

  if (!latestZip) {
    console.error("❌ No ZIP file found in Shared with me.");
    return;
  }

  console.log(`📂 Found ZIP: ${latestZip}`);
  console.log("📦 Extracting watch-history.json...");

  extractWatchHistoryFromSharedZip(latestZip); // ZIP を解凍 & `watch-history.json` を移動

  console.log("✅ Extraction process completed!");
}


// const historyFilePath = `watch-history-${getCurrentMonth()}.json`;
// const watchHistory = loadHistory(historyFilePath);
// ================================
// // If no watch history is found, print an error message and exit the script
// if (watchHistory.length === 0) {
//   console.error("No watch history found.");
//   process.exit(1);
// }
// // Generate a report containing aggregated watch history data
// const report = {
//   totalWatchCount: getTotalWatchCount(watchHistory),
//   watchByChannel: getWatchByChannel(watchHistory),
//   watchByDate: getWatchByDate(watchHistory),
// };
// // Update the spreadsheet with the watch history data
// writeToSheet(watchHistory).then(() => {
//   console.log("📊 Spreadsheet update complete");
//   // Send an email report
//   const recipient = "your_email@example.com";
//   const subject = `[YouTube Watch History Report] Analysis for ${getCurrentMonth()}`;
//   const body = `
//   📊 Total Watch Count: ${report.totalWatchCount}
//   🎥 Watch Count by Channel: ${JSON.stringify(report.watchByChannel, null, 2)}
//   📅 Watch Count by Date: ${JSON.stringify(report.watchByDate, null, 2)}
//   `;
//   sendEmail(recipient, subject, body);
// });
