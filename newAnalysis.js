$("#saveBtn").click(() => { // "Save Changes" button pressed
  // Save form data to variables
  const name = $("#analysisNameInput").val();
  const Vwe = $("#VweInput").val();
  const Vre = JSON.stringify({ // Convert to JSON string
    from: $("#VreFromInput").val(),
    to: $("#VreToInput").val()
  });
  const calibration = $("#calibrationTypeInput").val();
  const N_MIN = $("#N_MIN_input").val();
  // Build Thingspeak HTTP string
  const queryString = "https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field1=" + name +
    "&field2=" + Vwe +
    "&field3=" + Vre +
    "&field4=" + calibration +
    "&field5=" + "To be calibrated" +
    "&field6=" + N_MIN;
  // Write data to Thingspeak
  fetch(queryString);
  // Show confirm banner
  $("#saveConfirmImage").prop("hidden", false);
  $("#saveConfirmText").prop("hidden", false);
});
