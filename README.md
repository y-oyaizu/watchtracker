# WatchTracker

WatchTracker is a Google Apps Script project designed to track and analyze YouTube watch history. It imports watch history data from a JSON file, processes it, and generates reports including charts and email summaries.

## Features

- **Import Watch History**: Import watch history data from a JSON file stored in Google Drive.
- **Calculate Watch Time**: Aggregate total watch time, watch time per channel, and watch time per day.
- **Generate Charts**: Create bar charts to visualize daily watch time.
- **Send Email Reports**: Send email reports with watch time summaries and charts.
- **Analyze Content**: Analyze video titles for harmful content using OpenAI API.

## Setup

1. **Clone the Repository**: Clone this repository to your local machine or directly to your Google Apps Script project.

2. **Set Up Script Properties**:
   - `RECIPIENT_EMAIL`: Comma-separated list of email addresses to receive the reports.
   - `CHILD_BIRTH_YYYY_MM`: Child's birth year and month in `YYYY-MM` format.
   - `OPENAI_API_KEY`: API key for OpenAI.

3. **Install Dependencies**:
    - Add the `Unzipjs` library to your project. Follow the instructions [here](https://tech.actindi.net/2021/10/01/101244) to register the library.

## Usage

1. **Import Watch History**:
   - Run the `main` function to start the process.
   - The script will search for the latest ZIP file in the "Shared with me" folder, extract the `watch-history.json` file, and import the data into a Google Spreadsheet.

2. **Generate Reports**:
   - The script will calculate watch time, generate charts, and send email reports with the aggregated data and analysis.

## Functions

### Main Functions

- **main**: The main entry point of the script. It handles the entire process from importing data to sending email reports.

### Import Functions

- **importWatchHistory**: Imports watch history data from a JSON file and inserts it into a Google Spreadsheet.
- **getOrCreateSpreadsheet**: Retrieves or creates a Google Spreadsheet.
- **getOrCreateSheet**: Retrieves or creates a sheet within the spreadsheet.
- **getJsonData**: Fetches JSON data from a file in Google Drive.

### Watch Time Calculation Functions

- **calculateWatchTime**: Calculates total watch time, watch time per channel, and watch time per day.
- **convertToHourMinuteFormat**: Converts minutes to "Xh Ym" format.
- **sortChannelWatchTimeDescending**: Sorts channel watch time in descending order.
- **fillMissingDates**: Fills missing dates in the watch history with placeholders.
- **sortDailyWatchTimeAscending**: Sorts daily watch time in ascending order.
- **parseTimeToMinutes**: Converts "Xh Ym" format to total minutes.

### Chart Generation Functions

- **generateBarChart**: Generates a bar chart for daily watch time and saves it as a PDF.

### Email Functions

- **sendEmail**: Sends an email report with watch time data and charts.

### Content Analysis Functions

- **analyzeWatchHistory**: Analyzes watch history for harmful content using OpenAI API.
- **analyzeWithOpenAI**: Sends video titles to OpenAI API for content analysis.

### Utility Functions

- **getCurrentDate**: Returns the current date in `YYYY-MM-DD` format.
- **getLatestZipInSharedFolder**: Searches for the latest ZIP file in the "Shared with me" folder.
- **extractWatchHistoryFromSharedZip**: Extracts `watch-history.json` from a ZIP file and saves it to Google Drive.
- **getOrCreateFolder**: Finds or creates a folder by name.
- **getOrCreateFolderInParent**: Finds or creates a subfolder inside a given parent folder.
- **saveFileToDrive**: Saves a file to Google Drive, updating it if it already exists.

## License

This project is licensed under the MIT License.