// Globals and constants
const queryString = "https://api.thingspeak.com/channels/814496/feeds.json?api_key=1PKL71LY43MFGVMI&results=100";
var tests;
var CFs;

var listOptionsCF = [];

/**********************************************************/
/* Executed on "Social Security No" dropdown menu change  */
/**********************************************************/
$("#selectCFList").change(() => {

  // Clear Analysis list and show its default message "Select type of analysis ..."
  $("#selectAnalysisList").empty().append(new Option("Select type of analysis ...", "Select type of analysis ..."));

  // Clear table by removing all "tr" tags of "tbody"
  $("#resultsTable>tbody>tr").remove();
  $("#resultsTableContainer").removeClass("scroll-table");

  // Clear chart
  chart.data.labels = [];
  chart.data.datasets[0].data = []; // Positives dataset
  chart.data.datasets[1].data = []; // Negatives dataset
  // Update chart with empty values
  chart.update();

  // Filter data using "Analysis" as the key value
  let listOptionsAnalysis = [];
  tests.forEach(function(test, i, tests) { // Loop through "tests" elements
    // Add individual elements to the Analysis selection list only once, only if field6 matches the selection of CF, and only if not null
    if (!listOptionsAnalysis.find(element => element === test.field7) & $("#selectCFList").val() === test.field6 & test.field7 != null) {
      listOptionsAnalysis.push(test.field7); // Add value to the "listOptionsAnalysis" object
      $("#selectAnalysisList").append(new Option(test.field7, test.field7)); // Add value to the dropdown selection list
    }
  });
});

/**********************************************************/
/*  Executed on "Type of Analysis" dropdown menu change   */
/**********************************************************/
$("#selectAnalysisList").change(() => {
  // Clear table by removing all "tr" tags of "tbody"
  $("#resultsTable>tbody>tr").remove();
  $("#resultsTableContainer").removeClass("scroll-table");

  // Clear chart
  chart.data.labels = [];
  chart.data.datasets[0].data = []; // Positives dataset
  chart.data.datasets[1].data = []; // Negatives dataset

  // Populate table
  let nEntry = 0; // Number of entries counter
  tests.forEach(function(test, i, tests) { // Loop through "tests" elements
    // Add entry only if field6 and field7 match the selections of CF and Analysis select lists
    if (test.field6 === $("#selectCFList").val() & test.field7 === $("#selectAnalysisList").val()) {
      // Add entry to the table
      nEntry++; // Increase counter
      // Convert test result true/false in positive/negative strings and 0/1 numbers
      let testResult = "";
      let testResultNumPos = 0;
      let testResultNumNeg = 0;
      if (test.field8 === "true") {
        testResult = "Positive";
        testResultNumPos = 1;
      } else {
        testResult = "Negative";
        testResultNumNeg = 1;
      }
      // Pretty print timestamp
      let timestampPrint = test.created_at;
      timestampPrint = timestampPrint.replace("T"," "); // Replace "T" with a space
      timestampPrint = timestampPrint.replace("Z",""); // Remove "Z"
      $("#resultsTable>tbody").append("<tr><td>" + timestampPrint + "</td><td>" + test.field5 + "</td><td>" + test.field7 + "</td><td>" + testResult + "</td></tr>");

      // Add data to chart
      chart.data.labels.push(timestampPrint)
      chart.data.datasets[0].data.push(testResultNumPos); // Positives dataset
      chart.data.datasets[1].data.push(testResultNumNeg); // Negatives dataset
    }
  });
  // Manage scroll trigger
  if (nEntry > 6) { // The scroll appears only if the table entries are more than 6
    $("#resultsTableContainer").addClass("scroll-table");
    $("#resultsTableContainer").css({"height": 6*41 + "px"}); // 10 rows (header + data) of 41 pixels height are shown, the rest is scrollable
  }

  // Update chart with new values
  chart.update();

});

/**********************************************************/
/*               Executed at page load                    */
/**********************************************************/
// Get data from "calibrazione dispositivo" Thingspeak channel
fetch(queryString)
  .then(response => response.json())
  .then(data => {
    // Collect downloaded data using "CF" as the key value
    tests = data.feeds;

    tests.forEach(function(test, i, tests) { // Loop through "tests" elements
      // Add individual elements to the CF selection list only once and only if not null
      if (!listOptionsCF.find(element => element === test.field6) & test.field6 != null) {
        listOptionsCF.push(test.field6); // Add value to the "listOptionsCF" object
        $("#selectCFList").append(new Option(test.field6, test.field6)); // Add value to the dropdown selection list
      }
    });
  });

// Draw chart
// Ref: https://www.chartjs.org/docs/latest/
var chart = new Chart($("#testResultChart"), {
    type: 'bar',
    data: {
        labels: [],
        datasets: [
          {
            label: 'Test Positive',
            data: [],
            backgroundColor: ['#ffadad'],
            borderColor: ['#ff3333'],
            borderWidth: 2,
            borderSkipped: false,
        },
        {
          label: 'Test Negative',
          data: [],
          backgroundColor: ['#c8ffb2'],
          borderColor: ['#48ff00'],
          borderWidth: 2,
          borderSkipped: false,
        }]
    },
    options: {
      responsive: true,
      scales: {
          y: {
              display: false
          },
          x: {
            ticks: {
              maxRotation: 90,
              minRotation: 90
            }
          }
      }
    }
});
