// https://api.thingspeak.com/update?api_key=RHYL0DV01O1AMQ4Q&field1=15&field2=an1&field3=XXXXXXXXXXXXXXXX&field4=true

// Globals and constants
const queryString = "https://api.thingspeak.com/channels/1336115/feeds.json?api_key=DKIU4QVAFAC8Z5T3&results=100";
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
      // Add individual elements to selection list only once
      if (!listOptions.find(element => element === test.field3)) {
        listOptions.push(test.field3);
        $("#selectCFList").append(new Option(test.field3, test.field3));
      }
    });
  });

  // Act on the selection list
  $("#selectCFList").change(() => {
    // Clear table by removing all "tr" tags of "tbody"
    $("#resultsTable>tbody>tr").remove();

    // Populate table
    let nEntry = 0;
    tests.forEach(function(test, i, tests) {
      if (test.field3 === $("#selectCFList").val()) {
        // Add entry to the table
        nEntry++;
        // Convert test result true/false in positive/negative strings
        let testResult = ""
        if (test.field4 === "true") {
          testResult = "Positive";
        } else {
          testResult = "Negative";
        }
        $("#resultsTable>tbody").append("<tr><td>" + nEntry + "</td><td>" + testResult + "</td></tr>");
      }
    });
  });
