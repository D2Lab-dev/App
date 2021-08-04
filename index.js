// Administrator login check
$("#administratorLoginBtn").click(() => { // Administrator login button pressed
  if ($("#administratorPINInput").val() === "0000") { // Check if PIN is correct
    window.location.href = window.location.href.split("index.html")[0] + "overview.html" // Redirect to overview.html page
  } else {
    // Error, wrong PIN
    $("#administratorLogin").modal('toggle');
    $("#wrongPIN").modal('toggle');
  }
});
