// Globals and constants
const queryString = "https://api.thingspeak.com/channels/814496/feeds.json?api_key=1PKL71LY43MFGVMI&results=100";
var tests = new Map(); // Create Map object to hold data (acts like a local database)

function pollResultsUpdate() {
  // Get data from Thingspeak
  fetch(queryString)
  .then(response => response.json())
  .then(data => {
    // Collect downloaded data using "DeviceID" as the key value
    const feeds = data.feeds;
    data.feeds.forEach(function(feed, i, feeds) {
      // If the DeviceID field is not "null"
      if (feed.field5 != null) {
        // Add a new entry in the selection list if this is a new one
        if (!tests.has(feed.field5)) {
          $("#selectDeviceList").append(new Option(feed.field5, feed.field5));
        }
        // Update "tests" data (overwrite until last one - i.e. the most recent for each DeviceID)
        tests.set(feed.field5, {
          timestamp: feed.created_at,
          typeOfAnalysis: feed.field7,
          CF: feed.field6,
          result: feed.field8
        });
      }
    });
  });
  updateResult();
}

function updateResult() {
  // Check if the selection exists inside "tests"
  if (tests.has($("#selectDeviceList").val())) {
    // Retrieve test data
    let test = tests.get($("#selectDeviceList").val());
    // Show data
    // Pretty print timestamp
    let timestampPrint = test.timestamp;
    timestampPrint = timestampPrint.replace("T"," "); // Replace "T" with a space
    timestampPrint = timestampPrint.replace("Z",""); // Remove "Z"
    $("#timestampField").text(timestampPrint);
    $("#typeOfAnalysisField").text(test.typeOfAnalysis);
    $("#CFField").text(test.CF);
    // Show positive/negative image
    if (test.result === "true") {
      $(".test-result-image-positive").attr("src", "images/red-circle-fill.svg");
      $(".test-result-image-negative").attr("src", "images/grey-circle-fill.svg");
    } else {
      $(".test-result-image-positive").attr("src", "images/grey-circle-fill.svg");
      $(".test-result-image-negative").attr("src", "images/green-circle-fill.svg");
    }
  } else {
    // Fill with default values
    $("#timestampField").text("-");
    $("#typeOfAnalysisField").text("-");
    $("#CFField").text("-");
    $("#resultField").text("-");
    $(".test-result-image-positive").attr("src", "images/grey-circle-fill.svg");
    $(".test-result-image-negative").attr("src", "images/grey-circle-fill.svg");
  }
}

// Act on the selection list
$("#selectDeviceList").change(() => {
  updateResult();
});

setInterval(pollResultsUpdate, 2000);
