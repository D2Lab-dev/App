// Globals and constants
const queryString = "https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=100";
var analyses = new Map(); // Create Map object to hold data (acts like a local database)
var dataUpload = {}; // Hold data to be written back to Analyses DB

function rewriteDB() {
  // Bulk write data to Analyses channel
  // Ref: https://www.mathworks.com/help/thingspeak/bulkwritejsondata.html
  fetch("https://api.thingspeak.com/channels/1311141/bulk_update.json", {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dataUpload)
  })
    .then(response => response.json())
    .then(data => {
      // Console debug
      console.log(data);
    });

  // Refresh page after 2 seconds
  setTimeout("location.reload(true);", 2000);
}

function clearDB() {
  // Clear Analyses channel
  // Ref: https://www.mathworks.com/help/thingspeak/clearchannel.html
  fetch("https://api.thingspeak.com/channels/1311141/feeds.json", {
    method: "DELETE",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      api_key: '1AW3WC2CLG1FYRZG' // User API key, from "My Profile" section
    })
  });

  // Wait 15 seconds to avoid Thingspeak write limitations
  setTimeout(rewriteDB, 16000);
}

/**************************************************************/
/* Executed on stored analysis selection dropdown menu change */
/**************************************************************/
$("#selectAnalysisList").change(() => {
  // Check if the selection exists inside "analyses" and if it is different from the analysis in use
  if (analyses.has($("#selectAnalysisList").val()) & (analyses.get($("#selectAnalysisList").val()).isLast != true)) {
    // Enable save button
    $('#saveBtn').prop("disabled", false);
  } else {
    // Disable save button
    $('#saveBtn').prop("disabled", true);
  }
});

/******************************************************/
/*       Executed on "Save Changes" button click      */
/******************************************************/
$('#saveBtn').click(() => {
  // Init payload to be upladed in bulk
  // Ref: https://www.mathworks.com/help/thingspeak/bulkwritejsondata.html
  dataUpload.write_api_key = "FVRA63GCX5781VVP";
  dataUpload.updates = [];

  // Sort Analyses DB to set a new active analysis
  fetch("https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=100") // Get all data of Analyses channel
    .then(response => response.json())
    .then(data => {
      // Save and reorganize data
      let counter = 1; // Init analyses number counter to be used in the timestamp builder
      data.feeds.forEach((element, i) => { // Loop through data.feeds elements
        // Get system today date
        var dateNow = new Date(Date.now());
        // Check if this entry has to be set as the new active one
        if (element.field1 === $("#selectAnalysisList").val()) {
          dateNow.setDate(dateNow.getDate()); // Set with the oldest timestamp to set it as the last entry (i.e. the active one)
        } else {
          dateNow.setDate(dateNow.getDate() - counter); // Decrement the timestamp day value to push the entry in the oldest ones
          counter++; // Increase analyses counter
        }
        delete element["entry_id"]; // Delete field not needed for bulk write
        element.created_at = dateNow.toISOString(); // Convert timestamp to ISO string, according to ThingSpeak bulk write documentation
        dataUpload.updates[i] = element; // Add element in the dataUpload object
      });

      // Disable save button
      $('#saveBtn').prop("disabled", true);
      // Show waiting banner
      $('#waitingImage').prop("hidden", false);
      $('#waitingText').prop("hidden", false);

      // Wait 15 seconds to avoid Thingspeak write limitations
      setTimeout(clearDB, 16000);
    });
});

/**********************************************************/
/*               Executed at page load                    */
/**********************************************************/
// Get data from Analysis Profiles channel
fetch(queryString)
  .then(response => response.json())
  .then(data => {
    // Collect downloaded data
    const feeds = data.feeds;
    data.feeds.forEach(function(feed, i, feeds) { // Loop through data.feeds elements
      // Check if this is the last entry (i.e. the one downladed by the device, i.e. the default one)
      let isLast = false;
      if (i === (data.feeds.length - 1)) {
        isLast = true;
      }
      // Add data to the "analyses" Map object
      analyses.set(feed.field1, {
        Vwe: feed.field2,
        Vre: JSON.parse(feed.field3),
        calibration: feed.field4,
        N_MIN: feed.field6,
        parameters: feed.field5,
        isLast: isLast,
      });
    });
    // Clear table by removing all "tr" tags of "tbody"
    $("#analysesTable>tbody>tr").remove();
    // Create a new temporary Map object holding an alphabetically sorted version
    // of the "analysis" object. This is useful when printing the HTML table
    const analysesSorted = new Map([...analyses.entries()].sort());
    // Populate table
    analysesSorted.forEach((analysis, analysisName) => { // Loop through analysesSorted elements
      // Add a entry in the selection list
      $("#selectAnalysisList").append(new Option(analysisName, analysisName));
      // Pretty print the JSON string held by parameters
      let parametersPrettyPrint = analysis.parameters.replace("{", ""); // Remove {
      parametersPrettyPrint = parametersPrettyPrint.replace("}", ""); // Remove }
      parametersPrettyPrint = parametersPrettyPrint.replace(/"/g, ""); // Remove all the "
      parametersPrettyPrint = parametersPrettyPrint.replace(/:/g, " = "); // Replace : with =
      parametersPrettyPrint = parametersPrettyPrint.replace(/,/g, ", "); // Add spaces after ,
      // Check if this is the active analysis (i.e. the one "in use")
      if (analysis.isLast) {
        // Analysis used by the device, write line in bold and append "(in use)" to the name
        // Moreover, check if calibration has alredy been done
        if (analysis.parameters === "To be calibrated") {
          // Link the "Calibrate" word to the calibration page
          $("#analysesTable>tbody").append("<tr><td><b>" + analysisName + " (in use)</b></td><td><b>" + analysis.Vwe + "</b></td><td><b>" + analysis.Vre.from + ", " + analysis.Vre.to + "</b></td><td><b>" + analysis.calibration + "</b></td><td><b>" + analysis.N_MIN + "</b></td><td><b><a href=\"newCalibration.html\">" + parametersPrettyPrint + "</a></b></td></tr>");
        } else {
          $("#analysesTable>tbody").append("<tr><td><b>" + analysisName + " (in use)</b></td><td><b>" + analysis.Vwe + "</b></td><td><b>" + analysis.Vre.from + ", " + analysis.Vre.to + "</b></td><td><b>" + analysis.calibration + "</b></td><td><b>" + analysis.N_MIN + "</b></td><td><b>" + parametersPrettyPrint + "</b></td></tr>");
        }
      } else {
        // Not used by the device, write line in normal
        $("#analysesTable>tbody").append("<tr><td>" + analysisName + "</td><td>" + analysis.Vwe + "</td><td>" + analysis.Vre.from + ", " + analysis.Vre.to + "</td><td>" + analysis.calibration + "</b></td><td>" + analysis.N_MIN + "</td><td>" + parametersPrettyPrint + "</td></tr>");
      }
    });
  });
