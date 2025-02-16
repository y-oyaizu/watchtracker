function analyzeWatchHistory(watchHistory) {
  if (!watchHistory || watchHistory.length === 0) {
    Logger.log("❌ No watch history data provided.");
    return "❌ No watch history data available.";
  }

  // Extract video titles
  var titles = watchHistory.map(entry => entry["Title"].replace(" を視聴しました", ""));

  // Get the child's birth year and month from Script Properties
  var birthYearMonth = PropertiesService.getScriptProperties().getProperty("CHILD_BIRTH_YYYY_MM");
  if (!birthYearMonth) {
    Logger.log("❌ Birth year and month not set in Script Properties.");
    return "❌ Birth year and month not set.";
  }

  // Analyze content using OpenAI API
  var analysisResult = analyzeWithOpenAI(titles, birthYearMonth);

  // Save the analysis result to Google Drive
  saveFileToDrive("YouTubeHistoryManagement", "content_risk_report.json", JSON.stringify(analysisResult, null, 2), "application/json");

  // Generate summary text instead of sending email
  var report = `YouTube Watch History Analysis:\n\n` +
               `- Safe (Level 1): ${analysisResult.riskCounts["1 (Safe)"]} videos\n` +
               `- Mildly Inappropriate (Level 2): ${analysisResult.riskCounts["2 (Mildly inappropriate)"]} videos\n` +
               `- Potentially Harmful (Level 3): ${analysisResult.riskCounts["3 (Potentially harmful)"]} videos\n` +
               `- Harmful (Level 4): ${analysisResult.riskCounts["4 (Harmful)"]} videos\n\n`;

  if (analysisResult.harmfulTitles.length > 0) {
    report += "Potentially harmful videos detected (Level 3 & 4):\n" + analysisResult.harmfulTitles.join("\n") + "\n";
  } else {
    report += "✅ No harmful videos detected.\n";
  }

  return report;
}


function analyzeWithOpenAI(titles, birthYearMonth) {
  var apiKey = PropertiesService.getScriptProperties().getProperty("OPENAI_API_KEY");

  if (!apiKey) {
    Logger.log("❌ API key is missing in Script Properties.");
    return { error: "API key is missing. Please set OPENAI_API_KEY in Script Properties." };
  }

  var url = "https://api.openai.com/v1/chat/completions";

  var riskCounts = { "1 (Safe)": 0, "2 (Mildly inappropriate)": 0, "3 (Potentially harmful)": 0, "4 (Harmful)": 0 };
  var harmfulTitles = [];
  var analyzedResults = [];

  titles.forEach(title => {
    var messages = [
      { role: "user", content: `Evaluate the following YouTube video title for harmful content for a child born in ${birthYearMonth}.
                                 Classify it into four levels:
                                 - 1 (Safe)
                                 - 2 (Mildly inappropriate)
                                 - 3 (Potentially harmful)
                                 - 4 (Harmful)

                                 Return only the numeric classification.

                                 Title: ${title}` }
    ];

    var payload = {
      model: "gpt-4o",
      messages: messages,
      temperature: 0.3
    };

    var options = {
      method: "post",
      headers: {
        "Authorization": "Bearer " + apiKey,
        "Content-Type": "application/json"
      },
      payload: JSON.stringify(payload)
    };

    try {
      var response = UrlFetchApp.fetch(url, options);
      var responseData = JSON.parse(response.getContentText());

      if (!responseData.choices || responseData.choices.length === 0) {
        Logger.log("❌ Invalid API response: " + JSON.stringify(responseData, null, 2));
        return;
      }

      var riskLevel = responseData.choices[0].message.content.trim();

      if (riskLevel === "1") riskCounts["1 (Safe)"]++;
      else if (riskLevel === "2") riskCounts["2 (Mildly inappropriate)"]++;
      else if (riskLevel === "3") {
        riskCounts["3 (Potentially harmful)"]++;
        harmfulTitles.push(title);
      }
      else if (riskLevel === "4") {
        riskCounts["4 (Harmful)"]++;
        harmfulTitles.push(title);
      }

      analyzedResults.push({ title, riskLevel });

      Utilities.sleep(500);

    } catch (e) {
      Logger.log("❌ OpenAI API Request Failed: " + e.toString());
    }
  });

  var resultData = {
    timestamp: new Date().toISOString(),
    riskCounts: riskCounts,
    harmfulTitles: harmfulTitles,
    analyzedResults: analyzedResults
  };

  return resultData;
}
