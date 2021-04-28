 // Syntax that MUST be used to write to field6 (parameters). Variables names (p1, p2, etc.) and numbers can be customized as needed.
 // e.g.:
 // https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"p1\":2,\"p2\":5,\"p3\":8}"
 // https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field6="{\"var1\":2,\"p2\":5,\"alice3\":8,\"n15\":10e-2}"

 var calculateBtnPressed = false;
 var parametersReady = false;
 var acquisitionsReady = false;

 var analysis = "";

 function pollDBCalibration() {

   // Check if the update is still needed
   if (parametersReady === false & calculateBtnPressed === true) {
     // Get last "parameters" value
     fetch("https://api.thingspeak.com/channels/1336115/fields/5?api_key=DKIU4QVAFAC8Z5T3&results=1")
       .then(response => response.json())
       .then(data => {
         // Check if field5 holds a valid "parameters" value
         if (JSON.parse(data.feeds[0].field5) != null) {
           // Save parameters in a local variable
           let parameters = data.feeds[0].field5;
           // Update Analyses DB with the new parameters
           fetch("https://api.thingspeak.com/channels/1311141/feeds.json?api_key=14XPPECCU0XV7VCU&results=100") // Get all data in Analyses DB
           .then(response => response.json())
           .then(data => {
             // Collect downloaded data
             const feeds = data.feeds;
             let analyses = [];
             data.feeds.forEach(function(feed, i, feeds) {
               // Delete fields not needed for the update of Analyses DB
               // delete feed["created_at"];
               feed.created_at = new Date;
               feed.created_at = feed.created_at.valueOf() + i;
               feed.created_at = feed.created_at.toString();
               // feed.delta_t = i;
               delete feed["entry_id"];
               // Check if this entry is the one we are working on
               if (feed.field1 === analysis) {
                 // Update with the new parameters
                 feed.field5 = parameters;
               } else {
                 feed.field5 = "null";
               }
               // Store entry in the local "analyses" JSON array
               analyses[i] = feed;
             });
             // Delete all data in Analyses DB
             // fetch("https://api.thingspeak.com/channels/1311141/feeds.json?api_key=FVRA63GCX5781VVP", "DELETE")
             // Write single analysis. If more than one analysis is enabled, the code must be changed to a bulk write (see the next commented lines)
             fetch("https://api.thingspeak.com/update?api_key=FVRA63GCX5781VVP&field1=" + analyses[0].field1 + "&field2=" + analyses[0].field2 + "&field3=" + analyses[0].field3 + "&field4=" + analyses[0].field4 + "&field5=" + analyses[0].field5)

             // Write new data in bulk mode (https://it.mathworks.com/help/thingspeak/bulkwritejsondata.html)
             // let writeData = "{\"write_api_key\": \"FVRA63GCX5781VVP\", \"updates\":" + JSON.stringify(analyses) + "}";
             // console.log(writeData);
             //
             // fetch("https://api.thingspeak.com/channels/1311141/bulk_update.json", {
             //   method: 'POST',
             //   // mode: 'no-cors',
             //   headers: {'Content-Type': 'application/json'},
             //   body: {writeData}
             // });
             // .then(respon
           });
           // Pretty print the JSON string held by field5
           let parametersPrettyPrint = parameters.replace("{", ""); // Remove {
           parametersPrettyPrint = parametersPrettyPrint.replace("}", ""); // Remove }
           parametersPrettyPrint = parametersPrettyPrint.replace(/"/g, ""); // Remove all the "
           parametersPrettyPrint = parametersPrettyPrint.replace(/:/g, " = "); // Replace : with =
           parametersPrettyPrint = parametersPrettyPrint.replace(/,/g, ", "); // Add spaces after ,
           $("#parametersField").val(parametersPrettyPrint);
           // Show confirmation banner
           $("#waitingImage").prop("hidden", true);
           $("#waitingText").prop("hidden", true);
           $("#saveConfirmImage").prop("hidden", false);
           $("#saveConfirmText").prop("hidden", false);
           // Signal that parameters have been calculated
           parametersReady = true;
         }
       });
   }
   if (acquisitionsReady === false) {
     // Get last "acquisitions" value
     fetch("https://api.thingspeak.com/channels/1336115/fields/4?api_key=DKIU4QVAFAC8Z5T3&results=1")
       .then(response => response.json())
       .then(data => {
         console.log(data.feeds[0].field4);
         if (JSON.parse(data.feeds[0].field4) != null) {
           // Wait >15 seconds, then set the flag to run the script
           console.log("timout function start");
           setTimeout(setRunScriptFlag, 17000);
           acquisitionsReady = true;
         }
       });
   }
 }

 function setRunScriptFlag() {
   // Rise flag for Thingspeak script execution
   fetch("https://api.thingspeak.com/update?api_key=H3KZKXZT2XZT47WM&field7=true");
   console.log("timout function end");
}

 $("#calculateBtn").click(() => {
   // Get form data
   const concentrationVector = "[" + $("#concentrationVectorInput").val() + "]";
   const N_CAL = JSON.parse(concentrationVector).length;
   analysis = $("#selectAnalysisList").val();
   const acquisitions = "[\"pending\"]";
   const parameters = "[\"pending\"]";
   // Build Thingspeak HTTP string
   const queryString = "https://api.thingspeak.com/update?api_key=RHYL0DV01O1AMQ4Q&field1=" + N_CAL + "&field2=" + analysis + "&field3=" + concentrationVector; // + "&field4=" + acquisitions + "&field5=" + parameters;
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
 setInterval(pollDBCalibration, 2000); // every 2 seconds
