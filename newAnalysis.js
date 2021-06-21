// Syntax that MUST be used to write to field6 (parameters). Variables names (p1, p2, etc.) and numbers can be customized as needed.
// e.g.:
// https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"p1\":2,\"p2\":5,\"p3\":8}"
// https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"var1\":2,\"p2\":5,\"alice3\":8,\"n15\":10e-2}"

$("#saveBtn").click(() => {
  // Get form data
  const name = $("#analysisNameInput").val();
  const Vwe = $("#VweInput").val();
  const Vre = JSON.stringify({
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

  $("#saveConfirmImage").prop("hidden", false);
  $("#saveConfirmText").prop("hidden", false);

});

$("#calibrationBtn").click(() => {

});
