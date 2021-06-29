 // Syntax that MUST be used to write to field6 (parameters). Variables names (p1, p2, etc.) and numbers can be customized as needed.
 // e.g.:
 // https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"p1\":2,\"p2\":5,\"p3\":8}"
 // https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"var1\":2,\"p2\":5,\"alice3\":8,\"n15\":10e-2}"

 var calculateBtnPressed = false;
 var parametersReady = false;
 var acquisitionsReady = false;
 var newConcentration = false;

 var analysis = "";
 var concentration = "";
 var N_CAL = 0;
 var calibrationType = "";
 var parameters = "";

 var analysisVwe = "";
 var analysisVre = "";

 var dataUpload = {}; // Variable holding data to be written back to Analyses DB

 function pollDBCalibration() {

   // Check if the update is still needed
   if (parametersReady === false & calculateBtnPressed === true) {
     // Get last "parameters" value
     fetch("https://api.thingspeak.com/channels/1336115/fields/6?api_key=DKIU4QVAFAC8Z5T3&results=1")
       .then(response => response.json())
       .then(data => {
         // Check if field6 holds a valid "parameters" value
         if (JSON.parse(data.feeds[0].field6) != null) {
           // Save parameters in a local variable
           parameters = data.feeds[0].field6;
           // Init payload to be upladed in bulk
           dataUpload.write_api_key = "FVRA63GCX5781VVP";
           dataUpload.updates = [];
           // Update Analyses DB with the new parameters
           fetch("https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=100") // Get all data of Analyses DB
             .then(response => response.json())
             .then(data => {
               // Save data for the next bulk write of Analyses DB
               data.feeds.forEach((element, i) => {
                 delete element["entry_id"]; // Delete field not needed
                 if (element.field1 === analysis) { // If this is the record on which we are working,
                   element.field5 = parameters; // Write parameters field of Analyses DB
                 }
                 dataUpload.updates[i] = element; // Save entry
               });

               // // Save data to be preserved
               // analysisVwe = data.feeds[0].field2;
               // analysisVre = data.feeds[0].field3;

               // Clear Analyses DB
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

   // If the system is waiting for an acquisition
   if (newConcentration === true) {
     // Poll the calibration DB for a new acquisition
     fetch("https://api.thingspeak.com/channels/1336115/fields/3?api_key=DKIU4QVAFAC8Z5T3&results=1")
       .then(response => response.json())
       .then(data => {
         console.log(data);
         if ((JSON.parse(data.feeds[0].field3) != null)) {
           // Update the table
           const acquisitionValue = Number(JSON.parse(data.feeds[0].field3));
           const acquisitionValueExp = acquisitionValue.toExponential();
           $("#calibrationTable>tbody").append("<tr><td>" + concentration + "</td><td>" + acquisitionValueExp + "</td></tr>");
           $("#acquisitionWaitingText").text("Acquisition received, please wait while saving...");
           newConcentration = false; // Clear flag
           N_CAL++; // Increment the numer of calibration points
           // Wait 15 seconds before notifying the successful save to avoid Thingspeak limitations
           setTimeout(setAcquisitionSuccessfullySaved, 16000);
         }
       });
   }
 }

 function systemStart() {
   $('#systemWarning').prop("hidden", true);
   // Show calibration setup elements
   $("#calibrationSelection").prop("hidden", false);
 }

 function setRunScriptFlag() {
   // Rise flag for Thingspeak script execution
   fetch("https://api.thingspeak.com/update?api_key=H3KZKXZT2XZT47WM&field7=" + calibrationType);
   // console.log(calibrationType);
 }

 function writeCustomValue() {
   // Directly write the custom value in Calibration DB
   fetch("https://api.thingspeak.com/update?api_key=RHYL0DV01O1AMQ4Q&field6={\"threshold\":" + $("#thresholdInput").val() + "}");
 }

 function setSystemReadyForAcquisition() {
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
   // Write data to Analyses DB
   // fetch("https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field1=" + analysis + "&field2=" + analysisVwe + "&field3=" + analysisVre + "&field4=" + calibrationType + "&field5=" + parameters);
   fetch("https://api.thingspeak.com/channels/1311141/bulk_update.json", {
     method: "POST",
     headers: {
       'Content-Type': 'application/json'
     },
     body: JSON.stringify(dataUpload)
   })
     // Console debug
     .then(response => response.json())
     .then(data => {
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

 $('#customValueCheck').change(() => {
   if ($('#customValueCheck').is(":checked")) {
     $("#thresholdInputLabel").prop("hidden", false);
     $("#thresholdInputGroup").prop("hidden", false);
   } else {
     $("#thresholdInputLabel").prop("hidden", true);
     $("#thresholdInputGroup").prop("hidden", true);
   }

 });

 $("#calculateBtn").click(() => {
   // Build Thingspeak HTTP string
   const queryString = "https://api.thingspeak.com/update?api_key=RHYL0DV01O1AMQ4Q&field5=" + N_CAL + "&field4=" + analysis;
   // Write data to Thingspeak
   fetch(queryString);
   // Set button pressed flag
   calculateBtnPressed = true;
   $("#calibrationSaveConfirmImage").prop("hidden", true);
   $("#calibrationSaveConfirmText").prop("hidden", true);
   $("#calibrationWaitingImage").prop("hidden", false);
   $("#calibrationWaitingText").prop("hidden", false);
   // Disable all other controls
   disableAllControls(true);
   if ($("#calibrationTypeInput").val() === "Manual") { // Manual calibration
     // Wait 15 seconds to avoid Thingspeak limitations, then directly write the custom value
     setTimeout(writeCustomValue, 16000);
   } else { // Automatic calibration
     // Wait 15 seconds to avoid Thingspeak limitations, then trigger the script start
     setTimeout(setRunScriptFlag, 16000);
   }
 });

 $('#newCalilbrationBtn').click(() => {
   // Refresh page
   location.reload(true);
 });

 // Clear Calibration DB
 fetch("https://api.thingspeak.com/channels/1336115/feeds.json", {
   method: "DELETE",
   headers: {
     'Content-Type': 'application/json'
   },
   body: JSON.stringify({
     api_key: '1AW3WC2CLG1FYRZG' // User API key, from "My Profile" section
   })
 });

 // Get data from Thingspeak to populate the Analysis selection list
 fetch("https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=1")
   .then(response => response.json())
   .then(data => {
     // Collect downloaded data
     analysis = data.feeds[0].field1;
     $('#activeAnalysis').text(analysis);
     calibrationType = data.feeds[0].field4;
     $('#activeAnalysisCalibrationType').text(calibrationType);
   });

 // Wait 15 seconds to avoid Thingspeak limitations
 setTimeout(systemStart, 16000);

 // Poll Thingspeak to check if parameters have been calculated
 setInterval(pollDBCalibration, 2000); // every 2 seconds
