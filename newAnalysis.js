var calculateBtnPressed = false;
var parametersReady = false;

function checkParameters() {
  // Check if the update is still needed
  if (parametersReady === false & calculateBtnPressed === true) {
    // Get last "parameters" value
    fetch("https://api.thingspeak.com/channels/1311141/fields/6?api_key=14XPPECCU0XV7VCU&results=1")
    .then(response => response.json())
    .then(data => {
      console.log(data.feeds[0].field6);
      if (JSON.parse(data.feeds[0].field6)[0] != "pending") {
        $("#parametersField").val(JSON.parse(data.feeds[0].field6)[0]);
        $("#waitingImage").prop("hidden", true);
        $("#waitingText").prop("hidden", true);
        $("#saveConfirmImage").prop("hidden", false);
        $("#saveConfirmText").prop("hidden", false);
        parametersReady = true;
      }
    });
  }
}

$("#calculateBtn").click(() => {
  // Get form data
  const name = $("#analysisNameInput").val();
  const Vwe = $("#VweInput").val();
  const Vre = JSON.stringify({
    from: $("#VreFromInput").val(),
    to: $("#VreToInput").val()
  });
  const calibration = $("#calibrationTypeInput").val();
  const concentrationVector = "[" + $("#concentrationVectorInput").val() + "]";
  const parameters = "[\"pending\"]";
  // Build Thingspeak HTTP string
  const queryString = "https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field1=" + name +
    "&field2=" + Vwe +
    "&field3=" + Vre +
    "&field4=" + calibration +
    "&field5=" + concentrationVector +
    "&field6=" + parameters;
  // Write data to Thingspeak
  fetch(queryString);
  // Set button pressed flag
  calculateBtnPressed = true;
  $("#waitingImage").prop("hidden", false);
  $("#waitingText").prop("hidden", false);
});

// Poll Thingspeak to check if parameters have been calculated
setInterval(checkParameters, 2000); // every 2 seconds
