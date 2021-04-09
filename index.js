// Globals and constants
const queryString = "https://api.thingspeak.com/channels/1336115/feeds.json?api_key=DKIU4QVAFAC8Z5T3&results=100";
var tests = new Map(); // Create Map object to hold data (acts like a local database)

// Get data from Thingspeak
fetch(queryString)
  .then(response => response.json())
  .then(data => {
    // Collect downloaded data using "DeviceID" as the key value
    const feeds = data.feeds;
    data.feeds.forEach(function(feed, i, feeds) {
      // Add a new entry in the selection list if this is a new one
      if (!tests.has(feed.field1)) {
        $("#selectDeviceList").append(new Option(feed.field1, feed.field1));
      }
      // Update "tests" data (overwrite until last one - i.e. the most recent for each DeviceID)
      tests.set(feed.field1, {
        typeOfAnalysis: feed.field2,
        CF: feed.field3,
        result: feed.field4
      });
    });
  });

  // Act on the selection list
  $("#selectDeviceList").change(() => {
    // Check if the selection exists inside "tests"
    if (tests.has($("#selectDeviceList").val())) {
      // Retrieve test data
      let test = tests.get($("#selectDeviceList").val());
      // Show data
      $("#typeOfAnalysisField").text(test.typeOfAnalysis);
      $("#CFField").text(test.CF);
      // Show positive/negative image
      if (test.result === "true") {
        $(".test-result-image").attr("src","images/test-positive.svg");
      } else {
        $(".test-result-image").attr("src","images/test-negative.svg");
      }
    } else {
      // Fill with default values
      $("#typeOfAnalysisField").text("-");
      $("#CFField").text("-");
      $("#resultField").text("-");
      $(".test-result-image").attr("src","images/test-clear.svg");
    }
  });
