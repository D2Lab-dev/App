// Status flags for flow control
var calculateBtnPressed = false;
var parametersReady = false;
var acquisitionsReady = false;
var newConcentration = false;

// Cloud variables
var analysis = "";
var concentration = "";
var N_CAL = 0;
var calibrationType = "";
var parameters = "";

var analysisVwe = "";
var analysisVre = "";

// Variable holding data to be written back to Analyses DB
var dataUpload = {};

/******************************************************/
/* Function polling the "COVID19 - Calibration" channel */
/* to detect changes                                  */
/******************************************************/
function pollDBCalibration() {
  // Check if the Calculate button has been pressed but parameters are not computed yet
  if (parametersReady === false & calculateBtnPressed === true) {
    // Get last "parameters" value to chek if now they are ready
    fetch("https://api.thingspeak.com/channels/1336115/fields/6?api_key=DKIU4QVAFAC8Z5T3&results=1")
      .then(response => response.json())
      .then(data => {
        // Check if field6 holds a valid "parameters" value
        if (JSON.parse(data.feeds[0].field6) != null) {
          // Save parameters in a local variable
          parameters = data.feeds[0].field6;
          // Init dataUpload structure to be upladed in bulk
          // Ref: https://www.mathworks.com/help/thingspeak/bulkwritejsondata.html
          dataUpload.write_api_key = "FVRA63GCX5781VVP";
          dataUpload.updates = [];
          // Update Analyses channel with the new parameters
          fetch("https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=100") // Get all data of Analyses channel
            .then(response => response.json())
            .then(data => {
              // Save data for the next bulk write of Analyses channel
              data.feeds.forEach((element, i) => { // Loop through data.feeds elements
                delete element["entry_id"]; // Delete field not needed
                if (element.field1 === analysis) { // If this is the record on which we are working,
                  element.field5 = parameters; // Write parameters field of Analyses channel
                }
                dataUpload.updates[i] = element; // Save entry
              });

              // Clear Analyses DB
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
              // Signal that parameters have been calculated
              parametersReady = true;
              // Wait 15 seconds before writing to avoid Thingspeak limitations
              setTimeout(updateAnalysesDB, 16000);
            });
        }
      });
  }

  // If the system is waiting for an acquisition (i.e. a new concentration value has been entered
  // and the Acquire button has been pressed)
  if (newConcentration === true) {
    // Poll the Calibration channel for a new acquisition
    fetch("https://api.thingspeak.com/channels/1336115/fields/3?api_key=DKIU4QVAFAC8Z5T3&results=1") // Get all data from Calibration channel
      .then(response => response.json())
      .then(data => {
        console.log(data); // Debug
        // Check if field3 holds a valid "Acquisition" value
        if ((JSON.parse(data.feeds[0].field3) != null)) {
          // Update the page table with the new concentration-acquisition pair
          const acquisitionValue = Number(JSON.parse(data.feeds[0].field3)); // Convert JSON field to number
          const acquisitionValueExp = acquisitionValue.toExponential(); // Convert number to exponential notation
          $("#calibrationTable>tbody").append("<tr><td>" + concentration + "</td><td>" + acquisitionValueExp + "</td></tr>"); // Add HTML table entry
          $("#acquisitionWaitingText").text("Acquisition received, please wait while saving..."); // Update waiting message
          newConcentration = false; // Clear flag
          N_CAL++; // Increment the numer of calibration points
          // Wait 15 seconds before notifying the successful save to avoid Thingspeak limitations
          setTimeout(setAcquisitionSuccessfullySaved, 16000);
        }
      });
  }
}

function systemStart() {
  // Hide initial setup warning
  $('#systemWarning').prop("hidden", true);
  // Show calibration setup elements
  $("#calibrationSelection").prop("hidden", false);
}

function setRunScriptFlag() {
  // Rise flag for Thingspeak script execution
  fetch("https://api.thingspeak.com/update?api_key=H3KZKXZT2XZT47WM&field7=" + calibrationType);
}

function writeCustomValue() {
  // Directly write the custom value in Calibration channel
  fetch("https://api.thingspeak.com/update?api_key=RHYL0DV01O1AMQ4Q&field6={\"threshold\":" + $("#thresholdInput").val() + "}");
}

function setSystemReadyForAcquisition() {
  // Update message banner
  $("#acquisitionWarningImage").prop("hidden", true);
  $("#acquisitionWarningText").prop("hidden", true);
  $("#acquisitionWaitingImage").prop("hidden", false);
  $("#acquisitionWaitingText").prop("hidden", false);
  $("#acquisitionWaitingText").text("System ready, waiting for the acquisition...");
  newConcentration = true;
}

function setAcquisitionSuccessfullySaved() {
  // Notify the successfull save
  $("#acquisitionWaitingImage").prop("hidden", true);
  $("#acquisitionWaitingText").prop("hidden", true);
  $("#acquisitionSaveConfirmImage").prop("hidden", false);
  $("#acquisitionSaveConfirmText").prop("hidden", false);
  // Enable all other controls
  disableAllControls(false);
}

function updateAnalysesDB() {
  // Bulk write updated data to Analyses channel
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
  // Pretty print the JSON string held by parameters
  let parametersPrettyPrint = parameters.replace("{", ""); // Remove {
  parametersPrettyPrint = parametersPrettyPrint.replace("}", ""); // Remove }
  parametersPrettyPrint = parametersPrettyPrint.replace(/"/g, ""); // Remove all the "
  parametersPrettyPrint = parametersPrettyPrint.replace(/:/g, " = "); // Replace : with =
  parametersPrettyPrint = parametersPrettyPrint.replace(/,/g, ", "); // Add spaces after ,
  $("#parametersField").val(parametersPrettyPrint);
  // Show confirmation banner
  $("#calibrationWaitingImage").prop("hidden", true);
  $("#calibrationWaitingText").prop("hidden", true);
  $("#calibrationSaveConfirmImage").prop("hidden", false);
  $("#calibrationSaveConfirmText").prop("hidden", false);
  // Enable "Start new calibration" button
  $('#newCalilbrationBtn').prop("disabled", false);
}

/******************************************************/
/*  Function to quickly enable/disable page elements  */
/******************************************************/
function disableAllControls(val) {
  $('#selectAnalysisList').prop("disabled", val);
  $('#newConcentrationInput').prop("disabled", val);
  $('#calibrationTypeInput').prop("disabled", val);
  $('#newSampleBtn').prop("disabled", val);
  $('#calculateBtn').prop("disabled", val);
  $('#newCalilbrationBtn').prop("disabled", val);
  $('#customValueCheck').prop("disabled", val);
  $('#thresholdInput').prop("disabled", val);
}

/**********************************************************/
/* Executed on "Calibration Process" dropdown menu change */
/**********************************************************/
$('#calibrationTypeInput').change(() => {
  if ($('#calibrationTypeInput').val() === "Manual") {
    // Show manual threshold option
    $("#autoCalibrationForm").prop("hidden", true);
    $("#manualCalibrationForm").prop("hidden", false);
    $("#buttonsForm").prop("hidden", false);
    $("#customValueCheckGroup").prop("hidden", false);
    $("#thresholdInputLabel").prop("hidden", false);
    $("#thresholdInputGroup").prop("hidden", false);
  } else if ($('#calibrationTypeInput').val() === "Automatic") {
    // Show automatic threshold option
    $("#autoCalibrationForm").prop("hidden", false);
    $("#manualCalibrationForm").prop("hidden", true);
    $("#buttonsForm").prop("hidden", false);
    $('#customValueCheckGroup').prop("hidden", false);
    $('#customValueCheck').prop('checked', false);
    $("#thresholdInputLabel").prop("hidden", true);
    $("#thresholdInputGroup").prop("hidden", true);
  } else {
    // Hide all
    $("#autoCalibrationForm").prop("hidden", true);
    $("#manualCalibrationForm").prop("hidden", true);
    $("#buttonsForm").prop("hidden", true);
    $("#customValueCheckGroup").prop("hidden", true);
    $('#customValueCheck').prop('checked', false);
    $("#thresholdInputLabel").prop("hidden", true);
    $("#thresholdInputGroup").prop("hidden", true);
  }
});

/**********************************************************/
/*      Executed on "Acquire New Sample" button click     */
/**********************************************************/
$('#newSampleBtn').click(() => {
  // Get form data
  concentration = $("#newConcentrationInput").val();
  // Build Thingspeak HTTP string
  const queryString = "https://api.thingspeak.com/update?api_key=RHYL0DV01O1AMQ4Q&field1=" + analysis + "&field2=" + concentration;
  // Write data to Thingspeak
  fetch(queryString);
  // Show warning banner
  $("#acquisitionSaveConfirmImage").prop("hidden", true);
  $("#acquisitionSaveConfirmText").prop("hidden", true);
  $("#acquisitionWarningImage").prop("hidden", false);
  $("#acquisitionWarningText").prop("hidden", false);
  // Disable all other controls
  disableAllControls(true);
  // Wait 15 seconds to avoid limitations on Thingspeak
  setTimeout(setSystemReadyForAcquisition, 16000);
});

/**********************************************************/
/*       Executed on "Calculate/Update" button click      */
/**********************************************************/
$("#calculateBtn").click(() => {
  // Build Thingspeak HTTP string to write N_CAL and analysis name
  const queryString = "https://api.thingspeak.com/update?api_key=RHYL0DV01O1AMQ4Q&field5=" + N_CAL + "&field4=" + analysis;
  // Write data to Thingspeak
  fetch(queryString);
  // Set button pressed flag
  calculateBtnPressed = true;
  // Show waiting banner
  $("#calibrationSaveConfirmImage").prop("hidden", true);
  $("#calibrationSaveConfirmText").prop("hidden", true);
  $("#calibrationWaitingImage").prop("hidden", false);
  $("#calibrationWaitingText").prop("hidden", false);
  // Disable all other controls
  disableAllControls(true);
  // Check the calibration type selected (auto/manual)
  if ($("#calibrationTypeInput").val() === "Manual") { // Manual calibration
    // Wait 15 seconds to avoid Thingspeak limitations, then directly write the custom value
    setTimeout(writeCustomValue, 16000);
  } else { // Automatic calibration
    // Wait 15 seconds to avoid Thingspeak limitations, then trigger the script start
    setTimeout(setRunScriptFlag, 16000);
  }
});

/**********************************************************/
/*    Executed on "Start New Calibration" button click    */
/**********************************************************/
$('#newCalilbrationBtn').click(() => {
  // Refresh page to start a new calibration session
  location.reload(true);
});

/**********************************************************/
/*               Executed at page load                    */
/**********************************************************/
// Clear Calibration channel
fetch("https://api.thingspeak.com/channels/1336115/feeds.json", {
  method: "DELETE",
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    api_key: '1AW3WC2CLG1FYRZG' // User API key, from "My Profile" section
  })
});

// Get data from Thingspeak to fill the top-page description message
fetch("https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=1")
  .then(response => response.json())
  .then(data => {
    // Collect downloaded data
    analysis = data.feeds[0].field1;
    $('#activeAnalysis').text(analysis); // Set the activeAnalysis tag of the message
    calibrationType = data.feeds[0].field4;
    $('#activeAnalysisCalibrationType').text(calibrationType); // Set the activeAnalysisCalibrationType tag of the message
  });

// Wait 15 seconds to avoid Thingspeak limitations before showing all page elements
setTimeout(systemStart, 16000);

// Poll Thingspeak to check if parameters have been calculated
setInterval(pollDBCalibration, 2000); // Repeat the call to pollDBCalibration function every 2 seconds
