function sendEmail(fileId, watchData, overView = "Nothing to worry about, yeah!") {
  var file = DriveApp.getFileById(fileId);

  // Get recipient list from script properties (comma-separated)
  var recipientProperty = PropertiesService.getScriptProperties().getProperty("RECIPIENT_EMAIL");

  // Convert to a comma-separated string if stored as an array
  var recipientList = recipientProperty.includes(",") ? recipientProperty : recipientProperty.trim();
  var dates = Object.keys(watchData.dailyWatchTime);
  var startDate = dates[0]
  var endDate = dates[dates.length - 1]

  var subject = "YouTube Watch Time Report";

  var body = "Here is your latest YouTube watch time report.\n";
  body += "Period: " + startDate + " - " + endDate + "\n\n";
  body += "=======================\n";
  body += " Total Watch Time: " + watchData.totalWatchTime + "\n";
  body += "=======================\n\n";

  body += "■■■ Overview:\n";
  body += overView + "\n";

  body += "■■■ Top 10 Most-Watched Channels:\n";
  for (var channel in watchData.channelWatchTime) {
    body += "- " + channel + ": " + watchData.channelWatchTime[channel] + "\n";
  }
  body += "\n";

  body += "■■■ Daily Watch Time:\n";
  body += "Date: TotalWatchTime (StartTime)\n"
  for (var date in watchData.dailyWatchTime) {
    var watchDetail = watchData.dailyWatchTime[date];
    body += "- " + date + ": " + watchDetail[0] + " (" + watchDetail[1] + ")\n";
  }
  body += "\n";

  body += "====================\n";

  // Corrected GmailApp.sendEmail() call
  GmailApp.sendEmail(recipientList, subject, body, {
    attachments: [file.getBlob()]
  });

  Logger.log("Email sent successfully to: " + recipientList);
}
