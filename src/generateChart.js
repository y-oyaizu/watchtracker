function generateBarChart(dailyWatchTime) {
  var parentFolderName = "YouTubeHistoryManagement";
  var reportFolderName = "reportChart";
  var currentDate = getCurrentDate(); // Get execution date in YYYY-MM-DD format

  // Get or create parent folder
  var parentFolder = getOrCreateFolder(parentFolderName);

  // Get or create "reportChart" folder inside "YouTubeHistoryManagement"
  var reportFolder = getOrCreateFolderInParent(parentFolder, reportFolderName);

  // Create new spreadsheet
  var spreadsheet = SpreadsheetApp.create("YouTube Watch Time Chart");
  var sheet = spreadsheet.getActiveSheet();
  sheet.setName("WatchTimeChart");

  // Add headers
  sheet.appendRow(["Date", "Watch Time (minutes)"]);

  var row = 2;
  for (var date in dailyWatchTime) {
    var watchTimeStr = dailyWatchTime[date][0];
    var watchTimeMinutes = watchTimeStr !== "----" ? parseWatchTime(watchTimeStr) : 0;
    sheet.appendRow([date, watchTimeMinutes]);
    row++;
  }

  // Create bar chart
  var chart = sheet.newChart()
    .setChartType(Charts.ChartType.BAR)
    .addRange(sheet.getRange("A1:B" + (row - 1)))
    .setPosition(3, 2, 0, 0)
    .setOption("title", "YouTube Watch Time per Day")
    .setOption("hAxis.title", "Minutes Watched")
    .setOption("vAxis.title", "Date")
    .setOption("legend", "none")
    .setOption("bars", "horizontal")
    .setOption("colors", ["#4285F4"])
    .setOption("height", Math.max(600, row * 30))
    .setOption("width", 1000)
    .build();

  sheet.insertChart(chart);
  SpreadsheetApp.flush();
  Utilities.sleep(2000); // Ensure the chart renders

  // Save chart as PNG
  var chartBlob = chart.getBlob();
  var imageFile = reportFolder.createFile(chartBlob).setName(`YouTubeWatchTimeChart_${currentDate}.png`);

  // Convert PNG to PDF with execution date in filename
  var pdfBlob = DriveApp.createFile(imageFile.getBlob()).setName(`YouTubeWatchTimeReport_${currentDate}.pdf`);

  Logger.log(`Chart PDF saved: ${pdfBlob.getUrl()}`);
  return pdfBlob.getId();
}

/**
 * Converts "Xh Ym" format to minutes.
 */
function parseWatchTime(timeString) {
  if (timeString === "----") return 0;
  var parts = timeString.match(/(\d+)h\s*(\d+)m?/);
  return (parseInt(parts[1]) || 0) * 60 + (parseInt(parts[2]) || 0);
}
