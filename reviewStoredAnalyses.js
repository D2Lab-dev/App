// Globals and constants
const queryString = "https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=1";
var analyses = new Map(); // Create Map object to hold data (acts like a local database)

// Get data from Thingspeak
fetch(queryString)
  .then(response => response.json())
  .then(data => {
    // Collect downloaded data
        const feeds = data.feeds;
        data.feeds.forEach(function(feed, i, feeds) {
            // Add data to Map object. Only "parameters" will be taken from this record
            analyses.set(feed.field1, {
              Vwe: feed.field2,
              Vre: JSON.parse(feed.field3),
              calibration: feed.field4,
            });
            // Add a new entry in the selection list
            $("#selectAnalysisList").append(new Option(feed.field1, feed.field1));
        });
  });


// Act on the selection list
$("#selectAnalysisList").change(() => {
  // Check if the selection exists inside "analyses"
  if (analyses.has($("#selectAnalysisList").val())) {
    // Retrieve analysis data
    let analysis = analyses.get($("#selectAnalysisList").val());
    // Show data
    $("#VweField").text(analysis.Vwe + " V");
    $("#VreField").text("from " + analysis.Vre.from + " V to " + analysis.Vre.to + " V");
  } else {
    // Fill with default values
    $("#VweField").text("- V");
    $("#VreField").text("from - V to - V");
  }
});
