// User login check
$("#userLoginBtn").click(() => {
  if ($("#userPINInput").val() === "0000") {
    window.location.href = window.location.href.split("index.html")[0] + "/newCalibration.html"
  } else {
    $("#userLogin").modal('toggle');
    $("#wrongPIN").modal('toggle');
  }
});

// Technician login check
$("#technicianLoginBtn").click(() => {
  if ($("#technicianPINInput").val() === "0000") {
    window.location.href = window.location.href.split("index.html")[0] + "/newAnalysis.html"
  } else {
    $("#technicianLogin").modal('toggle');
    $("#wrongPIN").modal('toggle');
  }
});
