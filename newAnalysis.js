// Syntax that MUST be used to write to field6 (parameters). Variables names (p1, p2, etc.) and numbers can be customized as needed.
// e.g.:
// https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"p1\":2,\"p2\":5,\"p3\":8}"
// https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"var1\":2,\"p2\":5,\"alice3\":8,\"n15\":10e-2}"

// var calculateBtnPressed = false;
// var parametersReady = false;

// function checkParameters() {
//   // Check if the update is still needed
//   if (parametersReady === false & calculateBtnPressed === true) {
//     // Get last "parameters" value
//     fetch("https://api.thingspeak.com/channels/1311141/fields/6?api_key=14XPPECCU0XV7VCU&results=1")
//     .then(response => response.json())
//     .then(data => {
//       console.log(data.feeds[0].field6);
//       // Check if field6 holds a valid "parameters" value
//       if (JSON.parse(data.feeds[0].field6)[0] != "pending") {
//         // Pretty print the JSON string held by field6
//         // let parametersPrettyPrint = JSON.parse(data.feeds[0].field6);
//         // parametersPrettyPrint = parametersPrettyPrint.replace("{",""); // Remove {
//         // parametersPrettyPrint = parametersPrettyPrint.replace("}",""); // Remove }
//         // parametersPrettyPrint = parametersPrettyPrint.replace(/"/g,""); // Remove all the "
//         // parametersPrettyPrint = parametersPrettyPrint.replace(/:/g," = "); // Replace : with =
//         // parametersPrettyPrint = parametersPrettyPrint.replace(/,/g,", "); // Add spaces after ,
//         // $("#parametersField").val(parametersPrettyPrint);
//         // Show confirmation banner
//         $("#waitingImage").prop("hidden", true);
//         $("#waitingText").prop("hidden", true);
//         $("#saveConfirmImage").prop("hidden", false);
//         $("#saveConfirmText").prop("hidden", false);
//         // Signal parameters have been calculated
//         parametersReady = true;
//       }
//     });
//   }
// }

$("#saveBtn").click(() => {
  // Get form data
  const name = $("#analysisNameInput").val();
  const Vwe = $("#VweInput").val();
  const Vre = JSON.stringify({
    from: $("#VreFromInput").val(),
    to: $("#VreToInput").val()
  });
  const calibration = $("#calibrationTypeInput").val();
  // const concentrationVector = "[" + $("#concentrationVectorInput").val() + "]";
  // const parameters = "[\"pending\"]";
  // Build Thingspeak HTTP string
  const queryString = "https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field1=" + name +
    "&field2=" + Vwe +
    "&field3=" + Vre +
    "&field4=" + calibration +
    "&field5=" + "pending"; // +
    // "&field6=" + parameters;
  // Write data to Thingspeak
  fetch(queryString);

  $("#saveConfirmImage").prop("hidden", false);
  $("#saveConfirmText").prop("hidden", false);

});

// $("#calculateBtn").click(() => {
//   // Get form data
//   const name = $("#analysisNameInput").val();
//   const Vwe = $("#VweInput").val();
//   const Vre = JSON.stringify({
//     from: $("#VreFromInput").val(),
//     to: $("#VreToInput").val()
//   });
//   const calibration = $("#calibrationTypeInput").val();
//   const concentrationVector = "[" + $("#concentrationVectorInput").val() + "]";
//   const parameters = "[\"pending\"]";
//   // Build Thingspeak HTTP string
//   const queryString = "https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field1=" + name +
//     "&field2=" + Vwe +
//     "&field3=" + Vre +
//     "&field4=" + calibration +
//     "&field5=" + concentrationVector +
//     "&field6=" + parameters;
//   // Write data to Thingspeak
//   fetch(queryString);
//   // Set button pressed flag
//   calculateBtnPressed = true;
//   $("#waitingImage").prop("hidden", false);
//   $("#waitingText").prop("hidden", false);
// });

// Poll Thingspeak to check if parameters have been calculated
// setInterval(checkParameters, 2000); // every 2 seconds
