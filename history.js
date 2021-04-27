// https://api.thingspeak.com/update?api_key=RHYL0DV01O1AMQ4Q&field1=15&field2=an1&field3=XXXXXXXXXXXXXXXX&field4=true

// Globals and constants
const queryString = "https://api.thingspeak.com/channels/814496/feeds.json?api_key=1PKL71LY43MFGVMI&results=100";
var tests;
var testsMap = new Map(); // Create Map object to hold data (acts like a local database)

// Get data from Thingspeak
fetch(queryString)
  .then(response => response.json())
  .then(data => {
    // Collect downloaded data using "CF" as the key value
    tests = data.feeds;
    let listOptions = [];

    tests.forEach(function(test, i, tests) {
      // Add individual elements to selection list only once and only if not null
      if (!listOptions.find(element => element === test.field6) & test.field6 != null) {
        listOptions.push(test.field6);
        $("#selectCFList").append(new Option(test.field6, test.field6));
      }
    });
  });

  // Act on the selection list
  $("#selectCFList").change(() => {
    // Clear table by removing all "tr" tags of "tbody"
    $("#resultsTable>tbody>tr").remove();
    $("#resultsTableContainer").removeClass("scroll-table");

    // Clear chart
    chart.data.labels = [];
    chart.data.datasets[0].data = [];

    // Populate table
    let nEntry = 0;
    tests.forEach(function(test, i, tests) {
      if (test.field6 === $("#selectCFList").val()) {
        // Add entry to the table
        nEntry++;
        // Convert test result true/false in positive/negative strings and 0/1 numbers
        let testResult = "";
        let testResultNum = 0;
        if (test.field8 === "true") {
          testResult = "Positive";
          testResultNum = 1;
        } else {
          testResult = "Negative";
          testResultNum = 0;
        }
        // Pretty print timestamp
        let timestampPrint = test.created_at;
        timestampPrint = timestampPrint.replace("T"," "); // Replace "T" with a space
        timestampPrint = timestampPrint.replace("Z",""); // Remove "Z"
        $("#resultsTable>tbody").append("<tr><td>" + timestampPrint + "</td><td>" + test.field5 + "</td><td>" + test.field7 + "</td><td>" + testResult + "</td></tr>");

        // Add data to chart
        chart.data.labels.push(timestampPrint)
        chart.data.datasets[0].data.push(testResultNum);
      }
    });
    // Manage scroll trigger
    if (nEntry > 10) {
      $("#resultsTableContainer").addClass("scroll-table");
      $("#resultsTableContainer").css({"height": 10*41 + "px"}); // 10 rows (header + data) of 41 pixels height are shown, the rest is scrollable
    }

    // Update chart with new values
    chart.update();
  });

// Draw chart
var chart = new Chart($("#testResultChart"), {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Test result',
            data: [],
            backgroundColor: ['#cfe2ff'],
            borderColor: ['#0d6efd'],
            borderWidth: 1,
            stepped: 'true'
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
