"use strict";

/**
 * Converts minutes to "Xh Ym" format (e.g., "7h 31m") to avoid confusion with seconds.
 * @param {number} minutes - Total minutes.
 * @returns {string} Formatted time as "Xh Ym".
 */
function convertToHourMinuteFormat(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
}

/**
 * Sorts channel watch time in descending order.
 * @param {Object} channelWatchTime - Object containing channel names as keys and watch time (in HH:MM) as values.
 * @returns {Object} Sorted object with watch time in descending order.
 */

function sortChannelWatchTimeDescending(channelWatchTime) {
    return Object.fromEntries(
        Object.entries(channelWatchTime)
            .map(([channel, time]) => [channel, convertToHourMinuteFormat(time)]) // Ensure all times are in Xh Ym format
            .sort((a, b) => parseTimeToMinutes(b[1]) - parseTimeToMinutes(a[1])) // Sort by total minutes
            .slice(0, 10)
    );
}


/**
 * Fills missing dates in the watch history with "----" and adds weekday information.
 * @param {Object} dailyWatchTime - Object with date keys and watch time in HH:MM format.
 * @returns {Object} Updated object with missing dates filled.
 */

function fillMissingDates(dailyWatchTime, dailyStartTime) {
    let startDate = new Date(Object.keys(dailyWatchTime).reduce((a, b) => (a < b ? a : b)));
    let endDate = new Date(Object.keys(dailyWatchTime).reduce((a, b) => (a > b ? a : b)));
    let filledDailyWatchTime = {};

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        let dateStr = d.toISOString().split("T")[0];
        let weekday = weekdays[d.getDay()];
        let formattedDate = `${dateStr} (${weekday})`;

        let watchTime = dailyWatchTime[dateStr]
            ? convertToHourMinuteFormat(parseFloat(dailyWatchTime[dateStr]))
            : "----";

        let startTime = dailyStartTime[dateStr] || "--:--"; // Default to "--:--" if missing

        // Store as ["Watch Time", "Start Time"]
        filledDailyWatchTime[formattedDate] = [watchTime, startTime];
    }

    return filledDailyWatchTime;
}



/**
 * Sorts daily watch time in ascending order.
 * @param {Object} dailyWatchTime - Object with date keys.
 * @returns {Object} Sorted object.
 */
function sortDailyWatchTimeAscending(dailyWatchTime) {
    return Object.fromEntries(
        Object.entries(dailyWatchTime)
            .sort((a, b) => new Date(a[0].split(" ")[0]) - new Date(b[0].split(" ")[0])) // Sort by date ascending
    );
}

/**
 * Converts "Xh Ym" format to total minutes for sorting.
 * @param {string} timeStr - Time string in "Xh Ym" format.
 * @returns {number} Total minutes.
 */
function parseTimeToMinutes(timeStr) {
    if (timeStr === "----") return 0; // Treat empty values as 0 minutes
    let parts = timeStr.match(/(\d+)h\s*(\d+)?m?/);
    if (!parts) return 0; // Return 0 if format is incorrect

    let hours = parseInt(parts[1]) || 0;
    let minutes = parseInt(parts[2]) || 0;
    return hours * 60 + minutes;
}

/**
 * Calculates the total watch time, watch time per channel, and watch time per day.
 * Only considers watch history within the last 35 days.
 *
 * @param {Array} watchHistory - List of watch history records.
 * @returns {Object} Aggregated watch time data.
 */
function calculateWatchTime(watchHistory) {
    let totalWatchTime = 0;
    let channelWatchTime = {};
    let dailyWatchTime = {};
    let dailyStartTime = {}; // Store earliest start time per day

    let today = new Date();
    let cutoffDate = new Date();
    cutoffDate.setDate(today.getDate() - 35);

    watchHistory.forEach(entry => {
        let watchDate = new Date(entry["Year"], entry["Month"] - 1, entry["Day"]);
        let watchTime = Math.round(parseFloat(entry["Estimated Watch Time (min)"])); // Ensure integer minutes
        let dateStr = `${entry["Year"]}-${String(entry["Month"]).padStart(2, '0')}-${String(entry["Day"]).padStart(2, '0')}`;

        // Extract Start Time from "Chicago Time"
        let startTime = "--:--"; // Default value
        if (entry["Chicago Time"] instanceof Date) {
            startTime = entry["Chicago Time"].toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
        } else if (typeof entry["Chicago Time"] === "string" && entry["Chicago Time"].includes(" ")) {
            let timeParts = entry["Chicago Time"].split(" ");
            if (timeParts.length > 1) {
                startTime = timeParts[1].slice(0, 5); // Extract HH:MM
            }
        }

        if (watchDate >= cutoffDate) {
            totalWatchTime += watchTime;

            if (!channelWatchTime[entry["Channel Name"]]) {
                channelWatchTime[entry["Channel Name"]] = 0;
            }
            channelWatchTime[entry["Channel Name"]] += watchTime;

            if (!dailyWatchTime[dateStr]) {
                dailyWatchTime[dateStr] = 0;
                dailyStartTime[dateStr] = startTime;
            } else {
                // Store the earliest time (smallest HH:MM value)
                if (startTime !== "--:--" && (dailyStartTime[dateStr] === "--:--" || startTime < dailyStartTime[dateStr])) {
                    dailyStartTime[dateStr] = startTime;
                }
            }
            dailyWatchTime[dateStr] += watchTime;
        }
    });

    return {
        totalWatchTime: convertToHourMinuteFormat(totalWatchTime),
        channelWatchTime: sortChannelWatchTimeDescending(channelWatchTime),
        dailyWatchTime: sortDailyWatchTimeAscending(fillMissingDates(dailyWatchTime, dailyStartTime))
    };
}
