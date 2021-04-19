// Syntax that MUST be used to write to field6 (parameters). Variables names (p1, p2, etc.) and numbers can be customized as needed.
// e.g.:
// https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"p1\":2,\"p2\":5,\"p3\":8}"
// https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"var1\":2,\"p2\":5,\"alice3\":8,\"n15\":10e-2}"

var calculateBtnPressed = false;
var parametersReady = false;

function checkParameters() {
  // Check if the update is still needed
  if (parametersReady === false & calculateBtnPressed === true) {
    // Get last "parameters" value
    fetch("https://api.thingspeak.com/channels/814496/fields/8?api_key=1PKL71LY43MFGVMI&results=1")
    .then(response => response.json())
    .then(data => {
      console.log(data.feeds[0].field8);
      // Check if field6 holds a valid "parameters" value
      if (JSON.parse(data.feeds[0].field8)[0] != "pending") {
        // Pretty print the JSON string held by field6
        // let parametersPrettyPrint = JSON.parse(data.feeds[0].field8);
        let parametersPrettyPrint = data.feeds[0].field8;
        parametersPrettyPrint = parametersPrettyPrint.replace("{",""); // Remove {
        parametersPrettyPrint = parametersPrettyPrint.replace("}",""); // Remove }
        parametersPrettyPrint = parametersPrettyPrint.replace(/"/g,""); // Remove all the "
        parametersPrettyPrint = parametersPrettyPrint.replace(/:/g," = "); // Replace : with =
        parametersPrettyPrint = parametersPrettyPrint.replace(/,/g,", "); // Add spaces after ,
        $("#parametersField").val(parametersPrettyPrint);
        // Show confirmation banner
        $("#waitingImage").prop("hidden", true);
        $("#waitingText").prop("hidden", true);
        $("#saveConfirmImage").prop("hidden", false);
        $("#saveConfirmText").prop("hidden", false);
        // Signal parameters have been calculated
        parametersReady = true;
      }
    });
  }
}

$("#calculateBtn").click(() => {
  // Get form data
  const calibration = $("#calibrationTypeInput").val();
  const concentrationVector = "[" + $("#concentrationVectorInput").val() + "]";
  const parameters = "[\"pending\"]";
  // Build Thingspeak HTTP string
  const queryString = "https://api.thingspeak.com/update?api_key=SWDE0VGCDPJH2QW3&field7=" + concentrationVector + "&field8=" + parameters;
  // Write data to Thingspeak
  fetch(queryString);
  // Set button pressed flag
  calculateBtnPressed = true;
  $("#saveConfirmImage").prop("hidden", true);
  $("#saveConfirmText").prop("hidden", true);
  $("#waitingImage").prop("hidden", false);
  $("#waitingText").prop("hidden", false);
});

// Get data from Thingspeak
fetch("https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=100")
  .then(response => response.json())
  .then(data => {
    // Collect downloaded data
        const feeds = data.feeds;
        data.feeds.forEach(function(feed, i, feeds) {
          // Add a new entry in the selection list
          $("#selectAnalysisList").append(new Option(feed.field1, feed.field1));
        });
  });

// Poll Thingspeak to check if parameters have been calculated
setInterval(checkParameters, 2000); // every 2 seconds
