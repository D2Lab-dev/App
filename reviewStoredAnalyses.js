// Globals and constants
const queryString = "https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=100";
var analyses = new Map(); // Create Map object to hold data (acts like a local database)

// Get data from Thingspeak and correct the chronological misalignment between "parameters" and the rest of the data
fetch(queryString)
  .then(response => response.json())
  .then(data => {
    // Collect downloaded data
    const feeds = data.feeds;
    let analysisFragment;
    data.feeds.forEach(function(feed, i, feeds) {
      // Special actions must be taken due to the chronological misalignment of "parameters" and the rest of the data
      if (feed.field1 === null & analysisFragment != "") {
        // Add data to Map object. Only "parameters" will be taken from this record
        analyses.set(analysisFragment.field1, {
          Vwe: analysisFragment.field2,
          Vre: JSON.parse(analysisFragment.field3),
          calibration: analysisFragment.field4,
          concentrationVector: JSON.parse(analysisFragment.field5),
          parameters: JSON.parse(feed.field6)
        });
        // Add a new entry in the selection list
        $("#selectAnalysisList").append(new Option(analysisFragment.field1, analysisFragment.field1));
        // Clear analysisFragment
        analysisFragment = "";
      } else {
        // Store partial data (i.e. all but parameters) to be used in next iteration
        analysisFragment = feed;
      }
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
    $("#calibrationTypeField").text(analysis.calibration);
    // Pretty print the JSON string held by analysis.parameters
    let parametersPrettyPrint = analysis.parameters;
    parametersPrettyPrint = parametersPrettyPrint.replace("{",""); // Remove {
    parametersPrettyPrint = parametersPrettyPrint.replace("}",""); // Remove }
    parametersPrettyPrint = parametersPrettyPrint.replace(/"/g,""); // Remove all the ""
    parametersPrettyPrint = parametersPrettyPrint.replace(/:/g," = "); // Replace : with =
    parametersPrettyPrint = parametersPrettyPrint.replace(/,/g,", "); // Add spaces after ,
    $("#parametersField").text(parametersPrettyPrint);
  } else {
    // Fill with default values
    $("#VweField").text("- V");
    $("#VreField").text("from - V to - V");
    $("#calibrationTypeField").text("-");
    $("#parametersField").text("-");
  }
});
